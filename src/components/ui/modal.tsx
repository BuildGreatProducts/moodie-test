"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-soft-lg",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-xl font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-neutral-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
