"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function filenameFromUrl(url: string, fallback = "mahkam-product.webp") {
  try {
    const path =
      url.startsWith("http://") || url.startsWith("https://")
        ? new URL(url).pathname
        : url.split("?")[0] ?? url;
    const base = path.split("/").filter(Boolean).pop();
    return base && base.includes(".") ? base : fallback;
  } catch {
    return fallback;
  }
}

export function AdminImageDownloadButton({
  url,
  filename,
  className,
  label = "دانلود تصویر",
}: {
  url: string;
  /** Optional override, e.g. product slug */
  filename?: string;
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    const src = url.trim();
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) throw new Error("دانلود ناموفق بود");
      const blob = await res.blob();
      const name = filename || filenameFromUrl(src);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab if fetch blocked (rare for same-origin)
      try {
        window.open(src, "_blank", "noopener,noreferrer");
      } catch {
        setError("دانلود تصویر ممکن نشد");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={busy || !url.trim()}
        onClick={() => void onDownload()}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border border-glass-border px-3 py-2 text-xs font-medium text-ink hover:bg-bg-alt disabled:opacity-60",
          className,
        )}
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        {label}
      </button>
      {error ? <span className="text-[10px] text-red-600">{error}</span> : null}
    </span>
  );
}
