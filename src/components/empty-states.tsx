"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Palette,
  Package,
  MessageSquare,
  Search,
  Plus,
  Sparkles,
  ImagePlus,
} from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-6">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              {action.label}
            </button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700"
            >
              {secondaryAction.label}
            </Link>
          ) : (
            <button
              onClick={secondaryAction.onClick}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700"
            >
              {secondaryAction.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// Pre-configured empty states for common scenarios

export function EmptyProjects({ onCreateProject }: { onCreateProject?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8 text-neutral-400" />}
      title="No projects yet"
      description="Create your first project to start organizing your interior design work. Projects help you group related moodboards together."
      action={{
        label: "Create Project",
        onClick: onCreateProject,
      }}
    />
  );
}

export function EmptyMoodboards({ onCreateMoodboard }: { onCreateMoodboard?: () => void }) {
  return (
    <EmptyState
      icon={<Palette className="h-8 w-8 text-neutral-400" />}
      title="No moodboards yet"
      description="Create your first moodboard to start visualizing your design ideas. Add images, products, and notes to bring your vision to life."
      action={{
        label: "Create Moodboard",
        onClick: onCreateMoodboard,
      }}
    />
  );
}

export function EmptyProducts({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8 text-neutral-400" />}
      title="No products yet"
      description="Start building your product library by adding furniture, decor, and other items you love. Add products via URL or upload images."
      action={{
        label: "Add Product",
        onClick: onAddProduct,
      }}
    />
  );
}

export function EmptyComments() {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8 text-neutral-400" />}
      title="No comments yet"
      description="Share your moodboard with clients to start collecting feedback. Comments will appear here once they're added."
    />
  );
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-neutral-400" />}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search or filters.`
          : "We couldn't find anything matching your criteria. Try adjusting your filters."
      }
    />
  );
}

export function EmptyCanvas({ onUploadImage, onGenerateImage }: {
  onUploadImage?: () => void;
  onGenerateImage?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 mb-6">
        <Palette className="h-10 w-10 text-primary-500" />
      </div>
      <h3 className="font-display text-2xl font-semibold text-neutral-900 mb-2">
        Your canvas is empty
      </h3>
      <p className="text-neutral-600 max-w-md mb-8">
        Start by uploading an inspiration image or let AI generate a room design for you.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onUploadImage}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          <ImagePlus className="h-5 w-5" />
          Upload Image
        </button>
        <button
          onClick={onGenerateImage}
          className="flex items-center gap-2 px-5 py-3 border-2 border-primary-200 text-primary-700 rounded-xl hover:bg-primary-50 transition-colors font-medium"
        >
          <Sparkles className="h-5 w-5" />
          Generate with AI
        </button>
      </div>
    </div>
  );
}

// Loading skeleton components
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-neutral-100 rounded w-1/2 mb-4" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-neutral-100 rounded-full" />
        <div className="h-4 bg-neutral-100 rounded w-20" />
      </div>
    </div>
  );
}

export function MoodboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-neutral-200" />
      <div className="p-4">
        <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-neutral-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200" />
      <div className="p-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-neutral-100 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 rounded"
          style={{ width: `${100 / columns}%` }}
        />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6" />
      <div className="space-y-4">
        <div className="h-4 bg-neutral-100 rounded w-full" />
        <div className="h-4 bg-neutral-100 rounded w-5/6" />
        <div className="h-4 bg-neutral-100 rounded w-4/6" />
      </div>
    </div>
  );
}
