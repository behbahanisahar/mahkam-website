import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { PRICE_LIST_LANDINGS } from "@/lib/seo/landings";
import { getSiteSettings } from "@/lib/settings";
import { getTelegramHandleLabel } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "لیست قیمت سیم و کابل مهکام",
  description:
    "لیست قیمت روز سیم افشان، کابل ارت افشان، سیم مسی و کابل آلومینیوم گسترش سیم و کابل مهکام — استعلام از تلگرام و لاله‌زار.",
  path: "/price-list",
  ogTitle: "لیست قیمت سیم و کابل مهکام",
  keywords: [
    "لیست قیمت سیم و کابل",
    "قیمت سیم و کابل مهکام",
    "کابل افشان",
    "کابل ارت افشان",
    "سیم مسی",
    "سیم آلومینیوم",
  ],
});

export default async function PriceListHubPage() {
  const settings = await getSiteSettings();

  return (
    <SeoLandingShell
      eyebrow="استعلام قیمت"
      title="لیست قیمت سیم و کابل مهکام"
      lead={`قیمت روز محصولات مهکام در کانال ${getTelegramHandleLabel()} اعلام می‌شود. از این بخش به صفحات سیم افشان، ارت افشان، سیم مسی و کابل آلومینیوم بروید.`}
      primaryCta={{
        href: settings.telegramUrl,
        label: `قیمت روز در ${getTelegramHandleLabel()}`,
        external: true,
      }}
      secondaryCta={{ href: "/products", label: "کاتالوگ محصولات" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {PRICE_LIST_LANDINGS.map((item) => (
          <Link
            key={item.slug}
            href={`/price-list/${item.slug}`}
            className="group rounded-3xl border border-ink/8 bg-white p-6 transition hover:border-copper/40"
          >
            <h2 className="brand-display text-xl font-extrabold text-ink group-hover:text-copper-deep">
              {item.h1}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.lead.slice(0, 140)}…</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-copper">
              مشاهده صفحه
              <ArrowLeft className="size-4" />
            </span>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-muted">
        نرخ مرجع دلار و فلزات را هم در{" "}
        <Link href="/prices" className="font-semibold text-copper hover:underline">
          صفحه نرخ‌ها
        </Link>{" "}
        ببینید.
      </p>
    </SeoLandingShell>
  );
}
