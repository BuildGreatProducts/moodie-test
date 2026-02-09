"use client";

import { Modal } from "./modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading,
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex gap-4">
        <div
          className={`flex-shrink-0 rounded-full p-2 ${
            variant === "danger" ? "bg-red-100" : "bg-yellow-100"
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${variant === "danger" ? "text-red-600" : "text-yellow-600"}`}
          />
        </div>
        <div>
          <p className="text-neutral-600">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={variant === "danger" ? "btn-destructive" : "btn-primary"}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}
