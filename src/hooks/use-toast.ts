"use client";

import { useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastState = {
  toasts: Toast[];
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: { type: "ADD_TOAST" | "REMOVE_TOAST"; toast?: Toast; id?: string }) {
  if (action.type === "ADD_TOAST" && action.toast) {
    memoryState = {
      toasts: [...memoryState.toasts, action.toast],
    };
  }

  if (action.type === "REMOVE_TOAST" && action.id) {
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== action.id),
    };
  }

  listeners.forEach((listener) => listener(memoryState));
}

let toastCount = 0;

export function toast({
  type = "info",
  title,
  description,
  duration = 5000,
}: {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}) {
  const id = `toast-${++toastCount}`;

  const newToast: Toast = {
    id,
    type,
    title,
    description,
    duration,
  };

  dispatch({ type: "ADD_TOAST", toast: newToast });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id });
    }, duration);
  }

  return id;
}

export function dismissToast(id: string) {
  dispatch({ type: "REMOVE_TOAST", id });
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts: state.toasts,
    toast: useCallback(
      (props: { type?: ToastType; title: string; description?: string; duration?: number }) =>
        toast(props),
      []
    ),
    dismiss: useCallback((id: string) => dismissToast(id), []),
  };
}
