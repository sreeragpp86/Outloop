"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Top-Right Fixed Toast Notification Area */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border p-3.5 shadow-xl backdrop-blur-md text-xs font-medium transition-all animate-in slide-in-from-top-2 duration-200 ${
              t.type === "success"
                ? "bg-zinc-950/95 border-emerald-500/30 text-white"
                : t.type === "error"
                ? "bg-zinc-950/95 border-rose-500/40 text-rose-100"
                : "bg-zinc-950/95 border-zinc-800 text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="h-4 w-4 text-sky-400 shrink-0" />
              )}
              <span className="truncate">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white shrink-0 p-1 rounded hover:bg-zinc-800/60 transition-colors"
              title="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
