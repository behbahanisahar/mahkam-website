import { NextResponse } from "next/server";
import { fetchLiveDataRatesUncached } from "@/lib/prices/livedata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await fetchLiveDataRatesUncached();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
