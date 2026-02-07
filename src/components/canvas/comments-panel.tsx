"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  X,
  MessageSquare,
  Send,
  CheckCircle,
  Circle,
  Reply,
  Trash2,
} from "lucide-react";

interface CommentsPanelProps {
  moodboardId: Id<"moodboards">;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  _id: Id<"comments">;
  elementId?: string;
  parentId?: Id<"comments">;
  authorName: string;
  authorEmail?: string;
  authorUserId?: Id<"users">;
  content: string;
  isResolved?: boolean;
  createdAt: number;
}

export function CommentsPanel({ moodboardId, isOpen, onClose }: CommentsPanelProps) {
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const commentsData = useQuery(api.comments.listByMoodboard, { moodboardId });
  const replyToComment = useMutation(api.comments.reply);
  const toggleResolved = useMutation(api.comments.toggleResolved);
  const deleteComment = useMutation(api.comments.remove);

  const comments = (commentsData || []) as unknown as Comment[];
  const rootComments = comments.filter((c) => !c.parentId);
  const unresolvedComments = rootComments.filter((c) => !c.isResolved);
  const resolvedComments = rootComments.filter((c) => c.isResolved);

  const handleReply = useCallback(async () => {
    if (!replyingTo || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await replyToComment({
        parentId: replyingTo,
        content: replyContent.trim(),
      });
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [replyingTo, replyContent, replyToComment]);

  const handleToggleResolved = useCallback(
    async (commentId: Id<"comments">) => {
      try {
        await toggleResolved({ id: commentId });
      } catch (error) {
        console.error("Failed to toggle resolved:", error);
      }
    },
    [toggleResolved]
  );

  const handleDelete = useCallback(
    async (commentId: Id<"comments">) => {
      if (!confirm("Are you sure you want to delete this comment?")) return;

      try {
        await deleteComment({ id: commentId });
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    },
    [deleteComment]
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  const renderComment = (comment: Comment) => {
    const replies = comments.filter((c) => c.parentId === comment._id);
    const isReplying = replyingTo === comment._id;

    return (
      <div
        key={comment._id}
        className={`rounded-lg border p-3 ${
          comment.isResolved
            ? "border-green-200 bg-green-50"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleResolved(comment._id)}
              className="text-neutral-400 hover:text-primary-600"
              title={comment.isResolved ? "Mark as unresolved" : "Mark as resolved"}
            >
              {comment.isResolved ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
            <div>
              <span className="text-sm font-medium text-neutral-900">
                {comment.authorName}
              </span>
              {comment.authorUserId && (
                <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                  Designer
                </span>
              )}
              <span className="text-xs text-neutral-400 ml-2">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(comment._id)}
            className="text-neutral-300 hover:text-red-500"
            title="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-neutral-700 mb-2">{comment.content}</p>

        {/* Reply button */}
        <button
          onClick={() => setReplyingTo(isReplying ? null : comment._id)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600"
        >
          <Reply className="h-3 w-3" />
          {isReplying ? "Cancel" : "Reply"}
        </button>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-neutral-200 pl-3">
            {replies.map((reply) => (
              <div key={reply._id} className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-neutral-900">{reply.authorName}</span>
                  {reply.authorUserId && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                      Designer
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 ml-1">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-neutral-600 mt-0.5">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || isSubmitting}
              className="rounded-lg bg-primary-500 px-3 py-1.5 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white shadow-2xl transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
            <MessageSquare className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-neutral-900">
              Comments
            </h3>
            <p className="text-xs text-neutral-500">
              {unresolvedComments.length} unresolved
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Filter */}
      <div className="border-b border-neutral-200 px-4 py-2">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          Show resolved comments
        </label>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4">
        {rootComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm font-medium text-neutral-700">No comments yet</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
              Share your moodboard to receive feedback from clients.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unresolved comments */}
            {unresolvedComments.map(renderComment)}

            {/* Resolved comments */}
            {showResolved && resolvedComments.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-4">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-xs text-neutral-400">
                    Resolved ({resolvedComments.length})
                  </span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
                {resolvedComments.map(renderComment)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
