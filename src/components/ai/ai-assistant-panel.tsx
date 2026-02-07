"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Wand2,
  Package,
  RotateCcw,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  action?: {
    type: string;
    payload?: string;
    status: "pending" | "executed" | "rejected";
  };
  imageGeneration?: {
    prompt: string;
    roomType?: string;
    style?: string;
    status: "pending" | "generating" | "completed" | "failed";
    resultUrl?: string;
  };
}

interface AIAssistantPanelProps {
  moodboardId: Id<"moodboards">;
  isOpen: boolean;
  onToggle: () => void;
  onAddImageToCanvas?: (imageUrl: string, name?: string) => void;
  onCanvasAction?: (action: { type: string; payload?: unknown }) => void;
}

const QUICK_ACTIONS = [
  { icon: ImagePlus, label: "Generate room", action: "generate_room" },
  { icon: Wand2, label: "Edit selected", action: "edit_selected" },
  { icon: Package, label: "Find products", action: "find_products" },
];

const SYSTEM_PROMPT = `You are an AI assistant for Moodie, an interior design moodboard platform. Help designers with:
- Generating room visualizations and design ideas
- Finding matching products for their designs
- Arranging and organizing canvas elements
- Providing design suggestions and inspiration

Be helpful, creative, and focused on interior design. When suggesting actions, be specific about what you'll do.`;

export function AIAssistantPanel({
  moodboardId,
  isOpen,
  onToggle,
  onAddImageToCanvas,
  onCanvasAction,
}: AIAssistantPanelProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"aiConversations"> | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Convex queries and mutations - use getConversation query for reading
  const existingConversation = useQuery(api.ai.getConversation, { moodboardId });
  const createConversation = useMutation(api.ai.createConversation);
  const messages = useQuery(
    api.ai.getMessages,
    conversationId ? { conversationId } : "skip"
  );
  const sendMessageMutation = useMutation(api.ai.sendMessage);
  const updateActionStatus = useMutation(api.ai.updateActionStatus);

  // Update conversationId when existingConversation changes
  useEffect(() => {
    if (existingConversation?._id) {
      setConversationId(existingConversation._id);
    }
  }, [existingConversation]);

  // Helper to ensure conversation exists before operations
  const ensureConversation = useCallback(async (): Promise<Id<"aiConversations"> | null> => {
    if (conversationId) return conversationId;
    if (isCreatingConversation) return null;

    setIsCreatingConversation(true);
    try {
      const newConversation = await createConversation({ moodboardId });
      if (newConversation?._id) {
        setConversationId(newConversation._id);
        return newConversation._id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [conversationId, isCreatingConversation, createConversation, moodboardId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, localMessages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Add optimistic user message
    const tempId = `temp-${Date.now()}`;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content: userMessage,
        createdAt: Date.now(),
      },
    ]);

    try {
      // Ensure we have a conversation (create if needed)
      const activeConversationId = await ensureConversation();
      if (!activeConversationId) {
        throw new Error("Failed to create conversation");
      }

      await sendMessageMutation({
        conversationId: activeConversationId,
        content: userMessage,
      });
      // Clear local messages after server responds
      setLocalMessages([]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, ensureConversation, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "generate_room":
        setShowGenerateModal(true);
        break;
      case "edit_selected":
        setMessage("Edit the selected element to ");
        inputRef.current?.focus();
        break;
      case "find_products":
        setMessage("Find products that match ");
        inputRef.current?.focus();
        break;
    }
  };

  const handleAcceptAction = useCallback(
    async (messageId: string, action: NonNullable<Message["action"]>) => {
      if (!action.type || !onCanvasAction) return;

      // Parse payload separately to distinguish parse errors
      let payload: unknown = undefined;
      if (action.payload) {
        try {
          payload = JSON.parse(action.payload);
        } catch (parseError) {
          console.error("Failed to parse action payload:", parseError);
          return; // Exit early on parse failure
        }
      }

      // Execute canvas action and update status
      try {
        onCanvasAction({ type: action.type, payload });
        await updateActionStatus({
          messageId: messageId as Id<"aiMessages">,
          status: "executed",
        });
      } catch (actionError) {
        console.error("Failed to execute canvas action or update status:", actionError);
      }
    },
    [onCanvasAction, updateActionStatus]
  );

  const handleDismissAction = useCallback(
    async (messageId: string) => {
      try {
        await updateActionStatus({
          messageId: messageId as Id<"aiMessages">,
          status: "rejected",
        });
      } catch {
        console.error("Failed to dismiss action");
      }
    },
    [updateActionStatus]
  );

  const handleAddGeneratedImage = useCallback(
    (imageUrl: string, prompt: string) => {
      if (onAddImageToCanvas) {
        onAddImageToCanvas(imageUrl, `AI Generated: ${prompt}`);
      }
    },
    [onAddImageToCanvas]
  );

  // Combine server messages with local optimistic messages
  const allMessages = [...(messages || []), ...localMessages];

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === "user";
    const isAssistant = msg.role === "assistant";

    return (
      <div
        key={msg.id || msg.createdAt}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
            isUser
              ? "bg-primary-500 text-white"
              : "bg-neutral-100 text-neutral-900"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm">{msg.content}</p>

          {/* Image generation result */}
          {msg.imageGeneration && (
            <div className="mt-3">
              {msg.imageGeneration.status === "generating" && (
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating image...
                </div>
              )}
              {msg.imageGeneration.status === "completed" &&
                msg.imageGeneration.resultUrl && (
                  <div className="mt-2">
                    <img
                      src={msg.imageGeneration.resultUrl}
                      alt={msg.imageGeneration.prompt}
                      className="max-h-48 rounded-lg"
                    />
                    <button
                      onClick={() =>
                        handleAddGeneratedImage(
                          msg.imageGeneration!.resultUrl!,
                          msg.imageGeneration!.prompt
                        )
                      }
                      className="mt-2 flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/30"
                    >
                      <ImagePlus className="h-3 w-3" />
                      Add to canvas
                    </button>
                  </div>
                )}
              {msg.imageGeneration.status === "failed" && (
                <p className="mt-1 text-xs text-red-300">
                  Image generation failed. Please try again.
                </p>
              )}
            </div>
          )}

          {/* Canvas action buttons */}
          {isAssistant && msg.action && msg.action.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAcceptAction(msg.id, msg.action!)}
                className="flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
              >
                Apply changes
              </button>
              <button
                onClick={() => handleDismissAction(msg.id)}
                className="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-l-xl bg-primary-500 p-3 text-white shadow-lg transition-colors hover:bg-primary-600"
          title="Open AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <Sparkles className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-neutral-900">
                AI Assistant
              </h3>
              <p className="text-xs text-neutral-500">Design helper</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              title="Close panel"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="border-b border-neutral-200 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-neutral-500">Quick actions</p>
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-neutral-200 p-2 text-xs text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {allMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="font-display text-sm font-semibold text-neutral-900">
                How can I help?
              </h4>
              <p className="mt-1 max-w-[200px] text-xs text-neutral-500">
                Ask me to generate room designs, find products, or help arrange your
                moodboard.
              </p>
            </div>
          ) : (
            <>
              {allMessages.map((msg) =>
                renderMessage({
                  id: msg._id || msg.id,
                  role: msg.role,
                  content: msg.content,
                  createdAt: msg.createdAt,
                  action: msg.action,
                  imageGeneration: msg.imageGeneration,
                } as Message)
              )}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-neutral-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your design..."
              rows={2}
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="absolute bottom-3 right-3 rounded-lg bg-primary-500 p-2 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-neutral-400">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {/* Generate Room Modal */}
      {showGenerateModal && (
        <GenerateRoomModal
          moodboardId={moodboardId}
          conversationId={conversationId ?? undefined}
          onClose={() => setShowGenerateModal(false)}
          onImageGenerated={(url, prompt) => {
            if (onAddImageToCanvas) {
              onAddImageToCanvas(url, `AI Generated: ${prompt}`);
            }
            setShowGenerateModal(false);
          }}
        />
      )}
    </>
  );
}

// Generate Room Modal Component
interface GenerateRoomModalProps {
  moodboardId: Id<"moodboards">;
  conversationId?: Id<"aiConversations">;
  onClose: () => void;
  onImageGenerated: (url: string, prompt: string) => void;
}

const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Entryway",
  "Outdoor",
];

const DESIGN_STYLES = [
  "Modern",
  "Traditional",
  "Mid-Century",
  "Minimalist",
  "Industrial",
  "Bohemian",
  "Scandinavian",
  "Coastal",
  "Farmhouse",
  "Contemporary",
];

function GenerateRoomModal({
  moodboardId,
  conversationId,
  onClose,
  onImageGenerated,
}: GenerateRoomModalProps) {
  const [prompt, setPrompt] = useState("");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useMutation(api.ai.generateImage);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isGenerating) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, onClose]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage({
        moodboardId,
        conversationId,
        prompt: prompt.trim(),
        roomType: roomType || undefined,
        style: style || undefined,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      } else {
        setError("Image generation failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  const handleAddToCanvas = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage, prompt);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isGenerating) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-soft-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
            <Wand2 className="h-4 w-4 text-primary-600" />
          </div>
          <h2 className="font-display text-xl font-semibold text-neutral-900">
            Generate Room
          </h2>
        </div>

        {!generatedImage ? (
          <>
            <p className="mb-4 text-sm text-neutral-600">
              Describe the room you want to generate. Be specific about colors,
              furniture, and atmosphere.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cozy living room with a large gray sectional sofa, warm wood accents, and plenty of natural light..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Any room</option>
                    {ROOM_TYPES.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Any style</option>
                    {DESIGN_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <img
                src={generatedImage}
                alt={prompt}
                className="w-full object-cover"
              />
            </div>

            <p className="text-sm text-neutral-600">
              <span className="font-medium">Prompt:</span> {prompt}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={handleAddToCanvas}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <ImagePlus className="h-4 w-4" />
                Add to Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
