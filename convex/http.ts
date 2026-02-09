import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler for user events
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the Svix headers for verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(
        JSON.stringify({ error: "Missing Svix headers" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the raw body for verification
    const rawBody = await request.text();

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let body: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      body = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof body;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process verified webhook
    const eventType = body.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = body.data;

      const primaryEmail = email_addresses?.find(
        (e) => e.id === body.data.primary_email_address_id
      );

      await ctx.runMutation(internal.users.upsertUser, {
        clerkId: id,
        email: primaryEmail?.email_address ?? "",
        name: [first_name, last_name].filter(Boolean).join(" ") || undefined,
        imageUrl: image_url,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Map Polar plan/product names to our plan types
function mapPolarPlanToInternal(polarPlan: string): "free" | "pro" | "team" {
  const lowerPlan = polarPlan.toLowerCase();
  if (lowerPlan.includes("team") || lowerPlan.includes("business")) {
    return "team";
  }
  if (lowerPlan.includes("pro") || lowerPlan.includes("professional")) {
    return "pro";
  }
  return "free";
}

// Map Polar status to our status
function mapPolarStatus(
  polarStatus: string
): "active" | "canceled" | "past_due" | "trialing" {
  switch (polarStatus.toLowerCase()) {
    case "active":
    case "succeeded":
      return "active";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "past_due":
    case "overdue":
      return "past_due";
    case "trialing":
    case "trial":
      return "trialing";
    default:
      // Unknown status should be treated as canceled to avoid granting access
      console.warn(`Unknown Polar status received: "${polarStatus}", treating as canceled`);
      return "canceled";
  }
}

// Verify Polar/Standard Webhooks signature
// See: https://www.standardwebhooks.com/
async function verifyPolarSignature(
  rawBody: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null,
  secret: string
): Promise<boolean> {
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  // Validate timestamp to prevent replay attacks (5 minute tolerance)
  const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes
  const timestampSeconds = parseInt(webhookTimestamp, 10);
  if (isNaN(timestampSeconds)) {
    console.warn("Invalid webhook timestamp format");
    return false;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS) {
    console.warn(`Webhook timestamp outside tolerance window: ${timestampSeconds} vs ${nowSeconds}`);
    return false;
  }

  try {
    // Build the signed payload as per Standard Webhooks spec
    const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const encoder = new TextEncoder();

    // Base64-decode the secret before using it as the key
    const secretBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Parse signature(s) - format may be "v1,signature1 v1,signature2" or just "v1,signature"
    const signatures = webhookSignature.split(" ");

    for (const sig of signatures) {
      // Strip "v1," prefix if present
      const signatureValue = sig.startsWith("v1,") ? sig.slice(3) : sig;

      try {
        const signatureBuffer = Uint8Array.from(atob(signatureValue), (c) =>
          c.charCodeAt(0)
        );

        const isValid = await crypto.subtle.verify(
          "HMAC",
          key,
          signatureBuffer,
          encoder.encode(signedPayload)
        );

        if (isValid) {
          return true;
        }
      } catch {
        // Try next signature
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// Polar webhook handler for subscription events
http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    const environment = process.env.ENVIRONMENT;

    // Get the raw body for verification
    const rawBody = await request.text();

    // Get Standard Webhooks headers
    const webhookId = request.headers.get("webhook-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp");
    const webhookSignature = request.headers.get("webhook-signature");

    // Verify signature when secret is configured
    if (webhookSecret) {
      const isValid = await verifyPolarSignature(
        rawBody,
        webhookId,
        webhookTimestamp,
        webhookSignature,
        webhookSecret
      );
      if (!isValid) {
        console.error("Invalid Polar webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (environment !== "development") {
      // Only allow missing secret in development environment
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and process the event - inside try/catch for malformed JSON
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const eventType = (event.type || event.event_type) as string | undefined;

    console.log("Received Polar webhook:", eventType);

    try {
      switch (eventType) {
        case "subscription.created":
        case "subscription.updated": {
          const subscription = event.data || event;
          const customerEmail =
            subscription.customer_email || subscription.customer?.email;
          const subscriptionId = subscription.id || subscription.subscription_id;
          const customerId =
            subscription.customer_id || subscription.customer?.id;
          const planName = subscription.product?.name || subscription.plan?.name;
          if (!planName) {
            console.warn(
              `Webhook missing plan info for subscription ${subscription.id}, defaulting to free`
            );
          }
          const plan = planName || "free";
          // Pass status to mapPolarStatus to handle unknown/missing values safely
          // (mapPolarStatus treats unknown values as "canceled" to avoid granting access)
          const status = subscription.status || "";
          const periodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start).getTime()
            : Date.now();
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end).getTime()
            : undefined;
          const cancelAtPeriodEnd =
            subscription.cancel_at_period_end || false;

          if (!customerEmail) {
            console.error("No customer email in subscription event");
            return new Response(
              JSON.stringify({ error: "Missing customer email" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (!subscriptionId) {
            console.error("No subscription ID in subscription event");
            return new Response(
              JSON.stringify({ error: "Missing subscription ID" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (!customerId) {
            console.error("No customer ID in subscription event");
            return new Response(
              JSON.stringify({ error: "Missing customer ID" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          await ctx.runMutation(internal.subscriptions.upsertSubscription, {
            polarSubscriptionId: subscriptionId,
            polarCustomerId: customerId,
            userEmail: customerEmail,
            plan: mapPolarPlanToInternal(plan),
            status: mapPolarStatus(status),
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd,
          });

          // Log without PII - use subscription ID instead of email
          console.log(
            `Subscription ${eventType} processed for subscription: ${subscriptionId}`
          );
          break;
        }

        case "subscription.canceled":
        case "subscription.cancelled": {
          const subscription = event.data || event;
          const subscriptionId = subscription.id || subscription.subscription_id;

          if (!subscriptionId) {
            console.error("No subscription ID in canceled event");
            return new Response(
              JSON.stringify({ error: "Missing subscription ID" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          await ctx.runMutation(
            internal.subscriptions.handleSubscriptionStatusChange,
            {
              polarSubscriptionId: subscriptionId,
              status: "canceled",
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end).getTime()
                : undefined,
            }
          );

          console.log(`Subscription canceled: ${subscriptionId}`);
          break;
        }

        case "subscription.payment_failed":
        case "invoice.payment_failed": {
          const subscription = event.data || event;
          const subscriptionId =
            subscription.subscription_id || subscription.id;

          if (!subscriptionId) {
            console.error("No subscription ID in payment failed event");
            return new Response(
              JSON.stringify({ error: "Missing subscription ID" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          await ctx.runMutation(
            internal.subscriptions.handleSubscriptionStatusChange,
            {
              polarSubscriptionId: subscriptionId,
              status: "past_due",
            }
          );

          console.log(`Payment failed for subscription: ${subscriptionId}`);
          break;
        }

        case "checkout.completed": {
          console.log("Checkout completed");
          break;
        }

        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Handle OPTIONS preflight requests for Polar webhook with CORS headers
http.route({
  path: "/polar-webhook",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, webhook-id, webhook-timestamp, webhook-signature",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
