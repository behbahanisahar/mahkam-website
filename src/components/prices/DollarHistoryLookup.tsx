"use client";

import { useState, useTransition } from "react";
import { formatRial, toPersianDigits } from "@/lib/i18n/fa";
import { lookupDollarByJalali } from "@/lib/actions/prices";

export function DollarHistoryLookup() {
  const [jalali, setJalali] = useState("");
  const [result, setResult] = useState<{
    found: boolean;
    close?: number;
    dateJalali?: string;
    message?: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = await lookupDollarByJalali(jalali.trim());
      setResult(data);
    });
  }

  return (
    <section className="ui-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">آرشیو قیمت دلار</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        تاریخ شمسی را وارد کنید تا قیمت پایانی دلار در آن روز نمایش داده شود.
      </p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={jalali}
          onChange={(e) => setJalali(e.target.value)}
          placeholder="مثال: ۱۴۰۵/۰۴/۲۲"
          dir="rtl"
          className="flex-1 rounded-full border border-glass-border bg-paper px-4 py-3 text-sm outline-none ring-accent/40 focus:ring-2"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-ink inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              در حال جستجو…
            </>
          ) : (
            "مشاهده نرخ"
          )}
        </button>
      </form>

      {result ? (
        <div className="mt-4 rounded-xl border border-glass-border bg-bg-alt/80 p-4">
          {result.found && result.close != null ? (
            <>
              <p className="text-sm text-muted">
                تاریخ: {toPersianDigits(result.dateJalali ?? jalali)}
              </p>
              <p className="mt-1 text-xl font-bold text-ink">{formatRial(result.close)}</p>
              <p className="mt-2 text-xs text-muted">منبع آرشیو: شبکه اطلاع‌رسانی طلا و ارز (TGJU)</p>
            </>
          ) : (
            <p className="text-sm text-muted">
              {result.message ?? "نرخی برای این تاریخ یافت نشد."}
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
