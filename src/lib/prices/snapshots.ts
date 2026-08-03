import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

export type PriceSnapshotCard = {
  symbol: "USD_RLS" | "COPPER" | "ALUMINUM";
  value: number;
  unit: string;
  source?: string;
};

export const getLatestSnapshots = unstable_cache(
  async (): Promise<PriceSnapshotCard[]> => {
    const symbols = ["USD_RLS", "COPPER", "ALUMINUM"] as const;
    const snaps = await Promise.all(
      symbols.map((symbol) =>
        prisma.priceSnapshot.findFirst({
          where: { symbol },
          orderBy: { observedAt: "desc" },
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
      }));
  },
  ["latest-price-snapshots"],
  { revalidate: REVALIDATE.snapshots, tags: [CACHE_TAGS.snapshots] },
);
