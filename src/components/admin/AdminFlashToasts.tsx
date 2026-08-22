"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

const FLASH: Record<string, { type: "success" | "error"; message: string }> = {
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
  "error:name": { type: "error", message: "نام محصول را وارد کنید." },
  "error:slug": {
    type: "error",
    message: "این آدرس (اسلاگ) قبلاً استفاده شده. اسلاگ را عوض کنید یا خالی بگذارید تا خودکار ساخته شود.",
  },
  "error:category": { type: "error", message: "دسته‌بندی نامعتبر است. دسته را دوباره انتخاب کنید." },
  "error:save": {
    type: "error",
    message: "ذخیره محصول ناموفق بود. متن را بدون کاراکترهای پنهان ورد دوباره ذخیره کنید.",
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

    for (const key of keys) {
      const flash = FLASH[key];
      if (flash) toast(flash.message, { type: flash.type });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    params.delete("deleted");
    params.delete("error");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
