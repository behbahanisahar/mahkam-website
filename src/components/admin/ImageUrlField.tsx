"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  defaultValue?: string;
};

export function ImageUrlField({ defaultValue = "" }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "آپلود ناموفق بود");
      }
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  const preview = url.trim();

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageUrl" value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-glass-border bg-white/70 p-4 transition",
          dragOver && "border-copper bg-copper/5",
          uploading && "opacity-80",
        )}
      >
        {preview ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-bg-alt sm:h-24 sm:w-36">
              <Image
                src={preview}
                alt="پیش‌نمایش تصویر محصول"
                fill
                unoptimized
                className="object-cover"
                sizes="144px"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="truncate text-xs text-muted" dir="ltr">
                {preview}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent/40 px-3 py-2 text-xs font-medium text-ink hover:bg-accent/55 disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  جایگزینی تصویر
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setUrl("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-glass-border px-3 py-2 text-xs font-medium text-ink hover:bg-bg-alt disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 py-6 text-sm text-muted"
          >
            {uploading ? (
              <Loader2 className="size-8 animate-spin text-copper" />
            ) : (
              <ImagePlus className="size-8 text-copper" />
            )}
            <span className="font-medium text-ink">
              {uploading ? "در حال آپلود و بهینه‌سازی…" : "آپلود تصویر محصول"}
            </span>
            <span className="text-xs">کشیدن و رها کردن یا انتخاب فایل — JPEG / PNG / WebP / AVIF تا ۵ مگابایت</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <label className="block text-xs text-muted">
        یا آدرس تصویر را وارد کنید
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="/uploads/products/… یا https://…"
          className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2 text-sm text-ink"
          dir="ltr"
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
