import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk webhook handler for user events
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = body.data;

      const primaryEmail = email_addresses?.find(
        (e: { id: string }) => e.id === body.data.primary_email_address_id
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
