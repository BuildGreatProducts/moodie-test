"use client";

import { use, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Layout,
  MessageSquare,
  X,
  Send,
  Eye,
} from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Read-only node components for public view
function ReadOnlyImageNode({ data }: { data: { url?: string; alt?: string } }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-1 shadow-soft-md">
      {data.url ? (
        <img
          src={data.url}
          alt={data.alt || "Image"}
          className="max-h-64 max-w-64 rounded object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center bg-neutral-100 text-neutral-400">
          No image
        </div>
      )}
    </div>
  );
}

function ReadOnlyProductNode({
  data,
}: {
  data: { imageUrl?: string; name?: string; price?: number; currency?: string; sourceUrl?: string };
}) {
  const handleClick = () => {
    if (data.sourceUrl) {
      window.open(data.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-2 shadow-soft-md ${
        data.sourceUrl ? "cursor-pointer hover:border-primary-300" : ""
      }`}
      onClick={handleClick}
    >
      {data.imageUrl ? (
        <img
          src={data.imageUrl}
          alt={data.name || "Product"}
          className="mb-2 max-h-48 max-w-48 rounded object-contain"
          draggable={false}
        />
      ) : (
        <div className="mb-2 flex h-24 w-24 items-center justify-center bg-neutral-100 text-neutral-400">
          No image
        </div>
      )}
      {data.name && (
        <p className="text-xs font-medium text-neutral-900 line-clamp-2">{data.name}</p>
      )}
      {data.price && (
        <p className="text-xs text-primary-600 font-medium mt-1">
          {data.currency || "$"}
          {data.price.toFixed(2)}
        </p>
      )}
    </div>
  );
}

function ReadOnlyTextNode({ data }: { data: { text?: string } }) {
  return (
    <div className="max-w-64 rounded-lg border border-neutral-200 bg-white p-3 shadow-soft-md">
      <p className="whitespace-pre-wrap text-sm text-neutral-700">
        {data.text || "Empty note"}
      </p>
    </div>
  );
}

function ReadOnlyColorNode({ data }: { data: { color?: string; name?: string } }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-soft-md">
      <div
        className="h-16 w-16 rounded"
        style={{ backgroundColor: data.color || "#94A3B8" }}
      />
      {data.name && (
        <p className="mt-1 text-center text-xs text-neutral-600">{data.name}</p>
      )}
    </div>
  );
}

const readOnlyNodeTypes: NodeTypes = {
  image: ReadOnlyImageNode,
  product: ReadOnlyProductNode,
  text: ReadOnlyTextNode,
  color: ReadOnlyColorNode,
};

interface PageProps {
  params: Promise<{ shareId: string }>;
}

interface Comment {
  _id: string;
  elementId?: string;
  parentId?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  isResolved?: boolean;
  createdAt: number;
}

export default function PublicSharePage({ params }: PageProps) {
  const { shareId } = use(params);
  const moodboard = useQuery(api.moodboards.getByShareId, { shareId });
  const moodboardId = moodboard?._id as Id<"moodboards"> | undefined;
  const commentsData = useQuery(
    api.comments.listByMoodboard,
    moodboardId ? { moodboardId } : "skip"
  );
  const createComment = useMutation(api.comments.create);

  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Parse canvas state
  let initialNodes: Node[] = [];
  let initialEdges: Edge[] = [];

  if (moodboard?.canvasState) {
    try {
      const parsed = JSON.parse(String(moodboard.canvasState));
      initialNodes = parsed.nodes || [];
      initialEdges = parsed.edges || [];
    } catch {
      // Invalid canvas state
    }
  }

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const comments = (commentsData || []) as unknown as Comment[];
  const unresolvedCount = comments.filter((c) => !c.isResolved && !c.parentId).length;

  const handleSubmitComment = useCallback(async () => {
    if (!moodboardId || !commentName.trim() || !commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        moodboardId,
        elementId: selectedElementId || undefined,
        authorName: commentName.trim(),
        authorEmail: commentEmail.trim() || undefined,
        content: commentContent.trim(),
      });
      setCommentContent("");
      setSelectedElementId(null);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [moodboardId, commentName, commentEmail, commentContent, selectedElementId, createComment]);

  // Loading state
  if (moodboard === undefined) {
    return (
      <div className="flex h-screen flex-col bg-neutral-50">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  // Not found or sharing disabled
  if (moodboard === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 p-8">
        <EmptyState
          icon={Layout}
          title="Moodboard not available"
          description="This moodboard may have been removed, the share link has expired, or sharing has been disabled."
        />
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
            <Eye className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-neutral-900">
              {String(moodboard.name)}
            </h1>
            {moodboard.description && (
              <p className="text-sm text-neutral-500">{String(moodboard.description)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommentPanelOpen(!isCommentPanelOpen)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isCommentPanelOpen
                ? "bg-primary-100 text-primary-700"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Comments
            {unresolvedCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                {unresolvedCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={readOnlyNodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={true}
            panOnScroll={true}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={4}
            className="bg-neutral-50"
          >
            <Background color="#E5E7EB" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!rounded-lg !border-neutral-200 !bg-white !shadow-soft-md"
            />
            <MiniMap
              nodeColor={() => "#94A3B8"}
              maskColor="rgba(255, 255, 255, 0.8)"
              className="!rounded-lg !border-neutral-200 !bg-white !shadow-soft-md"
            />
          </ReactFlow>
        </div>

        {/* Comment Panel */}
        {isCommentPanelOpen && (
          <div className="w-96 border-l border-neutral-200 bg-white flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h2 className="font-display text-sm font-semibold text-neutral-900">
                Comments ({comments.filter((c) => !c.parentId).length})
              </h2>
              <button
                onClick={() => setIsCommentPanelOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4">
              {comments.filter((c) => !c.parentId).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-500">No comments yet</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Be the first to leave feedback!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments
                    .filter((c) => !c.parentId)
                    .map((comment) => {
                      const replies = comments.filter((c) => c.parentId === comment._id);
                      return (
                        <div
                          key={comment._id}
                          className={`rounded-lg border p-3 ${
                            comment.isResolved
                              ? "border-green-200 bg-green-50"
                              : "border-neutral-200 bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-neutral-900">
                                {comment.authorName}
                              </span>
                              <span className="text-xs text-neutral-400 ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            {comment.isResolved && (
                              <span className="text-xs text-green-600 font-medium">
                                Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-700">{comment.content}</p>

                          {/* Replies */}
                          {replies.length > 0 && (
                            <div className="mt-3 space-y-2 border-l-2 border-neutral-200 pl-3">
                              {replies.map((reply) => (
                                <div key={reply._id} className="text-sm">
                                  <span className="font-medium text-neutral-900">
                                    {reply.authorName}
                                  </span>
                                  <span className="text-xs text-neutral-400 ml-2">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                  <p className="text-neutral-600 mt-0.5">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-neutral-200 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex gap-2">
                  <textarea
                    placeholder="Leave your feedback..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentName.trim() || !commentContent.trim() || isSubmitting}
                    className="rounded-lg bg-primary-500 px-4 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
