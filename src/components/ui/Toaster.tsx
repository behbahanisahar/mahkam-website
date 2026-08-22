"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastEvent = ToastItem & { duration: number };

let nextId = 1;
const listeners = new Set<(toast: ToastEvent) => void>();

export function toast(message: string, opts?: { type?: ToastType; duration?: number }) {
  const item: ToastEvent = {
    id: nextId++,
    type: opts?.type ?? "info",
    message,
    duration: opts?.duration ?? 4200,
  };
  listeners.forEach((fn) => fn(item));
}

function subscribeToasts(listener: (toast: ToastEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((item) => {
      setToasts((prev) => [...prev, { id: item.id, type: item.type, message: item.message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, item.duration);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-2 px-4 md:top-6">
      {toasts.map((t) => {
        const tone =
          t.type === "success"
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
            : t.type === "error"
              ? "border-red-200 bg-red-50/95 text-red-900"
              : "border-glass-border bg-white/95 text-ink";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${tone}`}
            role="status"
          >
            <p className="flex-1 leading-6">{t.message}</p>
            <button
              type="button"
              className="cursor-pointer rounded-lg px-1.5 py-0.5 text-base leading-none opacity-60 transition hover:opacity-100"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="بستن"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
