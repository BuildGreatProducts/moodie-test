"use client";

import { X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  feature?: string;
}

export function UpgradePrompt({
  isOpen,
  onClose,
  title = "Upgrade to Pro",
  message,
  feature,
}: UpgradePromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-soft-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="font-display text-xl font-semibold text-neutral-900">
            {title}
          </h2>
        </div>

        <p className="text-neutral-600 mb-6">{message}</p>

        {feature && (
          <div className="mb-6 rounded-lg bg-primary-50 p-4">
            <p className="text-sm text-primary-800">
              <strong>Pro plan includes:</strong> {feature}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Maybe later
          </button>
          <Link
            href="/pricing"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
