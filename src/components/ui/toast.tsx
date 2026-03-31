"use client";

import { X } from "lucide-react";

export interface ToastState {
  id: number;
  message: string;
  type?: "error" | "success" | "info";
}

interface ToastProps {
  message: string;
  type?: ToastState["type"];
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const baseClasses =
    "fixed bottom-4 right-4 z-[9999] flex items-start gap-3 rounded-lg border px-4 py-3 text-xs shadow-lg max-w-xs animate-slide-up";

  const typeClasses =
    type === "error"
      ? "bg-red-800 border-red-400/70"
      : type === "success"
        ? "bg-emerald-950/80 border-emerald-500/70"
        : "bg-slate-900/90 border-slate-600 text-slate-50";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="mt-0.5 ml-2 text-[10px] uppercase tracking-wide text-slate-200 hover:text-white flex items-center gap-1"
      >
        <X className="h-3 w-3" />
        Fechar
      </button>
    </div>
  );
}
