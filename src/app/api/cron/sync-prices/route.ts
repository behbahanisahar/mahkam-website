import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchTgjuDollarHistory, fetchTgjuLiveSnapshots } from "@/lib/prices/tgju";
import { toJalaliLabel } from "@/lib/i18n/fa";
import { CACHE_TAGS } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || (secret !== expected && querySecret !== expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backfill = req.nextUrl.searchParams.get("backfill") === "1";
  const pages = backfill ? 20 : 2;
  let upserted = 0;
  let historyError: string | null = null;

  try {
    for (let i = 0; i < pages; i++) {
      const rows = await fetchTgjuDollarHistory(i * 100, 100);
      if (rows.length === 0) break;
      for (const row of rows) {
        const jalali =
          row.dateJalali ||
          toJalaliLabel(row.date).replace(/‏/g, "").replace(/\//g, "/");
        await prisma.dollarDaily.upsert({
          where: { date: row.date },
          create: {
            date: row.date,
            dateJalali: jalali,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            source: "tgju",
          },
          update: {
            dateJalali: jalali,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            source: "tgju",
          },
        });
        upserted += 1;
      }
    }
  } catch (e) {
    historyError = e instanceof Error ? e.message : "history sync failed";
  }

  const live = await fetchTgjuLiveSnapshots();
  for (const snap of live) {
    await prisma.priceSnapshot.create({
      data: {
        symbol: snap.symbol,
        source: "tgju",
        value: snap.value,
        unit: snap.unit,
      },
    });
  }

  revalidateTag(CACHE_TAGS.snapshots, "max");

  return NextResponse.json({
    ok: true,
    dollarRowsUpserted: upserted,
    liveSnapshots: live.length,
    historyError,
  });
}
