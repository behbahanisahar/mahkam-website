import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { getTelegramUrl } from "@/lib/site";

const LEGACY_TELEGRAM_URL = "https://t.me/mahkam_cable";

function normalizeTelegramUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || trimmed === LEGACY_TELEGRAM_URL || trimmed.includes("mahkam_cable")) {
    return getTelegramUrl();
  }
  return trimmed;
}

const defaults = {
  id: "default",
  telegramUrl: getTelegramUrl(),
  phones: ["02166349014"] as string[],
  address: "تهران، خیابان لاله‌زار نو، کوچه معمار مخصوص، پاساژ چلچراغ، طبقه ۴، واحد ۱۰" as string | null,
  /** پاساژ چلچراغ — from Balad place pin */
  mapLat: 35.700348 as number | null,
  mapLng: 51.42455 as number | null,
  aboutHtml: null as string | null,
  contactHtml: null as string | null,
  companyBlurb:
    "شرکت گسترش سیم و کابل مهکام؛ تولیدکننده انواع سیم و کابل برق با تمرکز بر کیفیت و رضایت مشتری.",
  updatedAt: new Date(),
};

const getCachedSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.siteSetting.findUnique({
        where: { id: "default" },
      });
      if (!settings) return defaults;
      const phones = settings.phones.filter((p) => p.trim() && !/0{5,}/.test(p.replace(/\D/g, "")));
      const address =
        settings.address &&
        !settings.address.includes("از پنل ویرایش") &&
        !settings.address.includes("بازار سیم و کابل")
          ? settings.address
          : defaults.address;
      return {
        ...settings,
        telegramUrl: normalizeTelegramUrl(settings.telegramUrl),
        phones: phones.length > 0 ? phones : defaults.phones,
        address,
        mapLat: settings.mapLat ?? defaults.mapLat,
        mapLng: settings.mapLng ?? defaults.mapLng,
      };
    } catch {
      return defaults;
    }
  },
  ["site-settings"],
  { revalidate: REVALIDATE.settings, tags: [CACHE_TAGS.settings] },
);

export const getSiteSettings = cache(getCachedSettings);
