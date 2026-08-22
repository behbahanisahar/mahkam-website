"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Select, type SelectGroup, type SelectOption } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toaster";

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

  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
    setConductor(initialConductor);
  }, [initialQ, initialCategory, initialConductor]);

  const categoryGroups = useMemo<SelectGroup[]>(() => {
    return categories.map((c) =>
      c.children && c.children.length > 0
        ? {
            label: c.nameFa,
            options: [
              { value: c.slug, label: `همهٔ ${c.nameFa}` },
              ...c.children.map((child) => ({ value: child.slug, label: child.nameFa })),
            ],
          }
        : { label: "", options: [{ value: c.slug, label: c.nameFa }] },
    );
  }, [categories]);

  const conductorOptions: SelectOption[] = [
    { value: "", label: "همه هادی‌ها" },
    { value: "مس", label: "مس" },
    { value: "آلومینیوم", label: "آلومینیوم" },
  ];

  function navigate(next: { q?: string; category?: string; conductor?: string }) {
    const params = new URLSearchParams();
    const qv = (next.q ?? q).trim();
    const cat = next.category ?? category;
    const cond = next.conductor ?? conductor;
    if (qv) params.set("q", qv);
    if (cat) params.set("category", cat);
    if (cond) params.set("conductor", cond);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/products?${qs}` : "/products");
    });
  }

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    navigate({});
    toast("فیلتر کاتالوگ اعمال شد.", { type: "success" });
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
        <Select
          value={category}
          onChange={(value) => {
            setCategory(value);
            navigate({ category: value });
          }}
          disabled={pending}
          className="md:w-56"
          placeholder="همه دسته‌ها"
          aria-label="دسته‌بندی"
          options={[{ value: "", label: "همه دسته‌ها" }]}
          groups={categoryGroups.filter((g) => g.options.length > 0)}
        />
        <Select
          value={conductor}
          onChange={(value) => {
            setConductor(value);
            navigate({ conductor: value });
          }}
          disabled={pending}
          className="md:w-40"
          options={conductorOptions}
          aria-label="هادی"
        />
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
