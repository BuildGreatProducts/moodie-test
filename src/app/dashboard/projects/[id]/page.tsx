"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { MoodboardModal } from "@/components/dashboard/moodboard-modal";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layout, Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

interface Moodboard {
  _id: Id<"moodboards">;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  shareEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ProjectWithMoodboards {
  _id: Id<"projects">;
  name: string;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
  moodboards: Moodboard[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const project = useQuery(api.projects.get, { id: id as Id<"projects"> }) as
    | ProjectWithMoodboards
    | null
    | undefined;

  const createMoodboard = useMutation(api.moodboards.create);
  const deleteMoodboard = useMutation(api.moodboards.remove);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMoodboard, setSelectedMoodboard] = useState<Moodboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleCreateMoodboard = async (data: {
    name: string;
    description?: string;
    startingPoint: "blank" | "upload" | "generate";
  }) => {
    setIsLoading(true);
    try {
      const moodboardId = await createMoodboard({
        projectId: id as Id<"projects">,
        name: data.name,
        description: data.description,
      });
      setIsCreateModalOpen(false);
      toast({
        title: "Moodboard created",
        description: `"${data.name}" has been created successfully.`,
      });
      // Navigate to the canvas editor
      router.push(`/dashboard/moodboard/${moodboardId}`);
    } catch (error) {
      toast({
        type: "error",
        title: "Error",
        description: "Failed to create moodboard. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMoodboard = async () => {
    if (!selectedMoodboard) return;
    setIsLoading(true);
    try {
      await deleteMoodboard({ id: selectedMoodboard._id });
      setIsDeleteModalOpen(false);
      setSelectedMoodboard(null);
      toast({
        type: "success",
        title: "Moodboard deleted",
        description: `"${selectedMoodboard.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Error",
        description: "Failed to delete moodboard. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (project === undefined) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          icon={Layout}
          title="Project not found"
          description="This project may have been deleted or you don't have access to it."
          action={
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-neutral-900">{project.name}</h1>
            {project.clientName && (
              <p className="mt-1 text-neutral-500">Client: {project.clientName}</p>
            )}
            {project.description && <p className="mt-2 text-neutral-600">{project.description}</p>}
          </div>

          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary gap-2">
            <Plus className="h-5 w-5" />
            New Moodboard
          </button>
        </div>
      </div>

      {/* Moodboards Grid */}
      {project.moodboards.length === 0 ? (
        <EmptyState
          icon={Layout}
          title="No moodboards yet"
          description="Create your first moodboard to start designing."
          action={
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary gap-2">
              <Plus className="h-5 w-5" />
              Create Moodboard
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.moodboards.map((moodboard) => (
            <div key={moodboard._id} className="card group relative transition-shadow hover:shadow-soft-md">
              {/* Clickable area for navigation */}
              <Link
                href={`/dashboard/moodboard/${moodboard._id}`}
                className="absolute inset-0 z-0"
                aria-label={`Open ${moodboard.name}`}
              />

              {/* Thumbnail */}
              <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-neutral-100">
                {moodboard.thumbnailUrl ? (
                  <img
                    src={moodboard.thumbnailUrl}
                    alt={moodboard.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Layout className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-neutral-900">{moodboard.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Updated {formatRelativeTime(moodboard.updatedAt)}
                  </p>
                </div>

                {/* Context menu */}
                <div className="relative z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === moodboard._id ? null : moodboard._id);
                    }}
                    className="rounded-md p-1 opacity-0 transition-opacity hover:bg-neutral-100 group-hover:opacity-100"
                    aria-label="Moodboard options"
                  >
                    <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                  </button>

                  {openMenuId === moodboard._id && (
                    <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      <Link
                        href={`/dashboard/moodboard/${moodboard._id}`}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedMoodboard(moodboard);
                          setIsDeleteModalOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Share indicator */}
              {moodboard.shareEnabled && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Shared
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Moodboard Modal */}
      <MoodboardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMoodboard}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMoodboard(null);
        }}
        onConfirm={handleDeleteMoodboard}
        title="Delete Moodboard"
        message={`Are you sure you want to delete "${selectedMoodboard?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isLoading}
        variant="danger"
      />
    </div>
  );
}
