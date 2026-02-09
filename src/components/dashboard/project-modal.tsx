"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Id } from "../../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  status: "active" | "archived";
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    clientName?: string;
    clientEmail?: string;
  }) => Promise<void>;
  project?: Project | null;
  isLoading?: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const isEditing = !!project;

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setClientName(project.clientName ?? "");
      setClientEmail(project.clientEmail ?? "");
    } else if (!isOpen) {
      setName("");
      setDescription("");
      setClientName("");
      setClientEmail("");
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      clientName: clientName.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Project" : "New Project"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label mb-1 block">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Living Room Redesign"
            className="input"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="label mb-1 block">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
            className="input min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="clientName" className="label mb-1 block">
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., John Smith"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="clientEmail" className="label mb-1 block">
              Client Email
            </label>
            <input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="e.g., john@example.com"
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEditing ? "Saving..." : "Creating..."}
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
