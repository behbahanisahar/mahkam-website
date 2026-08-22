import Link from "next/link";
import { formatNumberFa } from "@/lib/i18n/fa";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  baseParams: Record<string, string | undefined>;
};

function hrefFor(page: number, basePath: string, baseParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const pageBtn =
  "inline-flex min-w-9 items-center justify-center rounded-xl border border-glass-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-copper/40 hover:bg-copper/5";

export function AdminPagination({ page, totalPages, basePath, baseParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
  });

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="صفحه‌بندی">
      {page > 1 ? (
        <Link href={hrefFor(page - 1, basePath, baseParams)} rel="prev" className={pageBtn}>
          قبلی
        </Link>
      ) : (
        <span className={cn(pageBtn, "pointer-events-none opacity-40")}>قبلی</span>
      )}

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev != null && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {gap ? <span className="text-muted">…</span> : null}
            <Link
              href={hrefFor(p, basePath, baseParams)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                pageBtn,
                p === page &&
                  "border-transparent bg-copper text-white shadow-sm shadow-copper/25 hover:border-transparent hover:bg-copper",
              )}
            >
              {formatNumberFa(p)}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1, basePath, baseParams)} rel="next" className={pageBtn}>
          بعدی
        </Link>
      ) : (
        <span className={cn(pageBtn, "pointer-events-none opacity-40")}>بعدی</span>
      )}
    </nav>
  );
}
