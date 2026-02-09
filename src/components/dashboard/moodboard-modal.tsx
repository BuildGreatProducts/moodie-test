"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { ImagePlus, Sparkles, Grid3X3 } from "lucide-react";

type StartingPoint = "blank" | "upload" | "generate";

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    startingPoint: StartingPoint;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function MoodboardModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: MoodboardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("blank");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setStartingPoint("blank");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      startingPoint,
    });
  };

  const startingPoints = [
    {
      id: "blank" as const,
      icon: Grid3X3,
      label: "Blank Canvas",
      description: "Start with an empty moodboard",
    },
    {
      id: "upload" as const,
      icon: ImagePlus,
      label: "Upload Image",
      description: "Start with an uploaded image",
    },
    {
      id: "generate" as const,
      icon: Sparkles,
      label: "AI Generate",
      description: "Generate a starting image with AI",
      disabled: true,
      comingSoon: true,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Moodboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="moodboard-name" className="label mb-1 block">
            Moodboard Name <span className="text-red-500">*</span>
          </label>
          <input
            id="moodboard-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Living Room Inspiration"
            className="input"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="moodboard-description" className="label mb-1 block">
            Description
          </label>
          <textarea
            id="moodboard-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this moodboard..."
            className="input min-h-[60px] resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="label mb-2 block">Starting Point</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {startingPoints.map((option) => {
              const Icon = option.icon;
              const isSelected = startingPoint === option.id;
              const isDisabled = option.disabled;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => !isDisabled && setStartingPoint(option.id)}
                  disabled={isDisabled}
                  className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : isDisabled
                        ? "cursor-not-allowed border-neutral-100 bg-neutral-50 opacity-60"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {option.comingSoon && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                      Soon
                    </span>
                  )}
                  <Icon
                    className={`mb-2 h-6 w-6 ${
                      isSelected ? "text-primary-600" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-primary-700" : "text-neutral-700"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 text-xs text-neutral-500">{option.description}</span>
                </button>
              );
            })}
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
                Creating...
              </span>
            ) : (
              "Create Moodboard"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
