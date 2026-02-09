import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser, authorizeProjectAccess } from "./auth-helpers";
import { enforceSubscriptionLimit } from "./subscriptions";

// Get all projects for the current user
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all projects for user and filter in memory
    let projects = await ctx.db
      .query("projects")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter by status if specified
    if (args.status && args.status !== "all") {
      projects = projects.filter((p) => p.status === args.status);
    }

    // Get moodboard count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const moodboards = await ctx.db
          .query("moodboards")
          .withIndex("by_project_id", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          moodboardCount: moodboards.length,
        };
      })
    );

    return projectsWithCounts;
  },
});

// Get a single project by ID
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Use helper to verify authentication and ownership
    const { project } = await authorizeProjectAccess(ctx, args.id);

    // Get moodboards for this project
    const moodboards = await ctx.db
      .query("moodboards")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.id))
      .order("desc")
      .collect();

    return {
      ...project,
      moodboards,
    };
  },
});

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Enforce subscription limits
    await enforceSubscriptionLimit(ctx, user._id, "create_project");

    const now = Date.now();

    const projectData: {
      userId: typeof user._id;
      name: string;
      description?: string;
      clientName?: string;
      clientEmail?: string;
      status: "active" | "archived";
      createdAt: number;
      updatedAt: number;
    } = {
      userId: user._id,
      name: args.name,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    if (args.description) projectData.description = args.description;
    if (args.clientName) projectData.clientName = args.clientName;
    if (args.clientEmail) projectData.clientEmail = args.clientEmail;

    const projectId = await ctx.db.insert("projects", projectData);

    return projectId;
  },
});

// Update a project
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    // Verify authentication and ownership
    await authorizeProjectAccess(ctx, args.id);

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.patch(id as any, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a project and all its moodboards
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Verify authentication and ownership
    await authorizeProjectAccess(ctx, args.id);

    // Delete all moodboards for this project
    const moodboards = await ctx.db
      .query("moodboards")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.id))
      .collect();

    for (const moodboard of moodboards) {
      // Delete comments for each moodboard
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", moodboard._id))
        .collect();

      for (const comment of comments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.db.delete(comment._id as any);
      }

      // Delete files for each moodboard
      const files = await ctx.db
        .query("files")
        .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", moodboard._id))
        .collect();

      for (const file of files) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.db.delete(file._id as any);
      }

      // Delete AI conversations and their messages for each moodboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiConversations = await (ctx.db as any)
        .query("aiConversations")
        .withIndex("by_moodboard_id", (q: { eq: (f: string, v: unknown) => unknown }) => q.eq("moodboardId", moodboard._id))
        .collect();

      for (const conversation of aiConversations) {
        // Delete all messages in this conversation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages = await (ctx.db as any)
          .query("aiMessages")
          .withIndex("by_conversation_id", (q: { eq: (f: string, v: unknown) => unknown }) => q.eq("conversationId", conversation._id))
          .collect();

        for (const message of messages) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).delete(message._id);
        }

        // Delete the conversation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).delete(conversation._id);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.db.delete(moodboard._id as any);
    }

    // Delete the project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.delete(args.id as any);

    return args.id;
  },
});

// Archive/unarchive a project
export const toggleArchive = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Verify authentication and ownership
    const { project } = await authorizeProjectAccess(ctx, args.id);

    const newStatus = project.status === "active" ? "archived" : "active";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.patch(args.id as any, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return { id: args.id, status: newStatus };
  },
});
