import { notFound } from "next/navigation";
import { prisma, withDbRetry } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [product, categories] = await withDbRetry(() =>
      Promise.all([
        prisma.product.findUnique({
          where: { id },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        }),
        prisma.category.findMany({
          orderBy: { sortOrder: "asc" },
          select: { id: true, nameFa: true, parentId: true },
        }),
      ]),
    );

    if (!product) notFound();

    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">ویرایش محصول</h1>
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            nameFa: product.nameFa,
            slug: product.slug,
            shortDesc: product.shortDesc,
            introduction: product.introduction,
            wireStructure: product.wireStructure,
            techSpecs: product.techSpecs,
            applications: product.applications,
            advantages: product.advantages,
            conductor: product.conductor,
            categoryId: product.categoryId,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            isPublished: product.isPublished,
            isFeatured: product.isFeatured,
            sortOrder: product.sortOrder,
            specs: product.specs,
            imageUrl: product.images[0]?.url ?? "",
          }}
        />
      </div>
    );
  } catch {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">ویرایش محصول</h1>
        <AdminDbNotice />
      </div>
    );
  }
}
