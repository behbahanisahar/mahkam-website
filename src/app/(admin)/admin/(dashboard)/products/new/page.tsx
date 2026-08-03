import { prisma, withDbRetry } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";

export default async function NewProductPage() {
  let categories: { id: string; nameFa: string; parentId: string | null }[] = [];
  let dbError = false;
  try {
    categories = await withDbRetry(() =>
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameFa: true, parentId: true },
      }),
    );
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">محصول جدید</h1>
      {dbError ? <AdminDbNotice /> : <ProductForm categories={categories} />}
    </div>
  );
}
