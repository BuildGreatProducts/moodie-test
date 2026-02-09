"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ProjectModal } from "@/components/dashboard/project-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectGridSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, FolderOpen, Filter, ArrowUpDown } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

type StatusFilter = "all" | "active" | "archived";
type SortOption = "updated" | "created" | "name";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  status: "active" | "archived";
  moodboardCount: number;
  createdAt: number;
  updatedAt: number;
}

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<Id<"projects"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projects = useQuery(api.projects.list, {
    status: statusFilter === "all" ? "all" : statusFilter,
  }) as Project[] | undefined;
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const toggleArchive = useMutation(api.projects.toggleArchive);
  const deleteProject = useMutation(api.projects.remove);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let result = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.clientName?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return b.createdAt - a.createdAt;
        case "updated":
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [projects, searchQuery, sortBy]);

  const handleCreateProject = async (data: {
    name: string;
    description?: string;
    clientName?: string;
    clientEmail?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      setIsCreateModalOpen(false);
      toast({ type: "success", title: "Project created successfully" });
    } catch {
      toast({ type: "error", title: "Failed to create project" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: {
    name: string;
    description?: string;
    clientName?: string;
    clientEmail?: string;
  }) => {
    if (!editingProject) return;
    setIsSubmitting(true);
    try {
      await updateProject({ id: editingProject._id, ...data });
      setEditingProject(null);
      toast({ type: "success", title: "Project updated successfully" });
    } catch {
      toast({ type: "error", title: "Failed to update project" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveProject = async (id: Id<"projects">) => {
    try {
      const result = await toggleArchive({ id });
      toast({
        type: "success",
        title: result.status === "archived" ? "Project archived" : "Project restored",
      });
    } catch {
      toast({ type: "error", title: "Failed to update project" });
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProjectId) return;
    setIsSubmitting(true);
    try {
      await deleteProject({ id: deletingProjectId });
      setDeletingProjectId(null);
      toast({ type: "success", title: "Project deleted successfully" });
    } catch {
      toast({ type: "error", title: "Failed to delete project" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = projects === undefined;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">Projects</h1>
          <p className="mt-1 text-neutral-500">Manage your interior design projects</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary gap-2">
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex gap-2">
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input appearance-none pl-9 pr-8"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input appearance-none pl-9 pr-8"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <ProjectGridSkeleton />
      ) : filteredProjects.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Search}
            title="No projects found"
            description={`No projects match "${searchQuery}". Try a different search term.`}
          />
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project to start organizing your moodboards."
            action={
              <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary gap-2">
                <Plus className="h-5 w-5" />
                Create Project
              </button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={setEditingProject}
              onArchive={handleArchiveProject}
              onDelete={setDeletingProjectId}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isSubmitting}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleUpdateProject}
        project={editingProject}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProjectId}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all moodboards and files associated with it. This action cannot be undone."
        confirmText="Delete Project"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
}
