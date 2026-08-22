import { prisma, withDbTimeout } from "@/lib/prisma";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";
import {
  CategoryAdminPanel,
  type AdminCategoryRow,
} from "@/components/admin/CategoryAdminPanel";

export const dynamic = "force-dynamic";

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

  const categories: AdminCategoryRow[] = (result ?? []).map((c) => ({
    id: c.id,
    nameFa: c.nameFa,
    slug: c.slug,
    description: c.description,
    parentId: c.parentId,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
    childCount: c._count.children,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="brand-display text-2xl font-bold">دسته‌بندی‌ها</h1>
        <p className="mt-1 text-sm text-muted">
          دسته‌های سطح اول و زیردسته‌ها را از اینجا بسازید و ویرایش کنید.
        </p>
      </div>

      {dbError ? <AdminDbNotice /> : <CategoryAdminPanel categories={categories} />}
    </div>
  );
}
