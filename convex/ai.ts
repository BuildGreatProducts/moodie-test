import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthenticatedUser, authorizeMoodboardAccess } from "./auth-helpers";
import { enforceSubscriptionLimit } from "./subscriptions";

// Get existing conversation for a moodboard (read-only)
export const getConversation = query({
  args: {
    moodboardId: v.id("moodboards"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Use compound index to find user's conversation for this moodboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (ctx.db as any)
      .query("aiConversations")
      .withIndex("by_moodboard_and_user", (q: { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } }) =>
        q.eq("moodboardId", args.moodboardId).eq("userId", user._id)
      )
      .first();

    return existing || null;
  },
});

// Create a new conversation for a moodboard (write operation)
export const createConversation = mutation({
  args: {
    moodboardId: v.id("moodboards"),
  },
  handler: async (ctx, args) => {
    // Verify user owns the moodboard before creating conversation
    const { user } = await authorizeMoodboardAccess(ctx, args.moodboardId);

    // Check if conversation already exists using compound index
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (ctx.db as any)
      .query("aiConversations")
      .withIndex("by_moodboard_and_user", (q: { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } }) =>
        q.eq("moodboardId", args.moodboardId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationId = await (ctx.db as any).insert("aiConversations", {
      userId: user._id,
      moodboardId: args.moodboardId,
      createdAt: now,
      updatedAt: now,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (ctx.db as any).get(conversationId);
  },
});

// Legacy query name for backwards compatibility - now uses mutation
export const getOrCreateConversation = mutation({
  args: {
    moodboardId: v.id("moodboards"),
  },
  handler: async (ctx, args) => {
    // Verify user owns the moodboard before creating conversation
    const { user } = await authorizeMoodboardAccess(ctx, args.moodboardId);

    // Use compound index to find user's conversation for this moodboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (ctx.db as any)
      .query("aiConversations")
      .withIndex("by_moodboard_and_user", (q: { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } }) =>
        q.eq("moodboardId", args.moodboardId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationId = await (ctx.db as any).insert("aiConversations", {
      userId: user._id,
      moodboardId: args.moodboardId,
      createdAt: now,
      updatedAt: now,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (ctx.db as any).get(conversationId);
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = await (ctx.db as any).get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }

    // Get messages sorted by creation time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = await (ctx.db as any)
      .query("aiMessages")
      .withIndex("by_conversation_id", (q: { eq: (f: string, v: unknown) => unknown }) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return messages.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
  },
});

// Internal mutation to add a message (server-only, not callable by clients)
export const addMessage = internalMutation({
  args: {
    conversationId: v.id("aiConversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    action: v.optional(
      v.object({
        type: v.string(),
        payload: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("executed"),
          v.literal("rejected")
        ),
      })
    ),
    imageGeneration: v.optional(
      v.object({
        prompt: v.string(),
        roomType: v.optional(v.string()),
        style: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("generating"),
          v.literal("completed"),
          v.literal("failed")
        ),
        resultUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageData: any = {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    };
    if (args.action) {
      messageData.action = args.action;
    }
    if (args.imageGeneration) {
      messageData.imageGeneration = args.imageGeneration;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageId = await (ctx.db as any).insert("aiMessages", messageData);

    // Update conversation timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Send a message and get AI response
export const sendMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = await (ctx.db as any).get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }

    // Validate content
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message content is required");
    }

    // Add user message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).insert("aiMessages", {
      conversationId: args.conversationId,
      role: "user",
      content: trimmedContent,
      createdAt: Date.now(),
    });

    // Track usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).insert("aiUsage", {
      userId: user._id,
      type: "chat",
      moodboardId: conversation.moodboardId,
      createdAt: Date.now(),
    });

    // Update conversation timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    // Generate AI response (simulated for now)
    // In production, this would call Claude API via an action
    const aiResponse = generateAIResponse(trimmedContent);

    // Add AI response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiMessageData: any = {
      conversationId: args.conversationId,
      role: "assistant",
      content: aiResponse.content,
      createdAt: Date.now(),
    };
    if (aiResponse.action) {
      aiMessageData.action = aiResponse.action;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).insert("aiMessages", aiMessageData);

    return { success: true };
  },
});

// Helper function to generate AI response (simulated)
function generateAIResponse(userMessage: string): {
  content: string;
  action?: {
    type: string;
    payload?: string;
    status: "pending" | "executed" | "rejected";
  };
} {
  const lowerMessage = userMessage.toLowerCase();

  // Check for product search intent
  if (
    lowerMessage.includes("find product") ||
    lowerMessage.includes("search product") ||
    lowerMessage.includes("looking for")
  ) {
    return {
      content:
        "I can help you find products! To search your product library, try describing what you're looking for in more detail - like 'a modern gray sofa' or 'minimalist table lamp'. You can also browse the product library panel on the right side of the canvas.",
    };
  }

  // Check for arrangement intent
  if (
    lowerMessage.includes("arrange") ||
    lowerMessage.includes("align") ||
    lowerMessage.includes("organize")
  ) {
    return {
      content:
        "To arrange elements on your canvas, you can:\n\n1. Select multiple elements (hold Shift and click)\n2. Use the alignment tools in the toolbar\n3. Enable grid snapping for precise placement\n\nWould you like me to help arrange specific elements?",
    };
  }

  // Check for generation intent
  if (
    lowerMessage.includes("generate") ||
    lowerMessage.includes("create image") ||
    lowerMessage.includes("design idea")
  ) {
    return {
      content:
        'I can generate room visualizations for you! Click the "Generate room" button above to create custom room designs. You can specify the room type, style, and describe the atmosphere you want.',
    };
  }

  // Check for help intent
  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("what can you do") ||
    lowerMessage.includes("how do")
  ) {
    return {
      content:
        "I'm your AI design assistant! Here's what I can help with:\n\n**Generate Room Designs**\nCreate AI-generated room visualizations based on your descriptions.\n\n**Find Products**\nSearch your product library for matching items.\n\n**Canvas Organization**\nHelp arrange and align elements on your moodboard.\n\n**Design Suggestions**\nProvide inspiration and recommendations for your project.\n\nWhat would you like to work on?",
    };
  }

  // Default response
  return {
    content:
      "I understand you're working on your design. I can help you generate room visualizations, find matching products, or organize your canvas. What would you like to do next?",
  };
}

// Generate image action
export const generateImage = mutation({
  args: {
    moodboardId: v.id("moodboards"),
    conversationId: v.optional(v.id("aiConversations")),
    prompt: v.string(),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user owns the moodboard before tracking usage against it
    const { user } = await authorizeMoodboardAccess(ctx, args.moodboardId);

    // Enforce subscription limits
    await enforceSubscriptionLimit(ctx, user._id, "generate_ai_image");

    // Validate prompt
    const trimmedPrompt = args.prompt.trim();
    if (!trimmedPrompt) {
      throw new Error("Prompt is required");
    }

    // If conversationId provided, verify ownership before inserting message
    if (args.conversationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversation = await (ctx.db as any).get(args.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      if (conversation.userId !== user._id) {
        throw new Error("Not authorized to add messages to this conversation");
      }
    }

    // Track usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).insert("aiUsage", {
      userId: user._id,
      type: "image_generation",
      moodboardId: args.moodboardId,
      createdAt: Date.now(),
    });

    // For now, return a placeholder image
    // In production, this would call an image generation API
    const placeholderImages = [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
    ];

    // Select placeholder image deterministically based on prompt hash
    // (Convex mutations must be deterministic for replay safety)
    const promptHash = trimmedPrompt
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageUrl = placeholderImages[promptHash % placeholderImages.length];

    // If there's a conversation, add the generation as a message (ownership already verified)
    if (args.conversationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageData: any = {
        conversationId: args.conversationId,
        role: "assistant",
        content: `I've generated a ${args.roomType || "room"} design${args.style ? ` in ${args.style} style` : ""} based on your description.`,
        imageGeneration: {
          prompt: trimmedPrompt,
          status: "completed",
          resultUrl: imageUrl,
        },
        createdAt: Date.now(),
      };
      if (args.roomType) {
        messageData.imageGeneration.roomType = args.roomType;
      }
      if (args.style) {
        messageData.imageGeneration.style = args.style;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).insert("aiMessages", messageData);
    }

    return {
      success: true,
      imageUrl,
    };
  },
});

// Get AI usage stats for a user
export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    // Get usage in the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usage = await (ctx.db as any)
      .query("aiUsage")
      .withIndex("by_user_id", (q: { eq: (f: string, v: unknown) => unknown }) => q.eq("userId", user._id))
      .filter((q: { gte: (a: unknown, b: unknown) => unknown; field: (f: string) => unknown }) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatCount = usage.filter((u: any) => u.type === "chat").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageGenCount = usage.filter((u: any) => u.type === "image_generation").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageEditCount = usage.filter((u: any) => u.type === "image_edit").length;

    return {
      chat: chatCount,
      imageGeneration: imageGenCount,
      imageEdit: imageEditCount,
      total: usage.length,
    };
  },
});

// Update action status on a message (for accepting/rejecting suggested actions)
export const updateActionStatus = mutation({
  args: {
    messageId: v.id("aiMessages"),
    status: v.union(v.literal("executed"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Get the message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (ctx.db as any).get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership by checking the conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = await (ctx.db as any).get(message.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error("Not authorized to update this message");
    }

    // Check if message has an action
    if (!message.action) {
      throw new Error("Message does not have an action to update");
    }

    // Update the action status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.messageId, {
      action: {
        type: message.action.type,
        payload: message.action.payload,
        status: args.status,
      },
    });

    return { success: true };
  },
});

// Clear conversation history
export const clearConversation = mutation({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = await (ctx.db as any).get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }

    // Delete all messages in the conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = await (ctx.db as any)
      .query("aiMessages")
      .withIndex("by_conversation_id", (q: { eq: (f: string, v: unknown) => unknown }) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const message of messages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).delete(message._id);
    }

    // Update conversation timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.db as any).patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
