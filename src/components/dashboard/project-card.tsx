"use client";

import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import { MoreHorizontal, FolderOpen, Archive, Trash2, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  clientName?: string;
  status: "active" | "archived";
  moodboardCount: number;
  createdAt: number;
  updatedAt: number;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onArchive: (id: Id<"projects">) => void;
  onDelete: (id: Id<"projects">) => void;
}

export function ProjectCard({ project, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        "card group relative transition-shadow hover:shadow-soft-md",
        project.status === "archived" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <Link href={`/dashboard/projects/${project._id}`} className="flex-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary-500" />
            <h3 className="font-display font-semibold text-neutral-900">{project.name}</h3>
          </div>
          {project.clientName && (
            <p className="mt-1 text-sm text-neutral-500">Client: {project.clientName}</p>
          )}
        </Link>

        {/* More menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1 opacity-0 transition-opacity hover:bg-neutral-100 group-hover:opacity-100"
            aria-label="Project options"
          >
            <MoreHorizontal className="h-5 w-5 text-neutral-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-soft-md">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(project);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onArchive(project._id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Archive className="h-4 w-4" />
                {project.status === "active" ? "Archive" : "Unarchive"}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project._id);
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

      <Link href={`/dashboard/projects/${project._id}`}>
        {project.description && (
          <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{project.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>
            {project.moodboardCount} moodboard{project.moodboardCount !== 1 ? "s" : ""}
          </span>
          <span>{formatRelativeTime(project.updatedAt)}</span>
        </div>
      </Link>

      {project.status === "archived" && (
        <span className="absolute right-3 top-3 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
          Archived
        </span>
      )}
    </div>
  );
}
