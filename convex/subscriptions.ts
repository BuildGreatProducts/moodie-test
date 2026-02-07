import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./auth-helpers";

// Plan limits
export const PLAN_LIMITS = {
  free: {
    projects: 1,
    moodboards: 2,
    aiGenerations: 5,
    productsPerMonth: 10,
  },
  pro: {
    projects: 10,
    moodboards: 50,
    aiGenerations: 100,
    productsPerMonth: 500,
  },
  team: {
    projects: -1, // unlimited
    moodboards: -1,
    aiGenerations: -1,
    productsPerMonth: -1,
  },
};

// Get current user's subscription
export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    if (!subscription) {
      // Return default free plan
      return {
        plan: "free" as const,
        status: "active" as const,
        limits: PLAN_LIMITS.free,
      };
    }

    const planKey = subscription.plan as keyof typeof PLAN_LIMITS;
    return {
      ...subscription,
      limits: PLAN_LIMITS[planKey],
    };
  },
});

// Get usage stats for the current period
export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    // Get subscription to determine period
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    const plan = subscription?.plan || "free";
    const periodStart = Number(subscription?.currentPeriodStart) || Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Count projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    const projectCount = projects.filter((p) => p.status === "active").length;

    // Count moodboards
    const moodboards = await ctx.db
      .query("moodboards")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    const moodboardCount = moodboards.length;

    // Count AI generations this period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiUsage = await (ctx.db as any)
      .query("aiUsage")
      .withIndex("by_user_id", (q: { eq: (f: string, v: unknown) => unknown }) => q.eq("userId", user._id))
      .collect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiGenerationsThisPeriod = aiUsage.filter((u: any) => {
      const createdAt = Number(u.createdAt || 0);
      return u.type === "image_generation" && createdAt >= periodStart;
    }).length;

    // Count products added this period
    const products = await ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsThisPeriod = products.filter((p: any) => {
      const createdAt = Number(p.createdAt || 0);
      return createdAt >= periodStart;
    }).length;

    const planKey = plan as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[planKey];

    return {
      projects: {
        used: projectCount,
        limit: limits.projects,
        percentage: limits.projects === -1 ? 0 : (projectCount / limits.projects) * 100,
      },
      moodboards: {
        used: moodboardCount,
        limit: limits.moodboards,
        percentage: limits.moodboards === -1 ? 0 : (moodboardCount / limits.moodboards) * 100,
      },
      aiGenerations: {
        used: aiGenerationsThisPeriod,
        limit: limits.aiGenerations,
        percentage: limits.aiGenerations === -1 ? 0 : (aiGenerationsThisPeriod / limits.aiGenerations) * 100,
      },
      products: {
        used: productsThisPeriod,
        limit: limits.productsPerMonth,
        percentage: limits.productsPerMonth === -1 ? 0 : (productsThisPeriod / limits.productsPerMonth) * 100,
      },
    };
  },
});

// Check if user can perform an action (for limit enforcement)
export const canPerformAction = query({
  args: {
    action: v.union(
      v.literal("create_project"),
      v.literal("create_moodboard"),
      v.literal("generate_ai_image"),
      v.literal("add_product")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Get subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    const plan = (subscription?.plan || "free") as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan];
    const periodStart = (subscription?.currentPeriodStart as number | undefined) || Date.now() - 30 * 24 * 60 * 60 * 1000;

    switch (args.action) {
      case "create_project": {
        if (limits.projects === -1) return { allowed: true, reason: null };
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .collect();
        const activeCount = projects.filter((p) => p.status === "active").length;
        return {
          allowed: activeCount < limits.projects,
          reason: activeCount >= limits.projects
            ? `You've reached the limit of ${limits.projects} active project${limits.projects > 1 ? "s" : ""} on the ${plan} plan.`
            : null,
          current: activeCount,
          limit: limits.projects,
        };
      }

      case "create_moodboard": {
        if (limits.moodboards === -1) return { allowed: true, reason: null };
        const moodboards = await ctx.db
          .query("moodboards")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .collect();
        return {
          allowed: moodboards.length < limits.moodboards,
          reason: moodboards.length >= limits.moodboards
            ? `You've reached the limit of ${limits.moodboards} moodboards on the ${plan} plan.`
            : null,
          current: moodboards.length,
          limit: limits.moodboards,
        };
      }

      case "generate_ai_image": {
        if (limits.aiGenerations === -1) return { allowed: true, reason: null };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aiUsage = await (ctx.db as any)
          .query("aiUsage")
          .withIndex("by_user_id", (q: { eq: (f: string, v: unknown) => unknown }) => q.eq("userId", user._id))
          .collect();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generationsThisPeriod = aiUsage.filter((u: any) =>
          u.type === "image_generation" && Number(u.createdAt || 0) >= periodStart
        ).length;
        return {
          allowed: generationsThisPeriod < limits.aiGenerations,
          reason: generationsThisPeriod >= limits.aiGenerations
            ? `You've used all ${limits.aiGenerations} AI image generations for this period on the ${plan} plan.`
            : null,
          current: generationsThisPeriod,
          limit: limits.aiGenerations,
        };
      }

      case "add_product": {
        if (limits.productsPerMonth === -1) return { allowed: true, reason: null };
        const products = await ctx.db
          .query("products")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .collect();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productsThisPeriod = products.filter((p: any) =>
          Number(p.createdAt || 0) >= periodStart
        ).length;
        return {
          allowed: productsThisPeriod < limits.productsPerMonth,
          reason: productsThisPeriod >= limits.productsPerMonth
            ? `You've added ${limits.productsPerMonth} products this period on the ${plan} plan.`
            : null,
          current: productsThisPeriod,
          limit: limits.productsPerMonth,
        };
      }

      default:
        return { allowed: true, reason: null };
    }
  },
});

// Create or update subscription (called by webhook)
export const upsertSubscription = mutation({
  args: {
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    userEmail: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      throw new Error(`User not found for email: ${args.userEmail}`);
    }

    // Check if subscription exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription_id", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    const now = Date.now();

    if (existingSubscription) {
      // Update existing subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).patch(existingSubscription._id, {
        plan: args.plan,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        updatedAt: now,
      });
      return existingSubscription._id;
    } else {
      // Create new subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = await (ctx.db as any).insert("subscriptions", {
        userId: user._id,
        polarSubscriptionId: args.polarSubscriptionId,
        polarCustomerId: args.polarCustomerId,
        plan: args.plan,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        createdAt: now,
        updatedAt: now,
      });
      return subscriptionId;
    }
  },
});

// Cancel subscription at period end
export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(subscription._id, {
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});

// Reactivate subscription (undo cancellation)
export const reactivateSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(subscription._id, {
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});

// Handle subscription status change from webhook
export const handleSubscriptionStatusChange = mutation({
  args: {
    polarSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription_id", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    if (!subscription) {
      console.error(`Subscription not found: ${args.polarSubscriptionId}`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(subscription._id, {
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    });

    return subscription._id;
  },
});
