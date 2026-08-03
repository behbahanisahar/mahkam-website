"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { SITE_FAQS } from "@/lib/content/faq";
import { formatNumberFa } from "@/lib/i18n/fa";
import { cn } from "@/lib/utils";

export function FaqAccordion({ limit }: { limit?: number }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [openId, setOpenId] = useState<string | null>(SITE_FAQS[0]?.q ?? null);

  const items = useMemo(() => {
    const source = limit != null ? SITE_FAQS.slice(0, limit) : SITE_FAQS;
    if (!deferredQuery) return [...source];
    const q = deferredQuery.toLowerCase();
    return source.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [limit, deferredQuery]);

  return (
    <div className="space-y-5">
      <label className="relative block">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در سوالات…"
          className="w-full rounded-2xl border border-ink/10 bg-white py-3.5 pe-4 ps-11 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-copper/50 focus:ring-2 focus:ring-copper/20"
          dir="rtl"
        />
      </label>

      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>{formatNumberFa(items.length)} سوال</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 font-semibold text-ink/70 transition hover:border-copper/30 hover:text-copper"
            onClick={() => setOpenId(items[0]?.q ?? null)}
          >
            باز کردن اولی
          </button>
          <button
            type="button"
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 font-semibold text-ink/70 transition hover:border-copper/30 hover:text-copper"
            onClick={() => setOpenId(null)}
          >
            بستن همه
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-12 text-center text-sm text-muted">
          نتیجه‌ای برای «{query}» پیدا نشد.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const open = openId === item.q;
            return (
              <li key={item.q}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition duration-300",
                    open
                      ? "border-copper/35 shadow-[0_12px_40px_-24px_rgba(184,149,42,0.55)]"
                      : "border-ink/8 hover:border-ink/15",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className="flex w-full items-start gap-3 px-4 py-4 text-start sm:gap-4 sm:px-5 sm:py-5"
                    onClick={() => setOpenId(open ? null : item.q)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition",
                        open ? "bg-copper text-white" : "bg-ink/[0.04] text-ink/45",
                      )}
                    >
                      {formatNumberFa(index + 1)}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5 text-[15px] font-bold leading-7 text-ink sm:text-base sm:leading-8">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition",
                        open
                          ? "border-copper/40 bg-copper/10 text-copper"
                          : "border-ink/10 text-ink/40",
                      )}
                    >
                      <ChevronDown
                        className={cn("size-4 transition duration-300", open && "rotate-180")}
                      />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-ink/6 px-4 pb-5 pe-12 ps-[3.25rem] text-sm leading-8 text-muted sm:px-5 sm:ps-[4.25rem] sm:text-[15px]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
