import {
  TrendingDown,
  TrendingUp,
  Minus,
  CircleDollarSign,
  Cylinder,
  Layers3,
  Radio,
} from "lucide-react";
import { formatFetchedAt, formatLiveDataQuoteTime, formatNumberFa, toPersianDigits } from "@/lib/i18n/fa";
import type { LiveDataRate } from "@/lib/prices/livedata";
import { cn } from "@/lib/utils";

const RATE_META: Record<string, { icon: typeof CircleDollarSign; tip: string }> = {
  "200101": { icon: CircleDollarSign, tip: "صرافی" },
  "301006": { icon: Cylinder, tip: "فلز" },
  "300606": { icon: Layers3, tip: "فلز" },
};

function formatMainValue(rate: LiveDataRate) {
  if (rate.unit === "تومان") return formatNumberFa(Math.round(rate.value));
  return formatNumberFa(rate.value);
}

function formatChangeAmount(rate: LiveDataRate) {
  const abs = Math.abs(rate.change);
  return rate.unit === "تومان" ? formatNumberFa(Math.round(abs)) : formatNumberFa(abs);
}

function TrendBadge({ rate, dark }: { rate: LiveDataRate; dark?: boolean }) {
  const pct = rate.changePct ? toPersianDigits(rate.changePct) : null;
  const isUp = rate.change > 0;
  const isDown = rate.change < 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        isUp && (dark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-500/12 text-emerald-800"),
        isDown && (dark ? "bg-red-400/15 text-red-300" : "bg-red-500/12 text-red-800"),
        !isUp && !isDown && (dark ? "bg-white/10 text-bg/70" : "bg-accent/25 text-muted"),
      )}
      title="تغییر نسبت به روز قبل"
    >
      {isUp ? (
        <TrendingUp className="size-3.5" />
      ) : isDown ? (
        <TrendingDown className="size-3.5" />
      ) : (
        <Minus className="size-3.5" />
      )}
      <span>
        {isUp ? "+" : isDown ? "−" : ""}
        {formatChangeAmount(rate)}
      </span>
      {pct ? <span className="opacity-80">({pct})</span> : null}
    </span>
  );
}

function RateCard({ rate, dark }: { rate: LiveDataRate; dark?: boolean }) {
  const meta = RATE_META[rate.id] ?? { icon: CircleDollarSign, tip: "" };
  const Icon = meta.icon;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition",
        dark
          ? "border border-white/10 bg-white/[0.04] hover:border-copper/40 hover:bg-white/[0.07]"
          : "border border-glass-border/80 bg-white/60 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {dark ? (
        <div className="pointer-events-none absolute -left-8 top-0 size-24 rounded-full bg-copper/20 blur-2xl" />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={cn(
            "rounded-xl p-2.5",
            dark ? "bg-copper/20 text-copper" : "bg-accent/20 text-ink",
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <TrendBadge rate={rate} dark={dark} />
      </div>

      <p className={cn("relative mt-4 text-sm font-medium", dark ? "text-bg/70" : "text-muted")}>
        {rate.label}
      </p>
      <div className="relative mt-1 flex items-baseline gap-2">
        <p
          className={cn(
            "brand-display text-2xl font-bold tracking-tight sm:text-3xl",
            dark ? "text-bg" : "text-ink",
          )}
        >
          {formatMainValue(rate)}
        </p>
        <span className={cn("text-sm font-medium", dark ? "text-copper" : "text-muted")}>
          {rate.unit}
        </span>
      </div>

      {rate.updatedAt ? (
        <p className={cn("relative mt-3 text-[11px]", dark ? "text-bg/60" : "text-muted")}>
          زمان نرخ: {formatLiveDataQuoteTime(rate.updatedAt)}
        </p>
      ) : null}
    </article>
  );
}

type Props = {
  rates: LiveDataRate[];
  fetchedAt: string;
  sourceQuoteAt?: string;
  variant?: "light" | "dark";
};

export function LiveDataTable({ rates, fetchedAt, sourceQuoteAt, variant = "light" }: Props) {
  const dark = variant === "dark";

  if (rates.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center",
          dark ? "border-white/15 bg-white/5" : "border-glass-border bg-white/50",
        )}
      >
        <div className={cn("rounded-full p-3", dark ? "bg-copper/20" : "bg-accent/20")}>
          <Radio className={cn("size-5 animate-pulse", dark ? "text-copper" : "text-accent")} />
        </div>
        <p className={cn("text-sm", dark ? "text-bg/65" : "text-muted")}>در حال دریافت نرخ لحظه‌ای…</p>
      </div>
    );
  }

  const siteFetchedLabel = formatFetchedAt(new Date(fetchedAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
            dark
              ? "border-white/10 bg-white/5 text-bg/80"
              : "border-glass-border bg-white/60 text-ink",
          )}
        >
          به‌روزرسانی سایت: هر ۵ دقیقه
        </span>
        <div className={cn("space-y-0.5 text-xs", dark ? "text-bg/65" : "text-muted")}>
          <p>دریافت در سایت: {siteFetchedLabel}</p>
          {sourceQuoteAt ? (
            <p>جدیدترین نرخ در لایودیتا: {formatLiveDataQuoteTime(sourceQuoteAt)}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rates.map((rate) => (
          <RateCard key={rate.id} rate={rate} dark={dark} />
        ))}
      </div>

      <p className={cn("text-center text-[11px] leading-6", dark ? "text-bg/60" : "text-muted")}>
        تغییرات = نسبت به روز قبل · منبع:{" "}
        <a
          href="https://www.livedata.ir"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-medium underline-offset-2 hover:underline",
            dark ? "text-copper" : "text-ink/70 hover:text-ink",
          )}
        >
          لایودیتا
        </a>
      </p>
    </div>
  );
}
