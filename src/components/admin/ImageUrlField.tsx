"use client";

import { useState } from "react";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<OurFileRouter>();

export function ImageUrlField({
  defaultValue = "",
  enableUpload = false,
}: {
  defaultValue?: string;
  enableUpload?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <input type="hidden" name="imageUrl" value={url} />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2 text-sm text-ink"
        dir="ltr"
      />
      {enableUpload ? (
        <UploadButton
          endpoint="productImage"
          onClientUploadComplete={(res) => {
            const first = res?.[0];
            if (first?.url) setUrl(first.url);
          }}
          onUploadError={(e) => alert(e.message)}
        appearance={{
          button:
            "cursor-pointer rounded-xl bg-accent/40 px-3 py-2 text-xs text-ink ut-ready:bg-accent/50",
          container: "w-fit",
        }}
          content={{ button: "آپلود تصویر" }}
        />
      ) : (
        <p className="text-xs text-muted">
          برای آپلود فایل، <span dir="ltr">UPLOADTHING_TOKEN</span> را در env تنظیم کنید؛ فعلاً آدرس
          تصویر را در فیلد بالا وارد کنید.
        </p>
      )}
    </div>
  );
}
