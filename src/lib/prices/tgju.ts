/**
 * Sync historical USD/IRR daily rates from TGJU (via accessban API).
 * Endpoint is unofficial and may change — data is mirrored into Postgres.
 */

export type TgjuDailyRow = {
  date: Date;
  dateJalali: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
};

function parseNumber(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/<[^>]*>/g, "").replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseJalaliFromHtml(cell: string): string {
  return cell.replace(/<[^>]*>/g, "").trim();
}

function parseGregorian(cell: string): Date | null {
  const text = cell.replace(/<[^>]*>/g, "").trim();
  // YYYY/MM/DD or YYYY-MM-DD
  const m = text.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function fetchTgjuDollarHistory(
  start = 0,
  length = 100,
): Promise<TgjuDailyRow[]> {
  const endpoints = [
    "https://api.tgju.org/v1/market/indicator/summary-table-data/price_dollar_rl",
    "https://api.accessban.com/v1/market/indicator/summary-table-data/price_dollar_rl",
  ];

  const params = new URLSearchParams({
    start: String(start),
    length: String(length),
    lang: "fa",
    convert_to_ad: "1",
  });

  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (compatible; MahkamCable/1.0; +https://mahkamcable.ir)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) {
        console.warn(`TGJU history fetch failed (${base}): ${res.status}`);
        continue;
      }

      const json = (await res.json()) as { data?: string[][] };
      const rows = json.data ?? [];
      const mapped: TgjuDailyRow[] = [];

      for (const row of rows) {
        if (!Array.isArray(row) || row.length < 8) continue;
        const open = parseNumber(row[0]);
        const low = parseNumber(row[1]);
        const high = parseNumber(row[2]);
        const close = parseNumber(row[3]);
        const gregorian = parseGregorian(row[6]);
        const jalali = parseJalaliFromHtml(row[7]);
        if (!gregorian || close == null) continue;
        mapped.push({
          date: gregorian,
          dateJalali: jalali,
          open,
          high,
          low,
          close,
        });
      }

      if (mapped.length > 0) return mapped;
    } catch (error) {
      console.warn(`TGJU history fetch error (${base}):`, error);
    }
  }

  return [];
}

export async function fetchTgjuLiveSnapshots(): Promise<
  { symbol: "USD_RLS" | "COPPER" | "ALUMINUM"; value: number; unit: string }[]
> {
  const endpoints = [
    "https://call5.tgju.org/ajax.json",
    "https://call1.tgju.org/ajax.json",
  ];

  let data: Record<string, unknown> | null = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json", "User-Agent": "MahkamCableBot/1.0" },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        data = (await res.json()) as Record<string, unknown>;
        break;
      }
    } catch {
      // try next
    }
  }

  if (!data) return [];

  const current = (data.current as Record<string, { p?: string }>) ?? {};
  const out: {
    symbol: "USD_RLS" | "COPPER" | "ALUMINUM";
    value: number;
    unit: string;
  }[] = [];

  const usd = parseNumber(current.price_dollar_rl?.p ?? "");
  if (usd != null) out.push({ symbol: "USD_RLS", value: usd, unit: "ریال" });

  const copper =
    parseNumber(current.base_metals_copper?.p ?? "") ??
    parseNumber(current.copper?.p ?? "");
  if (copper != null) {
    out.push({ symbol: "COPPER", value: copper, unit: "دلار/تن" });
  }

  const aluminum =
    parseNumber(current.base_metals_aluminium?.p ?? "") ??
    parseNumber(current.aluminium?.p ?? "");
  if (aluminum != null) {
    out.push({ symbol: "ALUMINUM", value: aluminum, unit: "دلار/تن" });
  }

  return out;
}
