import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
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

export default http;
