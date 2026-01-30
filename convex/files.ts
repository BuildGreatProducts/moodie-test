import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  getAuthenticatedUser,
  authorizeMoodboardAccess,
} from "./auth-helpers";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    moodboardId: v.optional(v.id("moodboards")),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // If moodboardId is provided, verify access
    if (args.moodboardId) {
      await authorizeMoodboardAccess(ctx, args.moodboardId);
    }

    // Get the URL for the stored file
    const url = await ctx.storage.getUrl(args.storageId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileId = await (ctx.db as any).insert("files", {
      userId: user._id,
      moodboardId: args.moodboardId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      url: url || undefined,
      createdAt: Date.now(),
    });

    return { fileId, url };
  },
});

// Get file URL by storage ID - requires authentication and ownership verification
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Require authentication
    const user = await getAuthenticatedUser(ctx);

    // Verify the user owns a file with this storage ID
    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();

    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== user._id) {
      throw new Error("Not authorized to access this file");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

// List files for a moodboard
export const listByMoodboard = query({
  args: { moodboardId: v.id("moodboards") },
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

    // Verify moodboard access
    const moodboard = await ctx.db.get(args.moodboardId);
    if (!moodboard || moodboard.userId !== user._id) {
      return [];
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_moodboard_id", (q) => q.eq("moodboardId", args.moodboardId))
      .collect();

    return files;
  },
});

// List all files for the current user
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
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

    const files = await ctx.db
      .query("files")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return files;
  },
});

// Delete a file
export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== user._id) {
      throw new Error("Not authorized to delete this file");
    }

    // Delete from storage
    if (file.storageId) {
      try {
        await ctx.storage.delete(file.storageId as Id<"_storage">);
      } catch {
        // Storage deletion may fail if file doesn't exist
      }
    }

    // Delete metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).delete(args.id);

    return args.id;
  },
});
