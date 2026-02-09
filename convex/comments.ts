import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { authorizeMoodboardAccess } from "./auth-helpers";
import { Id } from "./_generated/dataModel";

// Helper to check if user can access comments on a moodboard
// Returns true if: user is authenticated and owns the moodboard, OR moodboard has sharing enabled
async function canAccessComments(
  ctx: QueryCtx,
  moodboardId: Id<"moodboards">
): Promise<boolean> {
  const moodboard = await ctx.db.get(moodboardId);
  if (!moodboard) {
    return false;
  }

  // Check if user is authenticated
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If user owns the moodboard, allow access
    if (user && moodboard.userId === user._id) {
      return true;
    }
  }

  // If sharing is enabled and not expired, allow access (for clients viewing shared moodboards)
  if (moodboard.shareEnabled) {
    // Check if share link has expired
    const expiresAt = moodboard.shareExpiresAt as number | undefined;
    if (expiresAt && expiresAt < Date.now()) {
      return false;
    }
    return true;
  }

  return false;
}

// List all comments for a moodboard
export const listByMoodboard = query({
  args: { moodboardId: v.id("moodboards") },
  handler: async (ctx, args) => {
    // Check authorization
    const hasAccess = await canAccessComments(ctx, args.moodboardId);
    if (!hasAccess) {
      return []; // Return empty array instead of throwing to avoid leaking info
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.moodboardId))
      .order("asc")
      .collect();

    return comments;
  },
});

// List comments for a specific element
export const listByElement = query({
  args: {
    moodboardId: v.id("moodboards"),
    elementId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check authorization
    const hasAccess = await canAccessComments(ctx, args.moodboardId);
    if (!hasAccess) {
      return []; // Return empty array instead of throwing to avoid leaking info
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = await (ctx.db as any)
      .query("comments")
      .withIndex("by_element_id", (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) =>
        q.eq("moodboardId", args.moodboardId).eq("elementId", args.elementId)
      )
      .order("asc")
      .collect();

    return comments;
  },
});

// Get comment count for a moodboard (for badges)
export const getCommentCount = query({
  args: { moodboardId: v.id("moodboards") },
  handler: async (ctx, args) => {
    // Check authorization
    const hasAccess = await canAccessComments(ctx, args.moodboardId);
    if (!hasAccess) {
      return { total: 0, unresolved: 0 }; // Return zero counts to avoid leaking info
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.moodboardId))
      .collect();

    const total = comments.length;
    const unresolved = comments.filter((c) => !c.isResolved).length;

    return { total, unresolved };
  },
});

// Get comment counts per element (for showing badges on canvas elements)
export const getElementCommentCounts = query({
  args: { moodboardId: v.id("moodboards") },
  handler: async (ctx, args) => {
    // Check authorization
    const hasAccess = await canAccessComments(ctx, args.moodboardId);
    if (!hasAccess) {
      return {}; // Return empty object to avoid leaking info
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.moodboardId))
      .collect();

    // Group by elementId and count
    const counts: Record<string, { total: number; unresolved: number }> = {};

    for (const comment of comments) {
      const elementId = String(comment.elementId || "general");
      if (!counts[elementId]) {
        counts[elementId] = { total: 0, unresolved: 0 };
      }
      counts[elementId].total++;
      if (!comment.isResolved) {
        counts[elementId].unresolved++;
      }
    }

    return counts;
  },
});

// Create a new comment (can be anonymous for clients)
export const create = mutation({
  args: {
    moodboardId: v.id("moodboards"),
    elementId: v.optional(v.string()),
    parentId: v.optional(v.id("comments")),
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify moodboard exists and sharing is enabled (for public comments)
    // or user is authenticated (for designer comments)
    const moodboard = await ctx.db.get(args.moodboardId);
    if (!moodboard) {
      throw new Error("Moodboard not found");
    }

    // Check authorization: user must own moodboard OR sharing must be enabled
    const identity = await ctx.auth.getUserIdentity();
    let authorUserId = null;
    let isOwner = false;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (user) {
        authorUserId = user._id;
        isOwner = moodboard.userId === user._id;
      }
    }

    // Allow comments if: user owns the moodboard OR sharing is enabled and not expired
    if (!isOwner) {
      if (!moodboard.shareEnabled) {
        throw new Error("Comments are not allowed on this moodboard");
      }
      // Check if share link has expired
      const expiresAt = moodboard.shareExpiresAt as number | undefined;
      if (expiresAt && expiresAt < Date.now()) {
        throw new Error("This share link has expired");
      }
    }

    // If parentId is provided, verify it exists
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
    }

    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commentId = await (ctx.db as any).insert("comments", {
      moodboardId: args.moodboardId,
      elementId: args.elementId,
      parentId: args.parentId,
      authorName: args.authorName,
      authorEmail: args.authorEmail,
      authorUserId,
      content: args.content,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
    });

    return commentId;
  },
});

// Update a comment (only author or moodboard owner can update)
export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is authenticated
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

    // Check if user is the author or the moodboard owner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moodboard = await (ctx.db as any).get(comment.moodboardId);
    if (!moodboard) {
      throw new Error("Moodboard not found");
    }

    const isAuthor = comment.authorUserId === user._id;
    const isMoodboardOwner = moodboard.userId === user._id;

    if (!isAuthor && !isMoodboardOwner) {
      throw new Error("Not authorized to update this comment");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Delete a comment (only author or moodboard owner can delete)
export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is authenticated
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

    // Check if user is the author or the moodboard owner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moodboard = await (ctx.db as any).get(comment.moodboardId);
    if (!moodboard) {
      throw new Error("Moodboard not found");
    }

    const isAuthor = comment.authorUserId === user._id;
    const isMoodboardOwner = moodboard.userId === user._id;

    if (!isAuthor && !isMoodboardOwner) {
      throw new Error("Not authorized to delete this comment");
    }

    // Recursively delete all nested replies (children, grandchildren, etc.)
    async function deleteCommentAndReplies(commentId: typeof args.id) {
      const replies = await ctx.db
        .query("comments")
        .withIndex("by_parent_id", (q) => q.eq("parentId", commentId))
        .collect();

      // Recursively delete all nested replies first
      for (const reply of replies) {
        await deleteCommentAndReplies(reply._id);
      }

      // Then delete this comment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).delete(commentId);
    }

    await deleteCommentAndReplies(args.id);

    return args.id;
  },
});

// Toggle resolved status (only moodboard owner can do this)
export const toggleResolved = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Must be authenticated
    await authorizeMoodboardAccess(ctx, comment.moodboardId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.id, {
      isResolved: !comment.isResolved,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Reply to a comment (designer only)
export const reply = mutation({
  args: {
    parentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const parentComment = await ctx.db.get(args.parentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }

    // Must be authenticated and own the moodboard
    const { user } = await authorizeMoodboardAccess(ctx, parentComment.moodboardId);

    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commentId = await (ctx.db as any).insert("comments", {
      moodboardId: parentComment.moodboardId,
      elementId: parentComment.elementId,
      parentId: args.parentId,
      authorName: user.name || "Designer",
      authorEmail: user.email,
      authorUserId: user._id,
      content: args.content,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
    });

    return commentId;
  },
});
