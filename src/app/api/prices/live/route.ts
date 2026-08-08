import { NextResponse } from "next/server";
import { fetchLiveDataRatesUncached } from "@/lib/prices/livedata";
import { snapshotsAsLiveDataFallback } from "@/lib/prices/snapshots";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const live = await fetchLiveDataRatesUncached();
  if (live.rates.length > 0) {
    return NextResponse.json(live, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Price-Source": "livedata",
      },
    });
  }

  const fallback = await snapshotsAsLiveDataFallback();
  if (fallback) {
    return NextResponse.json(fallback, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        "X-Price-Source": "snapshot-fallback",
      },
    });
  }

  return NextResponse.json(live, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      "X-Price-Source": "empty",
    },
  });
}
