"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderTree,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createSubcategoriesBulkAction,
  deleteCategoryAction,
  upsertCategoryAction,
} from "@/lib/actions/admin";
import { formatNumberFa } from "@/lib/i18n/fa";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export type AdminCategoryRow = {
  id: string;
  nameFa: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
  childCount: number;
};

type Panel =
  | { mode: "create" }
  | { mode: "edit"; id: string }
  | { mode: "subs"; id: string };

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-glass-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20";

function CategoryFormFields({
  category,
  parents,
}: {
  category?: AdminCategoryRow;
  parents: AdminCategoryRow[];
}) {
  const canBeChild = !category || category.childCount === 0;

  return (
    <div className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <label className="block text-sm font-medium">
        نام دسته
        <input
          name="nameFa"
          required
          autoFocus
          defaultValue={category?.nameFa ?? ""}
          placeholder="مثلاً سیم افشان"
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium">
        اسلاگ
        <input
          name="slug"
          dir="ltr"
          defaultValue={category?.slug ?? ""}
          placeholder="خودکار از نام ساخته می‌شود"
          className={fieldClass}
        />
        <span className="mt-1 block text-xs font-normal text-muted">
          در آدرس صفحه محصولات استفاده می‌شود. خالی بگذارید تا خودکار ساخته شود.
        </span>
      </label>

      <label className="block text-sm font-medium">
        ترتیب نمایش
        <input
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium">
        توضیحات
        <textarea
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          placeholder="اختیاری — در صفحه دسته نمایش داده می‌شود"
          className={fieldClass}
        />
      </label>

      {canBeChild ? (
        <label className="block text-sm font-medium">
          سطح
          <Select
            name="parentId"
            defaultValue={category?.parentId ?? ""}
            className="mt-1.5"
            options={[
              { value: "", label: "دسته سطح اول" },
              ...parents
                .filter((p) => p.id !== category?.id)
                .map((p) => ({ value: p.id, label: `زیردستهٔ ${p.nameFa}` })),
            ]}
          />
        </label>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-6 text-amber-900">
          این دسته زیردسته دارد، بنابراین خودش دسته سطح اول می‌ماند.
          <input type="hidden" name="parentId" value="" />
        </div>
      )}
    </div>
  );
}

function SidePanel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="category-panel-title">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-bg shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-glass-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="category-panel-title" className="text-base font-bold">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-ink/5 hover:text-ink"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function DeleteControl({
  category,
  confirming,
  onAsk,
  onCancel,
}: {
  category: AdminCategoryRow;
  confirming: boolean;
  onAsk: () => void;
  onCancel: () => void;
}) {
  if (confirming) {
    return (
      <form action={deleteCategoryAction} className="flex flex-wrap items-center gap-1.5">
        <input type="hidden" name="id" value={category.id} />
        <span className="text-[11px] text-red-700">حذف شود؟</span>
        <SubmitButton
          className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white"
          pendingLabel="حذف…"
        >
          بله
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-glass-border bg-white px-2.5 py-1 text-[11px]"
        >
          خیر
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={onAsk}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
    >
      <Trash2 className="size-3.5" />
      حذف
    </button>
  );
}

export function CategoryAdminPanel({ categories }: { categories: AdminCategoryRow[] }) {
  const parents = useMemo(
    () =>
      categories
        .filter((c) => !c.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.nameFa.localeCompare(b.nameFa, "fa")),
    [categories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, AdminCategoryRow[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder || a.nameFa.localeCompare(b.nameFa, "fa"));
    }
    return map;
  }, [categories]);

  const parentIds = useMemo(() => new Set(parents.map((p) => p.id)), [parents]);
  const orphans = useMemo(
    () =>
      categories.filter((c) => c.parentId && !parentIds.has(c.parentId)),
    [categories, parentIds],
  );

  const [panel, setPanel] = useState<Panel | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const closePanel = useCallback(() => setPanel(null), []);

  const q = query.trim();
  const visibleParents = useMemo(() => {
    if (!q) return parents;
    return parents.filter((p) => {
      const kids = childrenByParent.get(p.id) ?? [];
      const blob = [p.nameFa, p.slug, ...kids.map((k) => `${k.nameFa} ${k.slug}`)]
        .join(" ")
        .toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [parents, childrenByParent, q]);

  const editing = panel?.mode === "edit" ? categories.find((c) => c.id === panel.id) : null;
  const bulkParent = panel?.mode === "subs" ? categories.find((c) => c.id === panel.id) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی دسته یا زیردسته…"
            className="w-full rounded-xl border border-glass-border bg-white py-2.5 pr-10 pl-3 text-sm outline-none focus:border-copper focus:ring-2 focus:ring-copper/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setPanel({ mode: "create" })}
          className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="size-4" />
          دسته جدید
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-white/50 px-6 py-16 text-center">
          <FolderTree className="mx-auto size-10 text-muted/50" />
          <p className="mt-3 text-sm font-medium">هنوز دسته‌ای ثبت نشده</p>
          <p className="mt-1 text-xs text-muted">اول یک دسته سطح اول بسازید، بعد زیردسته‌ها را به آن اضافه کنید.</p>
          <button
            type="button"
            onClick={() => setPanel({ mode: "create" })}
            className="btn-copper mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="size-4" />
            ساخت اولین دسته
          </button>
        </div>
      ) : visibleParents.length === 0 && orphans.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-glass-border px-4 py-10 text-center text-sm text-muted">
          نتیجه‌ای برای «{q}» پیدا نشد.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleParents.map((parent) => {
            const kids = childrenByParent.get(parent.id) ?? [];
            return (
              <section
                key={parent.id}
                className="overflow-hidden rounded-2xl border border-glass-border/80 bg-white/80 shadow-sm"
              >
                <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">{parent.nameFa}</h2>
                      <span className="rounded-full bg-copper/12 px-2 py-0.5 text-[10px] font-semibold text-copper-deep">
                        دسته
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted" dir="ltr">
                      {parent.slug}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatNumberFa(parent.productCount)} محصول
                      <span className="mx-1.5 text-muted/40">·</span>
                      {formatNumberFa(kids.length)} زیردسته
                      <span className="mx-1.5 text-muted/40">·</span>
                      ترتیب {formatNumberFa(parent.sortOrder)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPanel({ mode: "subs", id: parent.id })}
                      className="inline-flex items-center gap-1 rounded-lg border border-copper/20 bg-copper/8 px-3 py-2 text-xs font-medium text-copper-deep hover:bg-copper/15"
                    >
                      <Plus className="size-3.5" />
                      زیردسته
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanel({ mode: "edit", id: parent.id })}
                      className="inline-flex items-center gap-1 rounded-lg border border-glass-border bg-white px-3 py-2 text-xs font-medium hover:bg-bg-alt"
                    >
                      <Pencil className="size-3.5" />
                      ویرایش
                    </button>
                    <DeleteControl
                      category={parent}
                      confirming={confirmDeleteId === parent.id}
                      onAsk={() => setConfirmDeleteId(parent.id)}
                      onCancel={() => setConfirmDeleteId(null)}
                    />
                  </div>
                </div>

                {kids.length > 0 ? (
                  <ul className="border-t border-glass-border/70 bg-bg-alt/40">
                    {kids.map((child) => (
                      <li
                        key={child.id}
                        className="flex flex-col gap-2 border-t border-glass-border/50 px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 ps-3 sm:ps-5">
                          <p className="text-sm font-medium">{child.nameFa}</p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            <span dir="ltr">{child.slug}</span>
                            <span className="mx-1.5">·</span>
                            {formatNumberFa(child.productCount)} محصول
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 ps-3 sm:ps-0">
                          <button
                            type="button"
                            onClick={() => setPanel({ mode: "edit", id: child.id })}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-white"
                          >
                            <Pencil className="size-3.5" />
                            ویرایش
                          </button>
                          <DeleteControl
                            category={child}
                            confirming={confirmDeleteId === child.id}
                            onAsk={() => setConfirmDeleteId(child.id)}
                            onCancel={() => setConfirmDeleteId(null)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-t border-glass-border/70 px-4 py-3 text-xs text-muted">
                    زیردسته‌ای ندارد.
                    <button
                      type="button"
                      onClick={() => setPanel({ mode: "subs", id: parent.id })}
                      className="mr-2 font-medium text-copper hover:underline"
                    >
                      افزودن
                    </button>
                  </p>
                )}
              </section>
            );
          })}

          {orphans.length > 0 ? (
            <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
              <p className="text-xs font-semibold text-amber-900">بدون دسته والد</p>
              <ul className="mt-2 space-y-2">
                {orphans.map((child) => (
                  <li key={child.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{child.nameFa}</span>
                    <button
                      type="button"
                      onClick={() => setPanel({ mode: "edit", id: child.id })}
                      className="text-xs font-medium text-copper hover:underline"
                    >
                      ویرایش
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {panel?.mode === "create" ? (
        <SidePanel
          title="دسته جدید"
          subtitle="دسته سطح اول بسازید یا از همین‌جا زیردسته تعریف کنید."
          onClose={closePanel}
        >
          <form action={upsertCategoryAction} className="flex min-h-full flex-col">
            <CategoryFormFields parents={parents} />
            <div className="mt-6 flex gap-2">
              <SubmitButton
                className="btn-copper flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                pendingLabel="در حال افزودن…"
              >
                ثبت دسته
              </SubmitButton>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-xl border border-glass-border px-4 py-2.5 text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </SidePanel>
      ) : null}

      {panel?.mode === "edit" && editing ? (
        <SidePanel
          title={`ویرایش «${editing.nameFa}»`}
          subtitle={editing.parentId ? "زیردسته" : "دسته سطح اول"}
          onClose={closePanel}
        >
          <form action={upsertCategoryAction} className="flex min-h-full flex-col">
            <CategoryFormFields category={editing} parents={parents} />
            <div className="mt-6 flex gap-2">
              <SubmitButton
                className="btn-copper flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                pendingLabel="در حال ذخیره…"
              >
                ذخیره تغییرات
              </SubmitButton>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-xl border border-glass-border px-4 py-2.5 text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </SidePanel>
      ) : null}

      {panel?.mode === "subs" && bulkParent ? (
        <SidePanel
          title="افزودن زیردسته"
          subtitle={`زیرمجموعهٔ «${bulkParent.nameFa}»`}
          onClose={closePanel}
        >
          <form action={createSubcategoriesBulkAction} className="flex min-h-full flex-col">
            <input type="hidden" name="parentId" value={bulkParent.id} />
            <label className="block text-sm font-medium">
              نام زیردسته‌ها
              <textarea
                name="names"
                required
                autoFocus
                rows={8}
                placeholder={"سیم ارت افشان\nسیم افشان معمولی"}
                className={fieldClass}
              />
              <span className="mt-1.5 block text-xs font-normal leading-6 text-muted">
                هر خط یک زیردسته است. می‌توانید چند تا را یک‌جا اضافه کنید.
              </span>
            </label>
            <div className="mt-6 flex gap-2">
              <SubmitButton
                className="btn-copper flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                pendingLabel="در حال افزودن…"
              >
                <Plus className="size-4" />
                ثبت زیردسته‌ها
              </SubmitButton>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-xl border border-glass-border px-4 py-2.5 text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </SidePanel>
      ) : null}
    </div>
  );
}
