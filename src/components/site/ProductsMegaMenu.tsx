"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNumberFa } from "@/lib/i18n/fa";

export type MegaCategory = {
  slug: string;
  nameFa: string;
  productCount?: number;
  children?: { slug: string; nameFa: string; productCount?: number }[];
};

type Props = {
  open: boolean;
  categories: MegaCategory[];
  onNavigate?: () => void;
  className?: string;
  variant?: "dark" | "light";
};

export function ProductsMegaMenu({
  open,
  categories,
  onNavigate,
  className,
  variant = "dark",
}: Props) {
  const cols = categories.length > 0 ? categories : [];
  const light = variant === "light";

  return (
    <div
      data-open={open ? "true" : "false"}
      className={cn(
        "mega-panel absolute inset-x-0 top-0 z-50 overflow-hidden rounded-[1.5rem]",
        light
          ? "border border-ink/8 bg-white shadow-[0_24px_50px_-28px_rgba(15,23,42,0.35)]"
          : "border border-white/10 bg-ink-soft shadow-2xl shadow-black/40",
        className,
      )}
      role="menu"
      aria-hidden={!open}
    >
      <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain p-4 sm:p-5">
        {cols.length === 0 ? (
          <p
            className={cn(
              "px-2 py-6 text-center text-sm",
              light ? "text-ink/40" : "text-white/50",
            )}
          >
            هنوز دسته‌بندی‌ای ثبت نشده است.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
            {cols.map((cat, i) => (
              <div
                key={cat.slug}
                className={cn(
                  "min-w-0 px-2 lg:px-5",
                  i > 0 && (light ? "lg:border-s lg:border-ink/8" : "lg:border-s lg:border-white/10"),
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        "block text-[15px] font-bold leading-7 transition",
                        light ? "text-ink hover:text-copper" : "text-white hover:text-copper",
                      )}
                    >
                      {cat.nameFa}
                      {typeof cat.productCount === "number" ? (
                        <span className="mr-2 text-xs font-semibold text-copper">
                          ({formatNumberFa(cat.productCount)})
                        </span>
                      ) : null}
                    </Link>
                  </div>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    onClick={onNavigate}
                    className="shrink-0 text-[11px] font-semibold text-copper transition hover:text-copper-light"
                  >
                    مشاهده
                  </Link>
                </div>

                <ul className="space-y-1.5">
                  {(cat.children?.length
                    ? cat.children
                    : [{ slug: cat.slug, nameFa: "همه موارد این دسته", productCount: cat.productCount }]
                  ).map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/products?category=${child.slug}`}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition",
                          light
                            ? "text-ink/60 hover:bg-ink/4 hover:text-ink"
                            : "text-white/70 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-copper shadow-[0_0_0_3px_color-mix(in_srgb,var(--copper)_25%,transparent)]" />
                        <span className="min-w-0 flex-1 truncate">{child.nameFa}</span>
                        {typeof child.productCount === "number" && child.productCount > 0 ? (
                          <span
                            className={cn(
                              "tabular-nums text-[11px] group-hover:text-copper",
                              light ? "text-ink/30" : "text-white/35",
                            )}
                          >
                            {formatNumberFa(child.productCount)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className={cn("mt-5 border-t pt-4", light ? "border-ink/8" : "border-white/10")}>
          <Link
            href="/products"
            onClick={onNavigate}
            className="inline-flex items-center rounded-full bg-copper px-4 py-2 text-sm font-bold text-white transition hover:bg-copper-light"
          >
            همه محصولات
          </Link>
        </div>
      </div>
    </div>
  );
}
