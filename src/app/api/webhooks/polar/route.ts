import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

// Polar webhook secret for signature verification
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

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
function mapPolarStatus(polarStatus: string): "active" | "canceled" | "past_due" | "trialing" {
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

// Verify webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!POLAR_WEBHOOK_SECRET || !signature) {
    // In development, skip verification if no secret is set
    if (process.env.NODE_ENV === "development") {
      console.warn("Webhook signature verification skipped in development");
      return true;
    }
    return false;
  }

  try {
    // Polar uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(POLAR_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = Uint8Array.from(
      atob(signature),
      (c) => c.charCodeAt(0)
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payload)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("polar-signature");

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.type || event.event_type;

    console.log("Received Polar webhook:", eventType);

    switch (eventType) {
      case "subscription.created":
      case "subscription.updated": {
        const subscription = event.data || event;
        const customerEmail = subscription.customer_email || subscription.customer?.email;
        const subscriptionId = subscription.id || subscription.subscription_id;
        const customerId = subscription.customer_id || subscription.customer?.id;
        const plan = subscription.product?.name || subscription.plan?.name || "pro";
        const status = subscription.status || "active";
        const periodStart = subscription.current_period_start
          ? new Date(subscription.current_period_start).getTime()
          : Date.now();
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end).getTime()
          : undefined;
        const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;

        if (!customerEmail) {
          console.error("No customer email in subscription event");
          return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
        }

        await convex.mutation(api.subscriptions.upsertSubscription, {
          polarSubscriptionId: subscriptionId,
          polarCustomerId: customerId,
          userEmail: customerEmail,
          plan: mapPolarPlanToInternal(plan),
          status: mapPolarStatus(status),
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd,
        });

        console.log(`Subscription ${eventType} processed for ${customerEmail}`);
        break;
      }

      case "subscription.canceled":
      case "subscription.cancelled": {
        const subscription = event.data || event;
        const subscriptionId = subscription.id || subscription.subscription_id;

        await convex.mutation(api.subscriptions.handleSubscriptionStatusChange, {
          polarSubscriptionId: subscriptionId,
          status: "canceled",
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end).getTime()
            : undefined,
        });

        console.log(`Subscription canceled: ${subscriptionId}`);
        break;
      }

      case "subscription.payment_failed":
      case "invoice.payment_failed": {
        const subscription = event.data || event;
        const subscriptionId = subscription.subscription_id || subscription.id;

        await convex.mutation(api.subscriptions.handleSubscriptionStatusChange, {
          polarSubscriptionId: subscriptionId,
          status: "past_due",
        });

        console.log(`Payment failed for subscription: ${subscriptionId}`);
        break;
      }

      case "checkout.completed": {
        // Handle successful checkout
        // The subscription.created event will handle the actual subscription creation
        console.log("Checkout completed");
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Polar may send OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
