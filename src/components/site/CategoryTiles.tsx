import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatNumberFa } from "@/lib/i18n/fa";
import { resolveMediaUrl } from "@/lib/utils";

export type CategoryTileData = {
  slug: string;
  nameFa: string;
  description?: string | null;
  productCount: number;
  imageUrl?: string | null;
};

const LOCAL_FALLBACKS = [
  "/images/section-cable-cross.jpg",
  "/images/section-conduit.jpg",
  "/images/section-infra.jpg",
] as const;

export function CategoryTiles({
  categories,
  eyebrow = "دسته‌بندی",
  title,
}: {
  categories: CategoryTileData[];
  eyebrow?: string;
  title?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-bg-alt/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title ? (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-copper">{eyebrow}</p>
                <h2 className="brand-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                  {title}
                </h2>
              </>
            ) : (
              <h2 className="brand-display text-2xl font-extrabold text-ink sm:text-3xl">
                {eyebrow}
              </h2>
            )}
          </div>
          <Link href="/products" className="link-arrow shrink-0">
            همه محصولات
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>

        {/* Light list — distinct from photo panels in HomeCablePromo */}
        <ul className="mt-8 divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white">
          {categories.map((cat, i) => {
            const src = resolveMediaUrl(cat.imageUrl, LOCAL_FALLBACKS[i % LOCAL_FALLBACKS.length]);
            return (
              <li key={cat.slug}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex items-center gap-3 px-3.5 py-3.5 transition hover:bg-bg/80 sm:gap-5 sm:px-5 sm:py-4"
                >
                  <span
                    className="hidden w-7 shrink-0 text-center text-xs font-bold tabular-nums text-ink/25 sm:block"
                    aria-hidden
                  >
                    {formatNumberFa(i + 1).padStart(2, "۰")}
                  </span>

                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-bg-alt sm:size-16">
                    <Image
                      src={src}
                      alt={cat.nameFa}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="truncate text-[15px] font-bold text-ink transition group-hover:text-copper sm:text-base">
                        {cat.nameFa}
                      </h3>
                      <span className="rounded-full bg-copper/10 px-2 py-0.5 text-[10px] font-bold text-copper">
                        {formatNumberFa(cat.productCount)} محصول
                      </span>
                    </div>
                    {cat.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs leading-6 text-muted sm:text-sm">
                        {cat.description}
                      </p>
                    ) : null}
                  </div>

                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition group-hover:border-copper/40 group-hover:bg-copper group-hover:text-white">
                    <ArrowLeft className="size-3.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
