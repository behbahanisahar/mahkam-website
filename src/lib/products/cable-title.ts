/**
 * Cable sizes must stay left-to-right inside RTL Persian:
 * 1×0.75, 12×1.5, 3×25+16, 0.6/1 kV — never mirrored to 0.75×1 / 16+25×3.
 */

const FA = "۰۱۲۳۴۵۶۷۸۹";
const EN = "0123456789";
const D = "[0-9۰-۹]";
const NUM = `${D}+(?:[.]${D}+)?`;
const MUL = "[×xX⨯]";

/** 1×0.75 | 12×1.5 | 3×25+16 — do not eat "3×25 + 1×16" as one token */
const SIZE_TOKEN = `${NUM}\\s*${MUL}\\s*${NUM}(?:\\s*[+＋]\\s*${NUM}(?!\\s*${MUL}))?(?:\\s*mm²)?`;
/** 0.6/1 kV | 450/750 V */
const VOLT_TOKEN = `${NUM}\\s*/\\s*${NUM}(?:\\s*(?:kV|KV|V))?`;

export const CABLE_LTR_TOKEN_RE = new RegExp(`(?:${SIZE_TOKEN}|${VOLT_TOKEN})`, "g");

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => EN[FA.indexOf(d)] ?? d);
}

/**
 * Flip Word-style `0.75×1` → `1×0.75` when the second number is exactly 1
 * and the first is not. Leaves multi-core (`2×10`, `3×25+16`) alone.
 */
export function normalizeCableSizeToken(token: string): string {
  const latin = toLatinDigits(token).replace(/\s+/g, "");
  const three = latin.match(/^(\d+(?:\.\d+)?)[×xX⨯](\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)(mm²)?$/i);
  if (three) {
    return `${three[1]}×${three[2]}+${three[3]}${three[4] ?? ""}`;
  }
  const two = latin.match(/^(\d+(?:\.\d+)?)[×xX⨯](\d+(?:\.\d+)?)(mm²)?$/i);
  if (!two) return token;
  const a = two[1];
  const b = two[2];
  const unit = two[3] ?? "";
  if (b === "1" && a !== "1") return `1×${a}${unit}`;
  return `${a}×${b}${unit}`;
}

/** Normalize every cable-size token inside a product title / body string. */
export function normalizeCableTitle(text: string): string {
  if (!text) return text;
  return text.replace(new RegExp(SIZE_TOKEN, "g"), (full) => normalizeCableSizeToken(full));
}
