"use client";

import { useToast, dismissToast, Toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

function ToastItem({ toast }: { toast: Toast }) {
  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-soft-md",
        colors[toast.type]
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", iconColors[toast.type])} />
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
