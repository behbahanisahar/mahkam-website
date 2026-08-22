"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatRial, toPersianDigits } from "@/lib/i18n/fa";
import {
  formatJalaliKey,
  jalaliDaysInMonth,
  jalaliMonthName,
  jalaliWeekdaySat0,
  parseJalaliParts,
} from "@/lib/i18n/jalali";
import { lookupDollarByJalali } from "@/lib/actions/prices";
import { cn } from "@/lib/utils";

export type ArchivePickerDate = {
  jalali: string;
  close: number;
};

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function normalizeJalaliKey(raw: string): string | null {
  const parts = parseJalaliParts(raw);
  if (!parts) return null;
  return formatJalaliKey(parts.y, parts.m, parts.d);
}

type LookupResult = {
  found: boolean;
  close?: number;
  dateJalali?: string;
  message?: string;
};

export function DollarHistoryLookup({
  availableDates,
}: {
  availableDates: ArchivePickerDate[];
}) {
  const [jalali, setJalali] = useState("");
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const byKey = useMemo(() => {
    const map = new Map<string, ArchivePickerDate>();
    for (const row of availableDates) {
      const key = normalizeJalaliKey(row.jalali);
      if (!key) continue;
      map.set(key, { jalali: key, close: row.close });
    }
    return map;
  }, [availableDates]);

  const monthKeys = useMemo(() => {
    const set = new Set<string>();
    for (const key of byKey.keys()) {
      const [y, mo] = key.split("/");
      set.add(`${y}/${mo}`);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [byKey]);

  const [monthIndex, setMonthIndex] = useState(0);

  useEffect(() => {
    setMonthIndex(0);
  }, [monthKeys.length]);

  const activeMonth = monthKeys[monthIndex] ?? null;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function applyFound(row: ArchivePickerDate) {
    setJalali(row.jalali);
    setResult({
      found: true,
      close: row.close,
      dateJalali: row.jalali,
    });
  }

  function lookup(value: string) {
    const key = normalizeJalaliKey(value);
    if (key && byKey.has(key)) {
      applyFound(byKey.get(key)!);
      return;
    }
    startTransition(async () => {
      const data = await lookupDollarByJalali(value.trim());
      setResult(data);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jalali.trim()) {
      setOpen(true);
      return;
    }
    const key = normalizeJalaliKey(jalali);
    if (!key) {
      setResult({
        found: false,
        message: "تاریخ را به صورت سال/ماه/روز وارد کنید؛ مثل ۱۴۰۵/۰۴/۲۲.",
      });
      return;
    }
    if (byKey.size > 0 && !byKey.has(key)) {
      setResult({
        found: false,
        message: "این تاریخ در آرشیو مهکام نیست. فقط روزهای فعال تقویم قابل انتخاب‌اند.",
      });
      return;
    }
    lookup(jalali);
  }

  function selectDay(row: ArchivePickerDate) {
    setOpen(false);
    setManual(false);
    applyFound(row);
  }

  const calendar = useMemo(() => {
    if (!activeMonth) return null;
    const [y, mo] = activeMonth.split("/").map(Number);
    const total = jalaliDaysInMonth(y, mo);
    const offset = jalaliWeekdaySat0(y, mo, 1);
    const cells: Array<
      | { kind: "empty"; key: string }
      | { kind: "day"; day: number; row: ArchivePickerDate | null }
    > = [];

    for (let i = 0; i < offset; i += 1) {
      cells.push({ kind: "empty", key: `e-${i}` });
    }
    for (let day = 1; day <= total; day += 1) {
      const key = formatJalaliKey(y, mo, day);
      cells.push({
        kind: "day",
        day,
        row: byKey.get(key) ?? null,
      });
    }
    return {
      title: `${jalaliMonthName(mo)} ${toPersianDigits(y)}`,
      cells,
    };
  }, [activeMonth, byKey]);

  const displayValue = jalali ? toPersianDigits(jalali) : "";

  return (
    <section className="ui-card p-5 sm:p-6" ref={rootRef}>
      <h2 className="text-lg font-semibold text-ink">آرشیو قیمت دلار</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        با انتخابگر تاریخ شمسی، فقط روزهایی که در آرشیو سایت ذخیره شده‌اند فعال‌اند.
      </p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="relative">
            <input
              value={displayValue}
              readOnly={!manual}
              onChange={(e) => {
                if (!manual) return;
                setJalali(toLatinDigits(e.target.value));
                setResult(null);
              }}
              onClick={() => {
                if (availableDates.length === 0) return;
                if (!manual) setOpen(true);
              }}
              placeholder="تاریخ شمسی را انتخاب کنید"
              dir="rtl"
              autoComplete="off"
              inputMode={manual ? "numeric" : "none"}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                "w-full rounded-full border border-glass-border bg-paper py-3 pe-4 ps-12 text-sm outline-none ring-accent/40 focus:ring-2",
                !manual && "cursor-pointer",
              )}
              required={!manual}
            />
            <button
              type="button"
              aria-label="باز کردن انتخابگر تاریخ"
              disabled={availableDates.length === 0}
              onClick={() => setOpen((v) => !v)}
              className="absolute start-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink disabled:opacity-40"
            >
              <CalendarDays className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setManual((v) => !v);
              setOpen(false);
            }}
            className="mt-2 text-xs font-medium text-copper hover:underline"
          >
            {manual ? "بازگشت به انتخابگر تاریخ" : "ورود دستی تاریخ"}
          </button>

          {open && calendar ? (
            <div
              role="dialog"
              aria-label="انتخابگر تاریخ شمسی آرشیو"
              dir="ltr"
              className="absolute start-0 top-[calc(100%+0.35rem)] z-30 w-[15.5rem] overflow-hidden rounded-xl border border-glass-border bg-white p-2 shadow-lg shadow-ink/10"
            >
              <div className="mb-1.5 flex items-center justify-between gap-1" dir="rtl">
                <button
                  type="button"
                  aria-label="ماه جدیدتر"
                  disabled={monthIndex <= 0}
                  onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex size-7 items-center justify-center rounded-full border border-glass-border text-ink disabled:opacity-35"
                >
                  <ChevronRight className="size-3.5" />
                </button>
                <p className="text-xs font-bold text-ink">{calendar.title}</p>
                <button
                  type="button"
                  aria-label="ماه قدیمی‌تر"
                  disabled={monthIndex >= monthKeys.length - 1}
                  onClick={() =>
                    setMonthIndex((i) => Math.min(monthKeys.length - 1, i + 1))
                  }
                  className="inline-flex size-7 items-center justify-center rounded-full border border-glass-border text-ink disabled:opacity-35"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-muted">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-0.5">
                    {w}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {calendar.cells.map((cell) => {
                  if (cell.kind === "empty") {
                    return <span key={cell.key} className="h-7" />;
                  }

                  // Only dates present in DollarDaily are selectable.
                  if (!cell.row) {
                    return (
                      <span
                        key={`${activeMonth}-${cell.day}`}
                        aria-disabled="true"
                        title="در آرشیو موجود نیست"
                        className="flex h-7 items-center justify-center text-xs tabular-nums text-ink/15"
                      >
                        {toPersianDigits(cell.day)}
                      </span>
                    );
                  }

                  const selected =
                    normalizeJalaliKey(jalali) ===
                    normalizeJalaliKey(cell.row.jalali);
                  return (
                    <button
                      key={`${activeMonth}-${cell.day}`}
                      type="button"
                      onClick={() => selectDay(cell.row!)}
                      title={toPersianDigits(cell.row.jalali)}
                      className={cn(
                        "flex h-7 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition",
                        selected
                          ? "bg-ink text-white"
                          : "bg-bg-alt text-ink hover:bg-copper/15 hover:text-copper-deep",
                      )}
                    >
                      {toPersianDigits(cell.day)}
                    </button>
                  );
                })}
              </div>

              <p className="mt-1.5 text-[10px] leading-4 text-muted" dir="rtl">
                فقط روزهای رنگی در آرشیو هستند؛ بقیه قابل انتخاب نیستند.
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending || !jalali.trim()}
          className="btn-ink h-[46px] shrink-0 self-start inline-flex items-center justify-center gap-2 px-5 text-sm font-medium disabled:cursor-wait disabled:opacity-60 sm:self-auto"
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

      {availableDates.length === 0 ? (
        <p className="mt-3 text-xs text-muted">
          هنوز تاریخی در آرشیو نیست. پس از همگام‌سازی روزانه، انتخابگر تاریخ فعال می‌شود.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">
          {toPersianDigits(availableDates.length)} روز در آرشیو موجود است.
        </p>
      )}

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
