"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, LineChart, Phone, ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/components/site/SiteHeader";
import { parentSlugOf, isNavCategoryActive } from "@/components/site/nav-category";
import { useActiveProductCategory } from "@/components/site/useActiveProductCategory";

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
  return (
    <Suspense fallback={<MobileBottomNavBar telegramUrl={telegramUrl} categories={categories} activeCategory="" />}>
      <MobileBottomNavFromQuery telegramUrl={telegramUrl} categories={categories} />
    </Suspense>
  );
}

function MobileBottomNavFromQuery({ telegramUrl, categories = [] }: Props) {
  const activeCategory = useActiveProductCategory();
  return (
    <MobileBottomNavBar
      telegramUrl={telegramUrl}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
}

function MobileBottomNavBar({
  telegramUrl,
  categories = [],
  activeCategory,
}: Props & { activeCategory: string }) {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const telegramRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setProductsOpen(false);
  }, [pathname, activeCategory]);

  useEffect(() => {
    const parent = parentSlugOf(categories, activeCategory);
    if (parent) setExpandedSlug(parent);
  }, [activeCategory, categories]);

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
            active || productsOpen ? "text-copper" : "text-white/45",
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
          active ? "text-copper" : "text-white/45",
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="بستن منوی محصولات"
          onClick={() => setProductsOpen(false)}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 bg-ink text-white pb-[env(safe-area-inset-bottom)] lg:hidden"
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
              className="max-h-[min(52vh,420px)] overflow-y-auto border-t border-white/10"
              role="region"
              aria-label="دسته‌بندی محصولات"
            >
              <Link
                href="/products"
                onClick={() => setProductsOpen(false)}
                aria-current={pathname === "/products" && !activeCategory ? "page" : undefined}
                className={cn(
                  "block px-5 py-3.5 text-sm font-semibold transition active:bg-white/5",
                  pathname === "/products" && !activeCategory
                    ? "bg-white/8 text-copper"
                    : "text-copper",
                )}
              >
                همه محصولات
              </Link>
              {categories.map((cat) => {
                const hasChildren = Boolean(cat.children?.length);
                const open = expandedSlug === cat.slug;
                const catActive = isNavCategoryActive(
                  cat.slug,
                  activeCategory,
                  cat.children,
                );
                return (
                  <div key={cat.slug} className="border-t border-white/8">
                    <div className="flex items-stretch">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setProductsOpen(false)}
                        aria-current={cat.slug === activeCategory ? "page" : undefined}
                        className={cn(
                          "min-w-0 flex-1 px-5 py-3.5 text-sm font-medium transition active:bg-white/5",
                          catActive ? "bg-white/8 text-copper" : "text-white/85",
                        )}
                      >
                        <span className="block truncate">{cat.nameFa}</span>
                      </Link>
                      {hasChildren ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={open ? "بستن زیردسته‌ها" : "باز کردن زیردسته‌ها"}
                          onClick={() => setExpandedSlug(open ? null : cat.slug)}
                          className="flex w-12 shrink-0 items-center justify-center text-white/40 transition active:bg-white/5"
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
                          <ul className="border-t border-white/6 bg-white/[0.03] pb-2">
                            {cat.children!.map((child) => {
                              const selected = child.slug === activeCategory;
                              return (
                              <li key={child.slug}>
                                <Link
                                  href={`/products?category=${child.slug}`}
                                  onClick={() => setProductsOpen(false)}
                                  aria-current={selected ? "page" : undefined}
                                  className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 pr-8 text-[13px] transition active:bg-white/5",
                                    selected
                                      ? "bg-white/10 font-semibold text-white"
                                      : "text-white/55 active:text-white",
                                  )}
                                >
                                  <span className="size-1 shrink-0 rounded-full bg-copper/70" />
                                  <span className="truncate">{child.nameFa}</span>
                                </Link>
                              </li>
                            );
                            })}
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

        <div className="border-t border-white/10 px-1 pt-1">
          <div className="grid grid-cols-5 items-end gap-0.5">
            {leftItems.map(renderItem)}

            <div className="flex flex-col items-center pb-1">
              <a
                ref={telegramRef}
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="قیمت در تلگرام"
                className="-mt-5 flex size-14 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/35 transition active:scale-95"
              >
                <Send className="size-6" strokeWidth={2.25} />
              </a>
              <span className="mt-1 text-[10px] font-semibold text-white/80 sm:text-[11px]">
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
