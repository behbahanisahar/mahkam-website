import { Trash2, Plus } from "lucide-react";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { deleteCategoryAction, upsertCategoryAction } from "@/lib/actions/admin";
import { formatNumberFa } from "@/lib/i18n/fa";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";

function loadCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
    include: {
      parent: { select: { id: true, nameFa: true } },
      _count: { select: { products: true, children: true } },
    },
  });
}

export default async function AdminCategoriesPage() {
  const result = await withDbTimeout(loadCategories(), 4_000, null);
  const dbError = result === null;
  const categories = result ?? [];

  const parents = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="brand-display text-2xl font-bold">دسته‌بندی‌ها</h1>
        <p className="mt-1 text-sm text-muted">
          دسته والد (مثل سیم افشان) و در صورت نیاز زیردسته؛ سایزها به‌صورت محصول ثبت می‌شوند.
        </p>
      </div>

      {dbError ? <AdminDbNotice /> : null}

      <form
        action={upsertCategoryAction}
        className="grid gap-3 rounded-2xl border border-glass-border/80 bg-white/70 p-4 shadow-sm sm:grid-cols-2 sm:p-5 lg:grid-cols-5"
      >
        <input
          name="nameFa"
          required
          placeholder="نام دسته (مثلاً سیم افشان)"
          className="rounded-xl border border-glass-border bg-white px-3 py-3 text-sm outline-none ring-accent/30 focus:ring-2 sm:col-span-2 lg:col-span-2"
        />
        <input
          name="slug"
          placeholder="اسلاگ (اختیاری)"
          className="rounded-xl border border-glass-border bg-white px-3 py-3 text-sm outline-none ring-accent/30 focus:ring-2"
          dir="ltr"
        />
        <select
          name="parentId"
          defaultValue=""
          className="rounded-xl border border-glass-border bg-white py-3 pr-3 pl-10 text-sm outline-none"
        >
          <option value="">دسته والد (سطح اول)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              زیردسته برای: {p.nameFa}
            </option>
          ))}
        </select>
        <SubmitButton
          className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          pendingLabel="در حال افزودن…"
        >
          <Plus className="size-4" />
          افزودن
        </SubmitButton>
      </form>

      <div className="space-y-2">
        {!dbError && categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-glass-border px-4 py-10 text-center text-sm text-muted">
            هنوز دسته‌ای ثبت نشده.
          </p>
        ) : null}
        {!dbError
          ? categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border/80 bg-white/70 px-4 py-3.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {c.parent ? (
                      <span className="text-muted">
                        {c.parent.nameFa}
                        <span className="mx-1.5 text-copper">←</span>
                      </span>
                    ) : null}
                    {c.nameFa}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    <span dir="ltr">{c.slug}</span>
                    <span className="mx-2">·</span>
                    {formatNumberFa(c._count.products)} محصول
                    {c._count.children > 0 ? (
                      <>
                        <span className="mx-2">·</span>
                        {formatNumberFa(c._count.children)} زیردسته
                      </>
                    ) : null}
                  </p>
                </div>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <SubmitButton
                    className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                    pendingLabel="حذف…"
                  >
                    <Trash2 className="size-3.5" />
                    حذف
                  </SubmitButton>
                </form>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
