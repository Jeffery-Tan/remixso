"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
}

interface ToastContextType {
  addToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [closing, setClosing] = useState<Set<string>>(new Set());

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setClosing((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setClosing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            isClosing={closing.has(toast.id)}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  message,
  type = "info",
  isClosing,
  onDismiss,
}: Toast & { isClosing: boolean; onDismiss: () => void }) {
  useEffect(() => {
    if (isClosing) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [isClosing, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm min-w-[280px] transition-all duration-200",
        isClosing
          ? "opacity-0 translate-x-4 scale-95"
          : "animate-in slide-in-from-right",
        {
          info: "bg-[var(--surface-bright)] border-[var(--border)]",
          success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400",
          error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400",
        }[type]
      )}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-current opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
