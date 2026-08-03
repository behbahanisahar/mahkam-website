"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  Cylinder,
  Layers3,
  Minus,
  Radio,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LiveDataRate, LiveDataResult } from "@/lib/prices/livedata";
import { formatFetchedAt, formatLiveDataQuoteTime, formatNumberFa, toPersianDigits } from "@/lib/i18n/fa";
import { cn } from "@/lib/utils";

const RATE_THEME: Record<
  string,
  {
    icon: typeof CircleDollarSign;
    label: string;
    accent: string;
    bar: string;
  }
> = {
  "200101": {
    icon: CircleDollarSign,
    label: "ارز",
    accent: "text-emerald-300",
    bar: "bg-emerald-400",
  },
  "301006": {
    icon: Cylinder,
    label: "فلز",
    accent: "text-copper-light",
    bar: "bg-copper",
  },
  "300606": {
    icon: Layers3,
    label: "فلز",
    accent: "text-slate-300",
    bar: "bg-slate-400",
  },
};

function formatMainValue(rate: LiveDataRate) {
  if (rate.unit === "تومان") return Math.round(rate.value);
  return rate.value;
}

function formatChangeAmount(rate: LiveDataRate) {
  const abs = Math.abs(rate.change);
  return rate.unit === "تومان" ? formatNumberFa(Math.round(abs)) : formatNumberFa(abs);
}

function LiveNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const duration = 700;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const shown =
    decimals > 0
      ? formatNumberFa(Number(display.toFixed(decimals)))
      : formatNumberFa(Math.round(display));

  return <span className="tabular-nums">{shown}</span>;
}

function ChangePill({ rate }: { rate: LiveDataRate }) {
  const isUp = rate.change > 0;
  const isDown = rate.change < 0;
  const pct = rate.changePct ? toPersianDigits(rate.changePct) : null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-[11px]",
        isUp && "bg-emerald-400/20 text-emerald-300",
        isDown && "bg-rose-400/20 text-rose-300",
        !isUp && !isDown && "bg-white/10 text-white/70",
      )}
    >
      {isUp ? (
        <TrendingUp className="size-3 sm:size-3.5" />
      ) : isDown ? (
        <TrendingDown className="size-3 sm:size-3.5" />
      ) : (
        <Minus className="size-3 sm:size-3.5" />
      )}
      <span className="whitespace-nowrap">
        {isUp ? "+" : isDown ? "−" : ""}
        {formatChangeAmount(rate)}
        {pct ? ` (${pct})` : ""}
      </span>
    </span>
  );
}

/** Compact full-width row — mobile first, everything visible */
function RateRowMobile({ rate }: { rate: LiveDataRate }) {
  const theme = RATE_THEME[rate.id] ?? RATE_THEME["200101"]!;
  const Icon = theme.icon;
  const main = formatMainValue(rate);
  const decimals = rate.unit === "تومان" ? 0 : 2;

  return (
    <article className="flex items-center gap-3 border-b border-white/8 px-3.5 py-3.5 last:border-b-0">
      <span className={cn("h-10 w-1 shrink-0 rounded-full", theme.bar)} aria-hidden />
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-white">{rate.label}</p>
          <ChangePill rate={rate} />
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <p className="brand-display text-xl font-extrabold leading-none text-white">
            <LiveNumber value={main} decimals={decimals} />
          </p>
          <span className="text-[11px] text-white/45">{rate.unit}</span>
        </div>
      </div>
    </article>
  );
}

function RateCardDesktop({ rate, index }: { rate: LiveDataRate; index: number }) {
  const theme = RATE_THEME[rate.id] ?? RATE_THEME["200101"]!;
  const Icon = theme.icon;
  const main = formatMainValue(rate);
  const decimals = rate.unit === "تومان" ? 0 : 2;

  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition duration-300 hover:border-white/20 hover:bg-white/[0.09]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", theme.bar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className={cn("text-[11px] font-bold tracking-wide", theme.accent)}>{theme.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-white/90">{rate.label}</p>
          </div>
        </div>
        <ChangePill rate={rate} />
      </div>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="brand-display text-5xl font-extrabold tracking-tight text-white">
          <LiveNumber value={main} decimals={decimals} />
        </p>
        <span className="text-sm font-medium text-white/50">{rate.unit}</span>
      </div>

      {rate.updatedAt ? (
        <p className="mt-auto pt-5 text-[11px] text-white/40">
          زمان نرخ: {formatLiveDataQuoteTime(rate.updatedAt)}
        </p>
      ) : (
        <div className="mt-auto pt-5" />
      )}
    </article>
  );
}

const REFRESH_MS = 5 * 60_000;

function formatCountdown(totalSecs: number) {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${toPersianDigits(String(m).padStart(2, "0"))}:${toPersianDigits(String(s).padStart(2, "0"))}`;
}

type Props = {
  initial?: LiveDataResult | null;
  showDetailsLink?: boolean;
  embedded?: boolean;
};

export function LivePricesStrip({
  initial = null,
  showDetailsLink = true,
  embedded = false,
}: Props) {
  const [data, setData] = useState<LiveDataResult | null>(initial);
  const [loading, setLoading] = useState(!initial?.rates?.length);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefreshAt, setNextRefreshAt] = useState<number | null>(null);
  const [secsLeft, setSecsLeft] = useState(0);

  const load = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/prices/live", { cache: "no-store" });
      if (!res.ok) throw new Error("live_fetch_failed");
      const json = (await res.json()) as LiveDataResult;
      if (json.rates?.length) {
        setData(json);
        setFailed(false);
        setNextRefreshAt(Date.now() + REFRESH_MS);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await load();
    })();
    const id = window.setInterval(() => {
      if (!cancelled) void load();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only poller
  }, []);

  useEffect(() => {
    if (!nextRefreshAt) return;
    const tick = () => {
      setSecsLeft(Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [nextRefreshAt]);

  const rates = data?.rates ?? [];
  const siteFetchedLabel = data?.fetchedAt ? formatFetchedAt(new Date(data.fetchedAt)) : null;
  const sourceQuoteAt = data?.sourceQuoteAt;

  return (
    <section className={cn("relative overflow-hidden bg-ink text-white", !embedded && "my-0")}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, var(--copper) 35%, transparent), transparent 55%),
            radial-gradient(ellipse 60% 50% at 90% 100%, color-mix(in srgb, #0f766e 28%, transparent), transparent 50%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          embedded ? "py-8 sm:py-10" : "py-10 sm:py-16 lg:py-20",
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 sm:mb-3 sm:gap-x-2.5 sm:px-3 sm:py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.14em] text-emerald-300 sm:text-[11px] sm:tracking-[0.16em]">
                زنده
              </span>
              {rates.length > 0 ? (
                <>
                  <span className="text-[10px] text-white/45 sm:text-[11px]">·</span>
                  <span className="text-[10px] font-semibold tabular-nums text-white/75 sm:text-[11px]">
                    {formatNumberFa(rates.length)} نرخ فعال
                  </span>
                </>
              ) : null}
              {rates.length > 0 && nextRefreshAt ? (
                <>
                  <span className="text-[10px] text-white/45 sm:text-[11px]">·</span>
                  <span className="text-[10px] tabular-nums text-white/60 sm:text-[11px]" dir="ltr">
                    بعدی {formatCountdown(secsLeft)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-white/45 sm:text-[11px]">·</span>
                  <span className="text-[10px] text-white/60 sm:text-[11px]">هر ۵ دقیقه</span>
                </>
              )}
            </div>

            <h2 className="brand-display text-2xl font-extrabold leading-none sm:text-4xl lg:text-5xl">
              تابلوی نرخ لحظه‌ای
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/55 sm:mt-3 sm:text-sm sm:leading-7">
              دلار، مس و آلومینیوم
              {siteFetchedLabel ? (
                <span className="text-white/40"> · {siteFetchedLabel}</span>
              ) : loading ? (
                <span className="text-white/40"> · دریافت…</span>
              ) : null}
            </p>
            {sourceQuoteAt ? (
              <p className="mt-0.5 hidden text-xs text-white/40 sm:block">
                لایودیتا: {formatLiveDataQuoteTime(sourceQuoteAt)}
              </p>
            ) : null}
          </div>

          <div className="flex w-full gap-2 sm:w-auto sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing || loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:opacity-50 sm:flex-none sm:px-4"
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              تازه‌سازی
            </button>
            {showDetailsLink ? (
              <Link
                href="/prices"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-copper px-3 py-2.5 text-xs font-bold text-white transition hover:bg-copper-deep sm:flex-none sm:px-4"
              >
                جزئیات
                <ArrowLeft className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        {/* Rates — mobile: stacked board; desktop: 3 cards */}
        {rates.length > 0 ? (
          <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] sm:hidden">
              {rates.map((rate) => (
                <RateRowMobile key={rate.id} rate={rate} />
              ))}
            </div>
            <div className="mt-10 hidden gap-5 sm:grid sm:grid-cols-3">
              {rates.map((rate, i) => (
                <RateCardDesktop key={rate.id} rate={rate} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-12 text-center sm:mt-10 sm:rounded-3xl sm:py-16">
            <Radio className={cn("size-6 text-copper-light sm:size-7", loading && "animate-pulse")} />
            <p className="text-sm text-white/60">
              {loading
                ? "در حال دریافت نرخ لحظه‌ای…"
                : failed
                  ? "الان نرخ لایودیتا در دسترس نیست."
                  : "نرخی برای نمایش نیست."}
            </p>
            {!loading && failed ? (
              <button
                type="button"
                className="text-xs font-bold text-copper-light underline-offset-4 hover:underline"
                onClick={() => void load(true)}
              >
                تلاش مجدد
              </button>
            ) : null}
          </div>
        )}

        <p className="mt-5 text-center text-[10px] text-white/35 sm:mt-6 sm:text-[11px]">
          تغییرات نسبت به روز قبل · منبع:{" "}
          <a
            href="https://www.livedata.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/55 underline-offset-2 hover:text-white hover:underline"
          >
            لایودیتا
          </a>
        </p>
      </div>
    </section>
  );
}
