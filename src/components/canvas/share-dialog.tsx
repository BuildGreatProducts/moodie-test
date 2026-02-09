"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  X,
  Link2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface ShareDialogProps {
  moodboardId: Id<"moodboards">;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ moodboardId, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const moodboard = useQuery(api.moodboards.get, { id: moodboardId });
  const commentCount = useQuery(api.comments.getCommentCount, { moodboardId });
  const generateShareLink = useMutation(api.moodboards.generateShareLink);
  const disableShareLink = useMutation(api.moodboards.disableShareLink);

  // Reset copied state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = moodboard?.shareId
    ? `${window.location.origin}/share/${moodboard.shareId}`
    : null;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      await generateShareLink({
        id: moodboardId,
        expiresInDays,
      });
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDisableLink = async () => {
    try {
      await disableShareLink({ id: moodboardId });
    } catch (error) {
      console.error("Failed to disable share link:", error);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isShareEnabled = moodboard?.shareEnabled;
  const expiresAt = moodboard?.shareExpiresAt as number | undefined;
  const isExpired = expiresAt && expiresAt < Date.now();

  const formatExpirationDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-soft-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <Link2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral-900">
              Share Moodboard
            </h2>
            <p className="text-sm text-neutral-500">
              {String(moodboard?.name || "Moodboard")}
            </p>
          </div>
        </div>

        {/* Share status */}
        <div className="mb-6">
          {isShareEnabled && !isExpired ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Sharing enabled
                </span>
              </div>

              {/* Share URL */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || ""}
                  className="flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-neutral-900"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Open link */}
              <a
                href={shareUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open in new tab
              </a>

              {/* Expiration info */}
              {expiresAt && (
                <div className="mt-3 flex items-center gap-1 text-sm text-green-700">
                  <Calendar className="h-3 w-3" />
                  Expires {formatExpirationDate(expiresAt)}
                </div>
              )}

              {/* Comment count */}
              {commentCount && (commentCount.total > 0 || commentCount.unresolved > 0) && (
                <div className="mt-3 flex items-center gap-1 text-sm text-green-700">
                  <MessageSquare className="h-3 w-3" />
                  {commentCount.total} comment{commentCount.total !== 1 ? "s" : ""}
                  {commentCount.unresolved > 0 && (
                    <span className="ml-1 text-orange-600">
                      ({commentCount.unresolved} unresolved)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : isExpired ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Share link expired
                </span>
              </div>
              <p className="mt-1 text-sm text-orange-700">
                The share link expired on {formatExpirationDate(expiresAt!)}.
                Generate a new link to share again.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">
                  Not shared
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                Generate a share link to let clients view this moodboard and leave comments.
              </p>
            </div>
          )}
        </div>

        {/* Generate/Regenerate/Disable actions */}
        <div className="space-y-4">
          {!isShareEnabled || isExpired ? (
            <>
              {/* Expiration selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Link expiration (optional)
                </label>
                <select
                  value={expiresInDays || ""}
                  onChange={(e) =>
                    setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Never expires</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Generate Share Link
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                Generate New Link
              </button>
              <button
                onClick={handleDisableLink}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <EyeOff className="h-4 w-4" />
                Disable Sharing
              </button>
            </div>
          )}
        </div>

        {/* Info text */}
        <p className="mt-4 text-center text-xs text-neutral-400">
          Anyone with the link can view this moodboard and leave comments.
        </p>
      </div>
    </div>
  );
}
