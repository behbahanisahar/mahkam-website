"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

const FLASH: Record<string, { type: Toast["type"]; message: string }> = {
  "saved:1": { type: "success", message: "با موفقیت ذخیره شد." },
  "deleted:1": { type: "success", message: "حذف شد." },
  "error:1": { type: "error", message: "عملیات ناموفق بود. دوباره تلاش کنید." },
  "error:login": { type: "error", message: "ایمیل یا رمز عبور نادرست است." },
  "error:db": {
    type: "error",
    message: "ارتباط با دیتابیس برقرار نشد. Postgres را چک کنید و دوباره تلاش کنید.",
  },
  "error:sync": {
    type: "error",
    message: "همگام‌سازی TGJU ناموفق بود. کمی بعد دوباره تلاش کنید.",
  },
  "error:password": {
    type: "error",
    message: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
  },
};

export function AdminFlashToasts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const saved = searchParams.get("saved");
    const deleted = searchParams.get("deleted");
    const error = searchParams.get("error");

    const keys = [
      saved ? `saved:${saved}` : null,
      deleted ? `deleted:${deleted}` : null,
      error ? `error:${error}` : null,
    ].filter(Boolean) as string[];

    if (keys.length === 0) return;

    const next: Toast[] = [];
    for (const key of keys) {
      const flash = FLASH[key];
      if (flash) {
        next.push({ id: Date.now() + next.length, ...flash });
      }
    }
    if (next.length === 0) return;

    setToasts((prev) => [...prev, ...next]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    params.delete("deleted");
    params.delete("error");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4200),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:top-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
              : "border-red-200 bg-red-50/95 text-red-900",
          )}
          role="status"
        >
          {t.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
          )}
          <p className="flex-1 leading-6">{t.message}</p>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-1 opacity-60 transition hover:opacity-100"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
