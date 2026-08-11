import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { deleteProductAction } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";
import { AdminImageDownloadButton } from "@/components/admin/AdminImageDownloadButton";
import { AdminProductSearch } from "@/components/admin/AdminProductSearch";
import { shouldBypassImageOptimizer } from "@/lib/utils";
import { LtrAwareText } from "@/components/ui/LtrAwareText";
import { formatNumberFa } from "@/lib/i18n/fa";
import { toLatinDigits } from "@/lib/products/cable-title";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  status?: string;
}>;

function searchVariants(q: string): string[] {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const latin = toLatinDigits(trimmed);
  const fa = latin.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
  return [...new Set([trimmed, latin, fa].filter(Boolean))];
}

function buildWhere(filters: {
  q: string;
  categoryId: string;
  status: string;
}): Prisma.ProductWhereInput {
  const variants = searchVariants(filters.q);
  const status =
    filters.status === "published"
      ? true
      : filters.status === "draft"
        ? false
        : null;

  return {
    ...(status !== null ? { isPublished: status } : {}),
    ...(filters.categoryId
      ? {
          category: {
            OR: [{ id: filters.categoryId }, { parentId: filters.categoryId }],
          },
        }
      : {}),
    ...(variants.length
      ? {
          OR: variants.flatMap((v) => [
            { nameFa: { contains: v, mode: "insensitive" as const } },
            { slug: { contains: v, mode: "insensitive" as const } },
            { introduction: { contains: v, mode: "insensitive" as const } },
            {
              category: {
                nameFa: { contains: v, mode: "insensitive" as const },
              },
            },
          ]),
        }
      : {}),
  };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const categoryId = (sp.category ?? "").trim();
  const status = (sp.status ?? "").trim();
  const where = buildWhere({ q, categoryId, status });
  const hasFilters = Boolean(q || categoryId || status);

  const result = await withDbTimeout(
    Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
        select: { id: true, nameFa: true, parentId: true },
      }),
      prisma.product.count(),
    ]),
    4_000,
    null,
  );

  const dbError = result === null;
  const products = result?.[0] ?? [];
  const categories = result?.[1] ?? [];
  const totalAll = result?.[2] ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="brand-display text-2xl font-bold">محصولات</h1>
          <p className="mt-1 text-sm text-muted">افزودن، ویرایش و انتشار کاتالوگ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="size-4" />
          محصول جدید
        </Link>
      </div>

      {dbError ? <AdminDbNotice /> : null}

      {!dbError ? (
        <AdminProductSearch
          initialQ={q}
          initialCategoryId={categoryId}
          initialStatus={status}
          categories={categories}
        />
      ) : null}

      {!dbError && hasFilters ? (
        <p className="text-sm text-muted">
          {formatNumberFa(products.length)} نتیجه
          {totalAll > 0 ? (
            <>
              {" "}
              از {formatNumberFa(totalAll)} محصول
            </>
          ) : null}
          {q ? (
            <>
              {" "}
              برای «{q}»
            </>
          ) : null}
        </p>
      ) : null}

      {!dbError && products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-white/50 px-6 py-14 text-center">
          <p className="text-sm text-muted">
            {hasFilters ? "نتیجه‌ای برای این جستجو پیدا نشد." : "هنوز محصولی ثبت نشده."}
          </p>
          {hasFilters ? (
            <Link
              href="/admin/products"
              className="mt-4 inline-flex text-sm font-medium text-copper hover:underline"
            >
              پاک‌سازی فیلترها
            </Link>
          ) : (
            <Link
              href="/admin/products/new"
              className="mt-4 inline-flex text-sm font-medium text-copper hover:underline"
            >
              اولین محصول را بسازید
            </Link>
          )}
        </div>
      ) : null}

      {!dbError && products.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {products.map((p) => {
              const img = p.images[0];
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-glass-border/80 bg-white/70 shadow-sm"
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-accent/15">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={p.nameFa}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={shouldBypassImageOptimizer(img.url)}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate font-semibold">
                          <LtrAwareText text={p.nameFa} />
                        </h2>
                        {p.isPublished ? (
                          <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                            منتشر
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                            پیش‌نویس
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted">{p.category?.nameFa ?? "بدون دسته"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-copper"
                        >
                          <Pencil className="size-3.5" />
                          ویرایش
                        </Link>
                        {img ? (
                          <AdminImageDownloadButton
                            url={img.url}
                            filename={`${p.slug}.webp`}
                            className="border-0 px-0 py-0 text-xs font-medium text-ink hover:bg-transparent hover:underline"
                            label="دانلود تصویر"
                          />
                        ) : null}
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-700"
                            pendingLabel="حذف…"
                          >
                            <Trash2 className="size-3.5" />
                            حذف
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-glass-border/80 bg-white/70 shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="bg-copper/10 text-right">
                <tr>
                  <th className="px-4 py-3 font-medium">محصول</th>
                  <th className="px-4 py-3 font-medium">دسته</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-4 py-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = p.images[0];
                  return (
                    <tr key={p.id} className="border-t border-glass-border/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-accent/15">
                            {img ? (
                              <Image
                                src={img.url}
                                alt={p.nameFa}
                                fill
                                className="object-cover"
                                sizes="44px"
                                unoptimized={shouldBypassImageOptimizer(img.url)}
                              />
                            ) : null}
                          </div>
                          <span className="font-medium">
                            <LtrAwareText text={p.nameFa} />
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category?.nameFa ?? "—"}</td>
                      <td className="px-4 py-3">
                        {p.isPublished ? (
                          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                            منتشر
                          </span>
                        ) : (
                          <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            پیش‌نویس
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-copper hover:underline"
                          >
                            <Pencil className="size-3.5" />
                            ویرایش
                          </Link>
                          {img ? (
                            <AdminImageDownloadButton
                              url={img.url}
                              filename={`${p.slug}.webp`}
                              className="border-0 px-0 py-0 text-xs font-medium text-ink hover:bg-transparent hover:underline"
                              label="دانلود"
                            />
                          ) : null}
                          <form action={deleteProductAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <SubmitButton
                              className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                              pendingLabel="حذف…"
                            >
                              <Trash2 className="size-3.5" />
                              حذف
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
