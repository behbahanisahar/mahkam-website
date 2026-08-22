import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { getGuideArticle, GUIDE_ARTICLES } from "@/lib/seo/landings";
import { toPersianDigits } from "@/lib/i18n/fa";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/guides/${article.slug}`,
    ogTitle: article.title,
    keywords: article.keywords,
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "fa-IR",
    author: {
      "@type": "Organization",
      name: "گسترش سیم و کابل مهکام",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={`راهنما · ${toPersianDigits(article.readMinutes)} دقیقه`}
        title={article.title}
        lead={article.description}
        primaryCta={{ href: "/products", label: "کاتالوگ محصولات" }}
        secondaryCta={{ href: "/price-list", label: "لیست قیمت" }}
      >
        <article className="mx-auto max-w-3xl space-y-8">
          {article.compareTable ? (
            <div className="overflow-x-auto rounded-2xl border border-ink/8">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="border-b border-ink/8 bg-bg-alt px-4 py-3 text-right text-xs font-semibold text-muted">
                  {article.compareTable.caption}
                </caption>
                <thead className="bg-bg-alt text-right">
                  <tr>
                    {article.compareTable.headers.map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-ink">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {article.compareTable.rows.map((row) => (
                    <tr key={row[0]} className="border-t border-ink/8">
                      {row.map((cell, i) => (
                        <td
                          key={`${row[0]}-${i}`}
                          className={
                            i === 0
                              ? "px-4 py-3 font-semibold text-ink"
                              : "px-4 py-3 leading-7 text-muted"
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="brand-display text-xl font-extrabold text-ink sm:text-2xl">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-8 text-muted sm:text-base">{section.body}</p>
            </section>
          ))}
        </article>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/guides" className="font-semibold text-copper hover:underline">
            همه راهنماها
          </Link>
          <Link href="/faq" className="font-semibold text-copper hover:underline">
            سوالات متداول
          </Link>
          <Link href="/contact" className="font-semibold text-copper hover:underline">
            تماس
          </Link>
        </div>
      </SeoLandingShell>
    </>
  );
}
