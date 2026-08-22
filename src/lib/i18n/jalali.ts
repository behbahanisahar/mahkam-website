/** Compact Jalali calendar helpers (no external dependency). */

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export function jalaliMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? "";
}

export function isJalaliLeap(jy: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
    2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  let jp = breaks[0]!;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = ((((n + 1) % 33) - 1) % 4);
  if (leap === -1) leap = 4;
  return leap === 0;
}

export function jalaliDaysInMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

/** Jalali → Gregorian (jalaali-js algorithm). */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): { gy: number; gm: number; gd: number } {
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy2 = jy - 979;
  let jm2 = jm - 1;
  let jd2 = jd - 1;
  let j_day_no =
    365 * jy2 +
    Math.floor(jy2 / 33) * 8 +
    Math.floor(((jy2 % 33) + 3) / 4);
  for (let i = 0; i < jm2; i += 1) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd2;
  let g_day_no = j_day_no + 79;

  let gYear = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no %= 146097;

  let leapFlag = true;
  if (g_day_no >= 36525) {
    g_day_no -= 1;
    gYear += 100 * Math.floor(g_day_no / 36524);
    g_day_no %= 36524;
    if (g_day_no >= 365) g_day_no += 1;
    else leapFlag = false;
  }

  gYear += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leapFlag = false;
    g_day_no -= 1;
    gYear += Math.floor(g_day_no / 365);
    g_day_no %= 365;
  }

  const sal_a = [...g_days_in_month];
  if (leapFlag) {
    sal_a[1] = 29;
  }

  let gm = 0;
  for (; gm < 12 && g_day_no >= sal_a[gm]!; gm += 1) {
    g_day_no -= sal_a[gm]!;
  }
  return { gy: gYear, gm: gm + 1, gd: g_day_no + 1 };
}

/** Saturday=0 … Friday=6 (Persian calendar week). */
export function jalaliWeekdaySat0(jy: number, jm: number, jd: number): number {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  // Noon UTC avoids DST / midnight edge cases when mapping the civil day.
  const dow = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0)).getUTCDay(); // Sun=0
  return (dow + 1) % 7;
}

export function parseJalaliParts(
  raw: string,
): { y: number; m: number; d: number } | null {
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/-/g, "/")
    .trim();
  const m = latin.match(/^(\d{3,4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export function formatJalaliKey(y: number, m: number, d: number): string {
  return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}
