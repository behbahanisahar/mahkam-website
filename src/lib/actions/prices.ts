"use server";

import { prisma } from "@/lib/prisma";
import { toPersianDigits } from "@/lib/i18n/fa";

function normalizeJalali(input: string): string[] {
  const normalized = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/-/g, "/")
    .trim();

  const variants = new Set<string>([normalized, toPersianDigits(normalized)]);

  // Also try without leading zeros: 1405/4/2
  const parts = normalized.split("/");
  if (parts.length === 3) {
    const compact = `${Number(parts[0])}/${Number(parts[1])}/${Number(parts[2])}`;
    variants.add(compact);
    variants.add(toPersianDigits(compact));
    const padded = `${parts[0]}/${parts[1].padStart(2, "0")}/${parts[2].padStart(2, "0")}`;
    variants.add(padded);
    variants.add(toPersianDigits(padded));
  }

  return [...variants];
}

export async function lookupDollarByJalali(jalaliInput: string) {
  if (!jalaliInput) {
    return { found: false, message: "تاریخ را وارد کنید." };
  }

  try {
    const variants = normalizeJalali(jalaliInput);

    for (const v of variants) {
      const row = await prisma.dollarDaily.findFirst({
        where: { dateJalali: v },
        orderBy: { date: "desc" },
      });
      if (row) {
        return {
          found: true,
          close: row.close,
          dateJalali: row.dateJalali,
        };
      }
    }

    return {
      found: false,
      message: "برای این تاریخ رکوردی در آرشیو ذخیره نشده است. همگام‌سازی روزانه را بررسی کنید.",
    };
  } catch {
    return {
      found: false,
      message: "ارتباط با پایگاه داده برقرار نشد. کمی بعد دوباره تلاش کنید.",
    };
  }
}
