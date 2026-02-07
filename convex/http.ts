import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
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

      await ctx.runMutation(api.users.upsertUser, {
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
      return "active";
  }
}

// Verify Polar webhook signature using HMAC-SHA256
async function verifyPolarSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = Uint8Array.from(atob(signature), (c) =>
      c.charCodeAt(0)
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payload)
    );
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

    // Get the raw body for verification
    const rawBody = await request.text();
    const signature = request.headers.get("polar-signature");

    // Verify signature in production
    if (webhookSecret) {
      const isValid = await verifyPolarSignature(
        rawBody,
        signature,
        webhookSecret
      );
      if (!isValid) {
        console.error("Invalid Polar webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (process.env.NODE_ENV !== "development") {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and process the event
    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event_type;

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
          const plan =
            subscription.product?.name || subscription.plan?.name || "pro";
          const status = subscription.status || "active";
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

          console.log(
            `Subscription ${eventType} processed for ${customerEmail}`
          );
          break;
        }

        case "subscription.canceled":
        case "subscription.cancelled": {
          const subscription = event.data || event;
          const subscriptionId = subscription.id || subscription.subscription_id;

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

// Handle OPTIONS requests for Polar webhook
http.route({
  path: "/polar-webhook",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 200 });
  }),
});

export default http;
