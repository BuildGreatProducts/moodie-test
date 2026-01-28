import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    onboardingCompleted: v.optional(v.boolean()),
    businessName: v.optional(v.string()),
    projectType: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Projects table
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_updated", ["userId", "updatedAt"]),

  // Moodboards table
  moodboards: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    canvasState: v.optional(v.string()), // JSON stringified ReactFlow state
    thumbnailUrl: v.optional(v.string()),
    shareId: v.optional(v.string()),
    shareEnabled: v.optional(v.boolean()),
    sharePassword: v.optional(v.string()),
    shareExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_user_id", ["userId"])
    .index("by_share_id", ["shareId"]),

  // Subscriptions table
  subscriptions: defineTable({
    userId: v.id("users"),
    polarSubscriptionId: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_polar_subscription_id", ["polarSubscriptionId"]),

  // Products table (for the product library)
  products: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_category", ["category"])
    .index("by_room_type", ["roomType"])
    .index("by_style", ["style"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["userId", "category", "roomType", "style"],
    }),

  // Comments table (for client feedback)
  comments: defineTable({
    moodboardId: v.id("moodboards"),
    elementId: v.optional(v.string()), // ID of the canvas element being commented on
    parentId: v.optional(v.id("comments")), // For replies
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    authorUserId: v.optional(v.id("users")), // If designer is replying
    content: v.string(),
    isResolved: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_moodboard_id", ["moodboardId"])
    .index("by_element_id", ["moodboardId", "elementId"])
    .index("by_parent_id", ["parentId"]),

  // Files table (for uploaded assets)
  files: defineTable({
    userId: v.id("users"),
    moodboardId: v.optional(v.id("moodboards")),
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    url: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_moodboard_id", ["moodboardId"]),
});
