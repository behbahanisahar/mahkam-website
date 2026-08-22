import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { GUIDE_ARTICLES } from "@/lib/seo/landings";
import { toPersianDigits } from "@/lib/i18n/fa";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "راهنمای خرید سیم و کابل",
  description:
    "مقالات راهنمای خرید سیم افشان، کابل آلومینیوم و افت ولتاژ — از گسترش سیم و کابل مهکام.",
  path: "/guides",
  ogTitle: "راهنمای سیم و کابل | مهکام",
  keywords: ["راهنمای خرید سیم و کابل", "آموزش سیم افشان", "افت ولتاژ کابل", "مهکام"],
});

export default function GuidesHubPage() {
  return (
    <SeoLandingShell
      eyebrow="دانش فنی"
      title="راهنمای خرید سیم و کابل"
      lead="مقاله‌های کوتاه برای انتخاب درست مقطع و نوع هادی — بعد می‌توانید از کاتالوگ مهکام محصول را ببینید و قیمت روز را از تلگرام بگیرید."
      primaryCta={{ href: "/products", label: "رفتن به کاتالوگ" }}
      secondaryCta={{ href: "/price-list", label: "لیست قیمت مهکام" }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDE_ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/guides/${article.slug}`}
            className="group rounded-3xl border border-ink/8 bg-white p-6 transition hover:border-copper/40"
          >
            <p className="text-xs font-semibold text-muted">
              {toPersianDigits(article.readMinutes)} دقیقه مطالعه
            </p>
            <h2 className="brand-display mt-2 text-lg font-extrabold text-ink group-hover:text-copper-deep">
              {article.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">{article.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-copper">
              ادامه مطلب
              <ArrowLeft className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}
