import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { getPriceListLanding, PRICE_LIST_LANDINGS } from "@/lib/seo/landings";
import { getSiteSettings } from "@/lib/settings";
import { getTelegramHandleLabel } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRICE_LIST_LANDINGS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPriceListLanding(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/price-list/${page.slug}`,
    ogTitle: page.title,
    keywords: page.keywords,
  });
}

export default async function PriceListDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = getPriceListLanding(slug);
  if (!page) notFound();

  const settings = await getSiteSettings();

  return (
    <SeoLandingShell
      eyebrow="لیست قیمت مهکام"
      title={page.h1}
      lead={page.lead}
      primaryCta={{
        href: settings.telegramUrl,
        label: `دریافت قیمت روز از ${getTelegramHandleLabel()}`,
        external: true,
      }}
      secondaryCta={{ href: page.catalogHref, label: page.catalogLabel }}
    >
      <article className="mx-auto max-w-3xl space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="brand-display text-xl font-extrabold text-ink sm:text-2xl">
              {section.heading}
            </h2>
            <p className="mt-3 text-sm leading-8 text-muted sm:text-base">{section.body}</p>
          </section>
        ))}
      </article>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/price-list" className="font-semibold text-copper hover:underline">
          همه لیست‌قیمت‌ها
        </Link>
        <Link href="/contact" className="font-semibold text-copper hover:underline">
          تماس با مهکام
        </Link>
        <Link href="/guides" className="font-semibold text-copper hover:underline">
          راهنمای خرید
        </Link>
      </div>
    </SeoLandingShell>
  );
}
