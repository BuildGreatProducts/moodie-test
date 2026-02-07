"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { MoodboardCanvas, CanvasState } from "@/components/canvas/moodboard-canvas";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowLeft, Layout, Check, Loader2, AlertCircle, Settings } from "lucide-react";

interface Moodboard {
  _id: Id<"moodboards">;
  projectId: Id<"projects">;
  name: string;
  description?: string;
  canvasState?: string;
  thumbnailUrl?: string;
  shareEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type SaveStatus = "saving" | "saved" | "error";

export default function MoodboardEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const moodboard = useQuery(api.moodboards.get, { id: id as Id<"moodboards"> }) as Moodboard | null | undefined;
  const updateCanvasState = useMutation(api.moodboards.updateCanvasState);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [initialState, setInitialState] = useState<CanvasState | null>(null);
  const lastMoodboardIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse initial canvas state - runs when moodboard changes
  useEffect(() => {
    // Only update if we have a new moodboard ID
    const moodboardId = moodboard?._id;
    if (moodboardId && moodboardId !== lastMoodboardIdRef.current) {
      lastMoodboardIdRef.current = moodboardId;

      if (moodboard.canvasState) {
        try {
          const parsed = JSON.parse(moodboard.canvasState);
          setInitialState(parsed);
        } catch {
          setInitialState({
            nodes: [],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
          });
        }
      } else {
        setInitialState({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      }
    }
  }, [moodboard?._id, moodboard?.canvasState]);

  // Handle canvas state changes (auto-save with page-level status management)
  const handleStateChange = useCallback(
    (state: CanvasState) => {
      // Clear any existing save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Show saving status
      setSaveStatus("saving");

      // Debounce the actual save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateCanvasState({
            id: id as Id<"moodboards">,
            canvasState: JSON.stringify(state),
          });
          setSaveStatus("saved");
        } catch (error) {
          console.error("Failed to save canvas state:", error);
          setSaveStatus("error");
        }
      }, 300);
    },
    [id, updateCanvasState]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (moodboard === undefined) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 bg-neutral-100">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  // Not found state
  if (moodboard === null) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={Layout}
          title="Moodboard not found"
          description="This moodboard may have been deleted or you don't have access to it."
          action={
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          }
        />
      </div>
    );
  }

  // Wait for initial state to be parsed
  if (!initialState) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${moodboard.projectId}`}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="h-6 w-px bg-neutral-200" />

          <h1 className="font-display text-lg font-semibold text-neutral-900">{moodboard.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                <span className="text-neutral-500">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-neutral-500">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Error saving</span>
              </>
            )}
          </div>

          {/* Settings button */}
          <button
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            title="Moodboard settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Canvas - no longer needs onSaveStatus since page manages it */}
      <div className="flex-1">
        <MoodboardCanvas
          moodboardId={moodboard._id}
          initialState={initialState}
          onStateChange={handleStateChange}
        />
      </div>
    </div>
  );
}
