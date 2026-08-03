const numberFmt = new Intl.NumberFormat("fa-IR");
const currencyFmt = new Intl.NumberFormat("fa-IR");

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Display phone with Persian digits; keeps tel: links as ASCII digits. */
export function formatPhoneFa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("021")) {
    return toPersianDigits(`${digits.slice(0, 3)}-${digits.slice(3)}`);
  }
  if (digits.length === 11 && digits.startsWith("09")) {
    return toPersianDigits(`${digits.slice(0, 4)}-${digits.slice(4)}`);
  }
  return toPersianDigits(phone);
}

export function formatNumberFa(value: number): string {
  return numberFmt.format(value);
}

export function formatRial(value: number): string {
  return `${currencyFmt.format(Math.round(value))} ریال`;
}

export function formatToman(value: number): string {
  return `${currencyFmt.format(Math.round(value / 10))} تومان`;
}

/** Convert Gregorian YYYY-MM-DD to Jalali display like ۱۴۰۵/۰۴/۲۳ */
export function toJalaliLabel(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatJalaliLong(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

/** LiveData quote timestamp e.g. "2026-07-15 08:59:03" → Jalali date + Persian time */
export function formatLiveDataQuoteTime(raw: string): string {
  const [datePart, timePart] = raw.split(" ");
  if (!datePart) return toPersianDigits(raw);
  const d = new Date(`${datePart}T${timePart ?? "00:00:00"}`);
  const jalali = Number.isNaN(d.getTime()) ? datePart : toJalaliLabel(d);
  return toPersianDigits([jalali, timePart].filter(Boolean).join(" — "));
}

export function formatFetchedAt(date: Date): string {
  const jalali = toJalaliLabel(date);
  const time = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return toPersianDigits(`${jalali} — ${time}`);
}
