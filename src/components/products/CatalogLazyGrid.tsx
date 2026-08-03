"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";
import { CatalogPagination } from "@/components/products/CatalogPagination";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/Reveal";
import { Loader2 } from "lucide-react";

type Props = {
  initialProducts: ProductCardData[];
  page: number;
  totalPages: number;
  total: number;
  baseParams: Record<string, string | undefined>;
};

export function CatalogLazyGrid({
  initialProducts,
  page,
  totalPages,
  baseParams,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMore, setHasMore] = useState(page < totalPages);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(page);
    setHasMore(page < totalPages);
    setError(null);
  }, [initialProducts, page, totalPages]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || pending) return;
    loadingRef.current = true;

    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(baseParams)) {
          if (value) params.set(key, value);
        }
        params.set("page", String(currentPage + 1));

        const res = await fetch(`/api/catalog?${params.toString()}`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as {
          products: ProductCardData[];
          page: number;
          totalPages: number;
        };

        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.slug));
          const next = data.products.filter((p) => !seen.has(p.slug));
          return [...prev, ...next];
        });
        setCurrentPage(data.page);
        setHasMore(data.page < data.totalPages);
        setError(null);
      } catch {
        setError("بارگذاری محصولات بعدی ناموفق بود.");
      } finally {
        loadingRef.current = false;
      }
    });
  }, [baseParams, currentPage, hasMore, pending]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {products.map((p, index) => (
          <Reveal key={p.slug} delay={Math.min(index % 6, 5) * 40} variant="scale">
            <ProductCard product={p} priority={index < 3} />
          </Reveal>
        ))}
        {pending
          ? [0, 1, 2].map((i) => <ProductCardSkeleton key={`sk-${i}`} />)
          : null}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="flex min-h-12 flex-col items-center justify-center gap-2 py-4">
          {pending ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-copper" />
              در حال بارگذاری…
            </p>
          ) : (
            <p className="text-xs text-muted">برای دیدن محصولات بیشتر اسکرول کنید</p>
          )}
          {error ? (
            <button
              type="button"
              onClick={loadMore}
              className="text-xs font-medium text-copper hover:underline"
            >
              {error} — تلاش مجدد
            </button>
          ) : null}
        </div>
      ) : products.length > 0 ? (
        <p className="text-center text-xs text-muted">همه محصولات این فهرست نمایش داده شد</p>
      ) : null}

      <CatalogPagination page={page} totalPages={totalPages} baseParams={baseParams} />
    </div>
  );
}
