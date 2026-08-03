import Link from "next/link";
import { formatNumberFa } from "@/lib/i18n/fa";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  baseParams: Record<string, string | undefined>;
};

function buildHref(page: number, baseParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

const pageBtn =
  "inline-flex min-w-10 items-center justify-center rounded-full border border-glass-border bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:border-copper/40";

export function CatalogPagination({ page, totalPages, baseParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
  });

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="صفحه‌بندی محصولات">
      {page > 1 ? (
        <Link href={buildHref(page - 1, baseParams)} rel="prev" className={pageBtn}>
          قبلی
        </Link>
      ) : null}

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev != null && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {gap ? <span className="text-muted">…</span> : null}
            <Link
              href={buildHref(p, baseParams)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                pageBtn,
                p === page && "border-transparent bg-copper text-white shadow-sm shadow-copper/25 hover:border-transparent",
              )}
            >
              {formatNumberFa(p)}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link href={buildHref(page + 1, baseParams)} rel="next" className={pageBtn}>
          بعدی
        </Link>
      ) : null}
    </nav>
  );
}
