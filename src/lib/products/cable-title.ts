/**
 * Word stores 1-core titles as section×cores (`0.75×1`) with RTL digit runs,
 * which reads on screen as cores×section (`1×0.75`). Normalize to the visual form.
 */

const FA = "۰۱۲۳۴۵۶۷۸۹";
const EN = "0123456789";

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => EN[FA.indexOf(d)] ?? d);
}

/**
 * Flip Word-style `0.75×1` / `۱۰×۱` → `1×0.75` / `1×10` when the second
 * number is exactly 1 and the first is not 1 (single-core catalog titles).
 * Leaves real multi-core sizes like `2×1.5` and already-correct `1×0.75` alone.
 */
export function normalizeCableSizeToken(token: string): string {
  const latin = toLatinDigits(token).replace(/\s+/g, "");
  const m = latin.match(/^(\d+(?:\.\d+)?)[×xX](\d+(?:\.\d+)?)$/);
  if (!m) return token;
  const a = m[1];
  const b = m[2];
  if (b === "1" && a !== "1") {
    return `1×${a}`;
  }
  // Prefer × over x
  return `${a}×${b}`;
}

/** Normalize every cable-size token inside a product title / body string. */
export function normalizeCableTitle(text: string): string {
  if (!text) return text;
  return text.replace(
    /([0-9۰-۹]+(?:\.[0-9۰-۹]+)?)\s*[×xX]\s*([0-9۰-۹]+(?:\.[0-9۰-۹]+)?)/g,
    (full) => normalizeCableSizeToken(full),
  );
}
