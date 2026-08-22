import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { LiveDataRate, LiveDataResult } from "@/lib/prices/livedata";

export type PriceSnapshotCard = {
  symbol: "USD_RLS" | "COPPER" | "ALUMINUM";
  value: number;
  unit: string;
  source?: string;
  observedAt?: Date;
};

const SNAPSHOT_TO_LIVE: Record<
  PriceSnapshotCard["symbol"],
  { id: string; label: string; unitOverride?: string }
> = {
  USD_RLS: { id: "200103", label: "دلار آزاد", unitOverride: "تومان" },
  COPPER: { id: "301006", label: "مس" },
  ALUMINUM: { id: "300606", label: "آلومینیوم" },
};

export const getLatestSnapshots = unstable_cache(
  async (): Promise<PriceSnapshotCard[]> => {
    const symbols = ["USD_RLS", "COPPER", "ALUMINUM"] as const;
    const snaps = await Promise.all(
      symbols.map((symbol) =>
        prisma.priceSnapshot.findFirst({
          where: { symbol },
          orderBy: { observedAt: "desc" },
          select: {
            symbol: true,
            value: true,
            unit: true,
            source: true,
            observedAt: true,
          },
        }),
      ),
    );

    return snaps
      .filter(Boolean)
      .map((s) => ({
        symbol: s!.symbol,
        value: s!.value,
        unit: s!.unit,
        source: s!.source,
        observedAt: s!.observedAt,
      }));
  },
  ["latest-price-snapshots-v2"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);

/** Map DB snapshots into the LiveDataRate shape for UI fallback (not a live scrape). */
export async function snapshotsAsLiveDataFallback(): Promise<LiveDataResult | null> {
  try {
    const snaps = await getLatestSnapshots();
    if (snaps.length === 0) return null;

    const rates: LiveDataRate[] = snaps
      .map((s) => {
        const map = SNAPSHOT_TO_LIVE[s.symbol];
        // TGJU USD is often rial; LiveData UI expects toman for id 200101
        let value = s.value;
        let unit = map.unitOverride ?? s.unit;
        if (s.symbol === "USD_RLS" && (s.unit.includes("ریال") || value > 100_000)) {
          value = Math.round(value / 10);
          unit = "تومان";
        }
        return {
          id: map.id,
          label: map.label,
          value,
          previous: value,
          high: value,
          low: value,
          change: 0,
          changePct: "",
          unit,
          updatedAt: s.observedAt?.toISOString(),
        };
      })
      .filter((r) => r.value > 0);

    if (rates.length === 0) return null;

    return {
      rates,
      fetchedAt: new Date().toISOString(),
      sourceQuoteAt: rates.map((r) => r.updatedAt).filter(Boolean).sort().at(-1),
    };
  } catch {
    return null;
  }
}

export const getRecentDollarArchive = unstable_cache(
  async () => {
    const rows = await prisma.dollarDaily.findMany({
      orderBy: { date: "desc" },
      take: 10,
      select: {
        id: true,
        dateJalali: true,
        close: true,
        low: true,
        high: true,
      },
    });
    return rows.slice(0, 10);
  },
  ["dollar-recent-archive-v3"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);

/** All archived Jalali dates for the prices datepicker (only these days are selectable). */
export const getDollarArchivePickerDates = unstable_cache(
  async () => {
    const rows = await prisma.dollarDaily.findMany({
      orderBy: { date: "desc" },
      select: { dateJalali: true, close: true },
    });
    return rows.map((r) => ({
      jalali: r.dateJalali,
      close: r.close,
    }));
  },
  ["dollar-archive-picker-dates-v1"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);
