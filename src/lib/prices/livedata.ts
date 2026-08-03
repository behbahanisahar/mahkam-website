import { unstable_cache } from "next/cache";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

export type LiveDataRate = {
  id: string;
  label: string;
  value: number;
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
  { id: "200101", label: "دلار صرافی", unit: "تومان" },
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

      return {
        id: cfg.id,
        label: cfg.label,
        value: Number.isFinite(value) ? value : 0,
        change: Number.isFinite(change) ? change : 0,
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
  ["livedata-rates-v2"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);

/** Prefer cache, but never stick on an empty failure for the full revalidate window. */
export async function getLiveDataRates(): Promise<LiveDataResult> {
  try {
    const cached = await getCachedLiveDataRates();
    if (cached.rates.length > 0) return cached;
  } catch {
    // fall through
  }
  return fetchLiveDataRatesUncached();
}
