"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

export type AdminCategoryOption = {
  id: string;
  nameFa: string;
  parentId: string | null;
};

export function AdminProductSearch({
  initialQ,
  initialCategoryId,
  initialStatus,
  categories,
}: {
  initialQ: string;
  initialCategoryId: string;
  initialStatus: string;
  categories: AdminCategoryOption[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  const parents = categories.filter((c) => !c.parentId);
  const childrenOf = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  function push(next: { q?: string; category?: string; status?: string }) {
    const params = new URLSearchParams();
    const qv = (next.q ?? q).trim();
    const cat = next.category ?? categoryId;
    const st = next.status ?? status;
    if (qv) params.set("q", qv);
    if (cat) params.set("category", cat);
    if (st) params.set("status", st);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/admin/products?${qs}` : "/admin/products");
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    push({});
  }

  function clearAll() {
    setQ("");
    setCategoryId("");
    setStatus("");
    startTransition(() => router.push("/admin/products"));
  }

  const hasFilters = Boolean(initialQ || initialCategoryId || initialStatus);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-glass-border/80 bg-white/70 p-3 shadow-sm sm:p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو بر اساس نام، اسلاگ یا دسته…"
            disabled={pending}
            className="w-full rounded-xl border border-glass-border bg-bg py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20 disabled:opacity-70"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            push({ category: e.target.value });
          }}
          disabled={pending}
          className="rounded-xl border border-glass-border bg-white py-2.5 px-3 text-sm disabled:opacity-70 lg:w-52"
        >
          <option value="">همه دسته‌ها</option>
          {parents.map((p) => {
            const kids = childrenOf(p.id);
            if (kids.length === 0) {
              return (
                <option key={p.id} value={p.id}>
                  {p.nameFa}
                </option>
              );
            }
            return (
              <optgroup key={p.id} label={p.nameFa}>
                <option value={p.id}>همهٔ {p.nameFa}</option>
                {kids.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameFa}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            push({ status: e.target.value });
          }}
          disabled={pending}
          className="rounded-xl border border-glass-border bg-white py-2.5 px-3 text-sm disabled:opacity-70 lg:w-40"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر</option>
          <option value="draft">پیش‌نویس</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-70"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            جستجو
          </button>
          {hasFilters ? (
            <button
              type="button"
              disabled={pending}
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-xl border border-glass-border px-3 py-2.5 text-sm text-muted hover:bg-bg-alt disabled:opacity-70"
            >
              <X className="size-4" />
              پاک‌سازی
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
