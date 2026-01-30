import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper: Get authenticated user or throw
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
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

  return user;
}

// Helper: Authorize moodboard access - verifies ownership
async function authorizeMoodboardAccess(
  ctx: QueryCtx | MutationCtx,
  moodboardId: Id<"moodboards">
) {
  const user = await getAuthenticatedUser(ctx);

  const moodboard = await ctx.db.get(moodboardId);
  if (!moodboard) {
    throw new Error("Moodboard not found");
  }

  // Verify the user owns this moodboard
  if (moodboard.userId !== user._id) {
    throw new Error("Not authorized to access this moodboard");
  }

  return { user, moodboard };
}

// Helper: Authorize project access for creating moodboards
async function authorizeProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
) {
  const user = await getAuthenticatedUser(ctx);

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== user._id) {
    throw new Error("Not authorized to access this project");
  }

  return { user, project };
}

// List moodboards for a project
export const listByProject = query({
  args: { projectId: v.id("projects") },
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

    // Verify user owns the project
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      return [];
    }

    const moodboards = await ctx.db
      .query("moodboards")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return moodboards;
  },
});

// Get a single moodboard by ID
export const get = query({
  args: { id: v.id("moodboards") },
  handler: async (ctx, args) => {
    const { moodboard } = await authorizeMoodboardAccess(ctx, args.id);
    return moodboard;
  },
});

// Get moodboard by share ID (for public viewing)
export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const moodboard = await ctx.db
      .query("moodboards")
      .withIndex("by_share_id", (q) => q.eq("shareId", args.shareId))
      .first();

    if (!moodboard) {
      return null;
    }

    // Check if sharing is enabled
    if (!moodboard.shareEnabled) {
      return null;
    }

    // Check if share link has expired
    const expiresAt = moodboard.shareExpiresAt as number | undefined;
    if (expiresAt && expiresAt < Date.now()) {
      return null;
    }

    // Return public-safe data (exclude sensitive fields)
    return {
      _id: moodboard._id,
      name: moodboard.name,
      description: moodboard.description,
      canvasState: moodboard.canvasState,
      thumbnailUrl: moodboard.thumbnailUrl,
      hasPassword: !!moodboard.sharePasswordHash,
    };
  },
});

// Create a new moodboard
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await authorizeProjectAccess(ctx, args.projectId);

    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moodboardId = await (ctx.db as any).insert("moodboards", {
      projectId: args.projectId,
      userId: user._id,
      name: args.name,
      description: args.description,
      canvasState: JSON.stringify({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } }),
      shareEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    return moodboardId;
  },
});

// Update moodboard metadata
export const update = mutation({
  args: {
    id: v.id("moodboards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Update canvas state (for auto-save)
export const updateCanvasState = mutation({
  args: {
    id: v.id("moodboards"),
    canvasState: v.string(),
  },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, {
      canvasState: args.canvasState,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Update thumbnail
export const updateThumbnail = mutation({
  args: {
    id: v.id("moodboards"),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, {
      thumbnailUrl: args.thumbnailUrl,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Delete a moodboard
export const remove = mutation({
  args: { id: v.id("moodboards") },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    // Delete all comments for this moodboard
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.id))
      .collect();

    for (const comment of comments) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).delete(comment._id);
    }

    // Delete all files for this moodboard
    const files = await ctx.db
      .query("files")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.id))
      .collect();

    for (const file of files) {
      // Delete from storage if possible
      if (file.storageId) {
        try {
          await ctx.storage.delete(file.storageId as Id<"_storage">);
        } catch {
          // Storage deletion may fail if file doesn't exist
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).delete(file._id);
    }

    // Delete the moodboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).delete(args.id);

    return args.id;
  },
});

// Generate share link
export const generateShareLink = mutation({
  args: {
    id: v.id("moodboards"),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    // Generate a unique share ID
    const shareId = crypto.randomUUID();

    const updateData: {
      shareId: string;
      shareEnabled: boolean;
      shareExpiresAt?: number;
      updatedAt: number;
    } = {
      shareId,
      shareEnabled: true,
      updatedAt: Date.now(),
    };

    if (args.expiresInDays) {
      updateData.shareExpiresAt = Date.now() + args.expiresInDays * 24 * 60 * 60 * 1000;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, updateData);

    return { shareId };
  },
});

// Disable share link
export const disableShareLink = mutation({
  args: { id: v.id("moodboards") },
  handler: async (ctx, args) => {
    await authorizeMoodboardAccess(ctx, args.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, {
      shareEnabled: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
