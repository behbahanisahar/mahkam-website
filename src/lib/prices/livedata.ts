import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

export type LiveDataRate = {
  id: string;
  label: string;
  /** آخرین نرخ */
  value: number;
  /** قیمت روز قبل (برای مقایسه) */
  previous: number;
  /** بالاترین امروز */
  high: number;
  /** پایین‌ترین امروز */
  low: number;
  change: number;
  changePct: string;
  unit: string;
  updatedAt?: string;
};

export type LiveDataResult = {
  rates: LiveDataRate[];
  /** When our server last fetched from LiveData */
  fetchedAt: string;
  /** Newest quote timestamp among all rates (from LiveData source) */
  sourceQuoteAt?: string;
};

const RATE_CONFIG = [
  // دلار تتر معمولاً خرید/فروش و تغییر روز قبل را زنده‌تر دارد
  { id: "200103", label: "دلار آزاد", unit: "تومان" },
  { id: "301006", label: "مس", unit: "دلار/تن" },
  { id: "300606", label: "آلومینیوم", unit: "دلار/تن" },
] as const;

function parseLiveDataPayload(text: string): Record<string, string | number> | null {
  const match = text.match(/var json_data\s*=\s*'([\s\S]+?)'\s*;/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1].trim()) as Record<string, string | number>;
  } catch {
    return null;
  }
}

export async function fetchLiveDataRatesUncached(): Promise<LiveDataResult> {
  const fetchedAt = new Date().toISOString();
  try {
    // API / cron: always fresh. Page renders must use getLiveDataRates() (ISR-safe).
    const res = await fetch("https://www.livedata.ir/main/static/w.js", {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MahkamCable/1.0; +https://mahkamcable.vercel.app)",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(3_500),
    });
    if (!res.ok) return { rates: [], fetchedAt };
    const payload = parseLiveDataPayload(await res.text());
    if (!payload) return { rates: [], fetchedAt };

    const rates = RATE_CONFIG.map((cfg) => {
      const value = Number(payload[`s_${cfg.id}`]);
      const change = Number(payload[`c_${cfg.id}`]);
      const changePct = String(payload[`cp_${cfg.id}`] ?? "");
      const updatedAt = String(payload[`td_${cfg.id}`] ?? "");
      const prevRaw = Number(payload[`b_${cfg.id}`]);
      const highRaw = Number(payload[`h_${cfg.id}`]);
      const lowRaw = Number(payload[`l_${cfg.id}`]);
      const safeValue = Number.isFinite(value) ? value : 0;
      const safeChange = Number.isFinite(change) ? change : 0;
      // لایودیتا: b_ ≈ قیمت روز قبل؛ در غیر این صورت از change برمی‌گردانیم
      const previous =
        Number.isFinite(prevRaw) && prevRaw > 0
          ? prevRaw
          : safeValue - safeChange;
      const high =
        Number.isFinite(highRaw) && highRaw > 0 ? highRaw : safeValue;
      const low = Number.isFinite(lowRaw) && lowRaw > 0 ? lowRaw : safeValue;

      return {
        id: cfg.id,
        label: cfg.label,
        value: safeValue,
        previous: previous > 0 ? previous : safeValue,
        high,
        low,
        change: safeChange,
        changePct,
        unit: cfg.unit,
        updatedAt: updatedAt || undefined,
      };
    }).filter((r) => r.value > 0);

    const sourceQuoteAt = rates
      .map((r) => r.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return { rates, fetchedAt, sourceQuoteAt };
  } catch {
    return { rates: [], fetchedAt };
  }
}

const getCachedLiveDataRates = unstable_cache(
  fetchLiveDataRatesUncached,
  ["livedata-rates-v3"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);

/**
 * ISR-safe rates for public pages. Empty results fall through to DB snapshots
 * at the call site — do not call fetchLiveDataRatesUncached from pages
 * (that would force dynamic rendering via cache: "no-store").
 */
export async function getLiveDataRates(): Promise<LiveDataResult> {
  return getCachedLiveDataRates();
}
