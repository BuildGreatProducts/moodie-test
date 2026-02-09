import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Shared authentication and authorization helpers for Convex functions.
 */

/**
 * Get the authenticated user or throw an error if not authenticated.
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
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

/**
 * Authorize access to a moodboard - verifies the user owns the moodboard.
 */
export async function authorizeMoodboardAccess(
  ctx: QueryCtx | MutationCtx,
  moodboardId: Id<"moodboards">
) {
  const user = await getAuthenticatedUser(ctx);

  const moodboard = await ctx.db.get(moodboardId);
  if (!moodboard) {
    throw new Error("Moodboard not found");
  }

  if (moodboard.userId !== user._id) {
    throw new Error("Not authorized to access this moodboard");
  }

  return { user, moodboard };
}

/**
 * Authorize access to a project - verifies the user owns the project.
 */
export async function authorizeProjectAccess(
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

/**
 * Authorize access to a file - verifies the user owns the file.
 */
export async function authorizeFileAccess(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const user = await getAuthenticatedUser(ctx);

  const file = await ctx.db.get(fileId);
  if (!file) {
    throw new Error("File not found");
  }

  if (file.userId !== user._id) {
    throw new Error("Not authorized to access this file");
  }

  return { user, file };
}
