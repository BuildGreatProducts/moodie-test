import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get current user (requires auth)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Create or update user (called from Clerk webhook or sync)
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      const updateData: Record<string, unknown> = {
        email: args.email,
        updatedAt: now,
      };
      if (args.name !== undefined) updateData.name = args.name;
      if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.db.patch(existingUser._id as any, updateData as any);
      return existingUser._id;
    }

    const userData: Record<string, unknown> = {
      clerkId: args.clerkId,
      email: args.email,
      createdAt: now,
      updatedAt: now,
    };
    if (args.name !== undefined) userData.name = args.name;
    if (args.imageUrl !== undefined) userData.imageUrl = args.imageUrl;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = await ctx.db.insert("users", userData as any);

    // Create a free subscription for the new user
    await ctx.db.insert("subscriptions", {
      userId,
      plan: "free",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    businessName: v.optional(v.string()),
    projectType: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    if (args.name !== undefined) updateData.name = args.name;
    if (args.businessName !== undefined) updateData.businessName = args.businessName;
    if (args.projectType !== undefined) updateData.projectType = args.projectType;
    if (args.experienceLevel !== undefined) updateData.experienceLevel = args.experienceLevel;
    if (args.onboardingCompleted !== undefined)
      updateData.onboardingCompleted = args.onboardingCompleted;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.patch(user._id as any, updateData as any);

    return user._id;
  },
});
