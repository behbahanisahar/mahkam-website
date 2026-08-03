"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";

export type CategoryOption = {
  slug: string;
  nameFa: string;
  children?: { slug: string; nameFa: string }[];
};

export function ProductSearch({
  initialQ,
  categories,
  initialCategory,
  initialConductor,
}: {
  initialQ: string;
  categories: CategoryOption[];
  initialCategory: string;
  initialConductor: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [conductor, setConductor] = useState(initialConductor);
  const [pending, startTransition] = useTransition();

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (conductor) params.set("conductor", conductor);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/products?${qs}` : "/products");
    });
  }

  return (
    <form onSubmit={apply} className="ui-card sticky top-[4.75rem] z-30 p-3 sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی نام محصول…"
            disabled={pending}
            className="w-full rounded-xl border border-glass-border bg-bg py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20 disabled:opacity-70"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={pending}
          className="rounded-xl border border-glass-border bg-white py-2.5 pr-3 pl-10 text-sm disabled:opacity-70"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((c) =>
            c.children && c.children.length > 0 ? (
              <optgroup key={c.slug} label={c.nameFa}>
                <option value={c.slug}>همهٔ {c.nameFa}</option>
                {c.children.map((child) => (
                  <option key={child.slug} value={child.slug}>
                    {child.nameFa}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={c.slug} value={c.slug}>
                {c.nameFa}
              </option>
            ),
          )}
        </select>
        <select
          value={conductor}
          onChange={(e) => setConductor(e.target.value)}
          disabled={pending}
          className="rounded-xl border border-glass-border bg-white py-2.5 pr-3 pl-10 text-sm disabled:opacity-70"
        >
          <option value="">همه هادی‌ها</option>
          <option value="مس">مس</option>
          <option value="آلومینیوم">آلومینیوم</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="btn-copper inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-75"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال اعمال…
            </>
          ) : (
            "اعمال"
          )}
        </button>
      </div>
    </form>
  );
}
