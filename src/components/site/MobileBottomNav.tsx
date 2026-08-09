"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, LineChart, Phone, ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumberFa } from "@/lib/i18n/fa";
import type { NavCategory } from "@/components/site/SiteHeader";

type Props = {
  telegramUrl: string;
  categories?: NavCategory[];
};

const leftItems = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/products", label: "محصولات", icon: Package, expandable: true },
] as const;

const rightItems = [
  { href: "/prices", label: "نرخ‌ها", icon: LineChart },
  { href: "/contact", label: "تماس", icon: Phone },
] as const;

export function MobileBottomNav({ telegramUrl, categories = [] }: Props) {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const telegramRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setProductsOpen(false);
    setExpandedSlug(null);
  }, [pathname]);

  useEffect(() => {
    if (!productsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProductsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [productsOpen]);

  useEffect(() => {
    const el = telegramRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: "rotate(0deg) scale(0.7)" },
        { transform: "rotate(720deg) scale(1.1)", offset: 0.8 },
        { transform: "rotate(720deg) scale(1)" },
      ],
      { duration: 1200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" },
    );
  }, []);

  function renderItem(
    item: (typeof leftItems)[number] | (typeof rightItems)[number],
  ) {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    const expandable = "expandable" in item && item.expandable;

    if (expandable) {
      return (
        <button
          key={item.href}
          type="button"
          aria-expanded={productsOpen}
          onClick={() => setProductsOpen((v) => !v)}
          className={cn(
            "flex flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] transition sm:text-[11px]",
            active || productsOpen ? "text-copper" : "text-ink/40",
          )}
        >
          <Icon className="size-5" strokeWidth={active || productsOpen ? 2.25 : 1.75} />
          <span className="inline-flex items-center gap-0.5 font-medium">
            {item.label}
            <ChevronDown
              className={cn("size-2.5 transition duration-200", productsOpen && "rotate-180")}
            />
          </span>
        </button>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setProductsOpen(false)}
        className={cn(
          "flex flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] transition sm:text-[11px]",
          active ? "text-copper" : "text-ink/40",
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      {productsOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px] lg:hidden"
          aria-label="بستن منوی محصولات"
          onClick={() => setProductsOpen(false)}
        />
      ) : null}

      <nav
        className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white/92 text-ink shadow-[0_18px_40px_-22px_rgba(15,23,42,0.4)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="منوی اصلی"
      >
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            productsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className="max-h-[min(52vh,420px)] overflow-y-auto border-b border-ink/6 bg-[#f7f6f3]"
              role="region"
              aria-label="دسته‌بندی محصولات"
            >
              <Link
                href="/products"
                onClick={() => setProductsOpen(false)}
                className="block px-5 py-3.5 text-sm font-semibold text-copper transition active:bg-ink/4"
              >
                همه محصولات
              </Link>
              {categories.map((cat) => {
                const hasChildren = Boolean(cat.children?.length);
                const open = expandedSlug === cat.slug;
                return (
                  <div key={cat.slug} className="border-t border-ink/6">
                    <div className="flex items-stretch">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setProductsOpen(false)}
                        className="min-w-0 flex-1 px-5 py-3.5 text-sm font-medium text-ink/80 transition active:bg-ink/4"
                      >
                        <span className="block truncate">{cat.nameFa}</span>
                        {typeof cat.productCount === "number" ? (
                          <span className="mt-0.5 block text-[11px] text-ink/35">
                            {formatNumberFa(cat.productCount)} محصول
                          </span>
                        ) : null}
                      </Link>
                      {hasChildren ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={open ? "بستن زیردسته‌ها" : "باز کردن زیردسته‌ها"}
                          onClick={() => setExpandedSlug(open ? null : cat.slug)}
                          className="flex w-12 shrink-0 items-center justify-center text-ink/35 transition active:bg-ink/4"
                        >
                          <ChevronDown
                            className={cn("size-4 transition duration-200", open && "rotate-180")}
                          />
                        </button>
                      ) : null}
                    </div>
                    {hasChildren ? (
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-250 ease-out",
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <ul className="border-t border-ink/6 bg-white/60 pb-2">
                            {cat.children!.map((child) => (
                              <li key={child.slug}>
                                <Link
                                  href={`/products?category=${child.slug}`}
                                  onClick={() => setProductsOpen(false)}
                                  className="flex items-center gap-2 px-5 py-2.5 pr-8 text-[13px] text-ink/55 transition active:bg-ink/4 active:text-ink"
                                >
                                  <span className="size-1 shrink-0 rounded-full bg-copper/70" />
                                  <span className="truncate">{child.nameFa}</span>
                                  {typeof child.productCount === "number" ? (
                                    <span className="mr-auto text-[10px] text-ink/30">
                                      {formatNumberFa(child.productCount)}
                                    </span>
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-1 pt-1">
          <div className="grid grid-cols-5 items-end gap-0.5">
            {leftItems.map(renderItem)}

            <div className="flex flex-col items-center pb-1">
              <a
                ref={telegramRef}
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="قیمت در تلگرام"
                className="-mt-5 flex size-14 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30 transition active:scale-95"
              >
                <Send className="size-6" strokeWidth={2.25} />
              </a>
              <span className="mt-1 text-[10px] font-semibold text-ink/55 sm:text-[11px]">
                تلگرام
              </span>
            </div>

            {rightItems.map(renderItem)}
          </div>
        </div>
      </nav>
    </>
  );
}
