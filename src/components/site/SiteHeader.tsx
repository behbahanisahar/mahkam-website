"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, ChevronDown, Menu, Search, X, Send } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { ProductsMegaMenu, type MegaCategory } from "@/components/site/ProductsMegaMenu";
import { parentSlugOf, isNavCategoryActive } from "@/components/site/nav-category";
import { useActiveProductCategory } from "@/components/site/useActiveProductCategory";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { getTelegramHandleLabel } from "@/lib/site";

const links = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات", hasMenu: true },
  { href: "/prices", label: "نرخ‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
] as const;

export type NavCategory = MegaCategory;

type HeaderProps = {
  telegramUrl: string;
  phones?: string[];
  categories?: NavCategory[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader(props: HeaderProps) {
  return (
    <Suspense fallback={<SiteHeaderBar {...props} activeCategory="" />}>
      <SiteHeaderFromQuery {...props} />
    </Suspense>
  );
}

function SiteHeaderFromQuery(props: HeaderProps) {
  const activeCategory = useActiveProductCategory();
  return <SiteHeaderBar {...props} activeCategory={activeCategory} />;
}

function SiteHeaderBar({
  telegramUrl,
  phones = [],
  categories = [],
  activeCategory,
}: HeaderProps & { activeCategory: string }) {
  const pathname = usePathname();
  const primaryPhone = phones[0];
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [liveCategories, setLiveCategories] = useState<NavCategory[]>(categories);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHome = pathname === "/";

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 240);
  };

  useEffect(() => {
    setLiveCategories(categories);
  }, [categories]);

  // If SSR passed an empty list (stale cache), load from API
  useEffect(() => {
    if (categories.length > 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const json = (await res.json()) as { categories?: NavCategory[] };
        if (!cancelled && json.categories?.length) {
          setLiveCategories(json.categories);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categories.length]);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setMobileProductsOpen(false);
  }, [pathname, activeCategory]);

  useEffect(() => {
    const parent = parentSlugOf(liveCategories, activeCategory);
    if (parent) setExpandedSlug(parent);
  }, [activeCategory, liveCategories]);

  useEffect(() => {
    if (!mobileOpen) return;
    if (pathname !== "/products") return;
    setMobileProductsOpen(true);
  }, [mobileOpen, pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <>
      <ScrollProgress />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Toaster />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          isHome
            ? "border-b border-white/10 bg-ink/70 text-white shadow-lg shadow-black/20 backdrop-blur-md"
            : "border-b border-ink/8 bg-white/90 text-ink shadow-sm backdrop-blur-md",
        )}
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Logo
            variant={isHome ? "light" : "default"}
            className="shrink-0"
            imageClassName="h-9 w-auto max-w-[110px] sm:h-10 sm:max-w-[130px]"
          />

          <nav
            className={cn(
              "hidden items-center gap-1 lg:flex",
              isHome ? "ms-auto" : "flex-1 justify-center",
            )}
            aria-label="منوی اصلی"
          >
            {links.map((l) => {
              const active = isActivePath(pathname, l.href);
              const isProducts = "hasMenu" in l && l.hasMenu;
              const linkTone = isHome
                ? cn(
                    "rounded-none bg-transparent px-3 text-white/85 hover:bg-transparent hover:text-white",
                    (active || (isProducts && megaOpen)) && "text-[#ff6b00]",
                  )
                : cn(
                    "text-ink/60 hover:bg-ink/5 hover:text-ink",
                    (active || (isProducts && megaOpen)) && "bg-copper/12 text-copper-deep",
                  );

              if (isProducts) {
                return (
                  <div
                    key={l.href}
                    className="relative"
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleCloseMega}
                    onFocus={openMega}
                    onBlur={scheduleCloseMega}
                  >
                    <Link
                      href="/products"
                      aria-expanded={megaOpen}
                      aria-haspopup="menu"
                      className={cn("nav-pill inline-flex items-center gap-1", linkTone)}
                    >
                      {l.label}
                      <ChevronDown
                        className={cn("size-3.5 transition duration-200", megaOpen && "rotate-180")}
                      />
                    </Link>
                    <ProductsMegaMenu
                      open={megaOpen}
                      categories={liveCategories}
                      activeSlug={activeCategory}
                      isCatalogPage={pathname === "/products"}
                      onNavigate={() => setMegaOpen(false)}
                    />
                  </div>
                );
              }

              return (
                <Link key={l.href} href={l.href} className={cn("nav-pill", linkTone)}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className={cn("hidden items-center gap-2 lg:flex", isHome && "hidden")}>
            <Link
              href="/products"
              aria-label="جستجوی محصولات"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-ink/12 text-ink/60 transition hover:border-ink/25 hover:text-ink"
            >
              <Search className="size-4" />
            </Link>
            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="btn-copper inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
              >
                <Phone className="size-3.5" />
                تماس سریع
              </a>
            ) : (
              <Link
                href="/contact"
                className="btn-copper inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
              >
                <Phone className="size-3.5" />
                تماس سریع
              </Link>
            )}
          </div>

          <div className="mr-auto flex items-center gap-1.5 lg:hidden">
            <Link
              href="/products"
              aria-label="محصولات"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl",
                isHome ? "text-white/85 hover:bg-white/10" : "text-ink/70 hover:bg-ink/5",
              )}
            >
              <Search className="size-[18px]" />
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl",
                isHome ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
              )}
            >
              {mobileOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile full drawer — only mounted when open so it never leaks into mobile chrome */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="بستن"
            className="absolute inset-0 bg-black/55 animate-[fade-in_0.25s_ease]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 flex w-[min(100%,360px)] flex-col bg-ink shadow-2xl animate-[drawer-in_0.3s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Logo variant="light" imageClassName="h-9 w-auto max-w-[120px]" />
              <button
                type="button"
                aria-label="بستن منو"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {links.map((l) => {
                const active = isActivePath(pathname, l.href);
                if ("hasMenu" in l && l.hasMenu) {
                  return (
                    <div key={l.href} className="mb-1">
                      <button
                        type="button"
                        onClick={() => setMobileProductsOpen((v) => !v)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold",
                          active || mobileProductsOpen
                            ? "bg-copper text-white"
                            : "text-white/80 hover:bg-white/5",
                        )}
                      >
                        <span>{l.label}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 transition",
                            mobileProductsOpen && "rotate-180",
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300",
                          mobileProductsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="mt-1 space-y-0.5 rounded-xl border border-white/10 bg-white/3 p-2">
                            <Link
                              href="/products"
                              onClick={() => setMobileOpen(false)}
                              aria-current={pathname === "/products" && !activeCategory ? "page" : undefined}
                              className={cn(
                                "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                                pathname === "/products" && !activeCategory
                                  ? "bg-copper/20 text-copper"
                                  : "text-copper",
                              )}
                            >
                              همه محصولات
                            </Link>
                            {liveCategories.map((cat) => {
                              const open = expandedSlug === cat.slug;
                              const hasChildren = Boolean(cat.children?.length);
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
                                      onClick={() => setMobileOpen(false)}
                                      aria-current={cat.slug === activeCategory ? "page" : undefined}
                                      className={cn(
                                        "min-w-0 flex-1 px-3 py-2.5 text-sm font-medium",
                                        catActive ? "text-copper" : "text-white/85",
                                      )}
                                    >
                                      {cat.nameFa}
                                    </Link>
                                    {hasChildren ? (
                                      <button
                                        type="button"
                                        aria-expanded={open}
                                        onClick={() =>
                                          setExpandedSlug(open ? null : cat.slug)
                                        }
                                        className="flex w-11 items-center justify-center text-white/45"
                                      >
                                        <ChevronDown
                                          className={cn(
                                            "size-4 transition",
                                            open && "rotate-180",
                                          )}
                                        />
                                      </button>
                                    ) : null}
                                  </div>
                                  <div
                                    className={cn(
                                      "grid transition-[grid-template-rows] duration-200",
                                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                                    )}
                                  >
                                    <div className="min-h-0 overflow-hidden">
                                      {cat.children?.map((child) => {
                                        const selected = child.slug === activeCategory;
                                        return (
                                        <Link
                                          key={child.slug}
                                          href={`/products?category=${child.slug}`}
                                          onClick={() => setMobileOpen(false)}
                                          aria-current={selected ? "page" : undefined}
                                          className={cn(
                                            "flex items-center gap-2 px-3 py-2 pr-5 text-[13px]",
                                            selected
                                              ? "rounded-lg bg-white/10 font-semibold text-white"
                                              : "text-white/55",
                                          )}
                                        >
                                          <span className="size-1.5 rounded-full bg-copper" />
                                          <span>{child.nameFa}</span>
                                        </Link>
                                      );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "mb-1 block rounded-xl px-3 py-3 text-sm font-semibold",
                      active ? "bg-copper text-white" : "text-white/80 hover:bg-white/5",
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-white/10 p-4">
              {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone}`}
                  className="btn-copper flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold"
                >
                  <Phone className="size-4" />
                  تماس سریع
                </a>
              ) : null}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#229ED9] py-3 text-sm font-semibold text-white transition hover:bg-[#1B8FC7]"
              >
                <Send className="size-4" />
                <span dir="ltr">{getTelegramHandleLabel()}</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Always reserve header space except over home hero */}
      {!isHome ? <div className="h-16 shrink-0 sm:h-[4.5rem]" aria-hidden /> : null}
    </>
  );
}
