"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { prisma, withDbRetry } from "@/lib/prisma";
import { sanitizeAdminText, slugifyPersian } from "@/lib/utils";
import { logAppError } from "@/lib/errors/log";
import { AuthError } from "next-auth";
import { CACHE_TAGS } from "@/lib/cache";
import { fetchTgjuDollarHistory } from "@/lib/prices/tgju";
import { toJalaliLabel } from "@/lib/i18n/fa";
import { maybeDeleteUnreferencedLocalUpload } from "@/lib/uploads";
import { normalizeCableTitle } from "@/lib/products/cable-title";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  return session;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      redirect("/admin/login?error=login");
    }
    throw e;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

function productSaveBack(id: string, error: string) {
  return id ? `/admin/products/${id}?error=${error}` : `/admin/products/new?error=${error}`;
}

function clipShort(value: string | null, max: number) {
  if (!value) return null;
  const first = value.split("\n").find((l) => l.trim())?.trim() ?? value.trim();
  if (first.length <= max) return first;
  return `${first.slice(0, max - 1).trim()}…`;
}

async function uniqueProductSlug(base: string, excludeId?: string) {
  const root = base || `product-${Date.now()}`;
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const found = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!found || (excludeId && found.id === excludeId)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export async function upsertProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nameFa = normalizeCableTitle(
    sanitizeAdminText(String(formData.get("nameFa") ?? "")).trim(),
  );
  const slugRaw = sanitizeAdminText(String(formData.get("slug") ?? "")).trim();
  const introduction =
    normalizeCableTitle(sanitizeAdminText(String(formData.get("introduction") ?? ""))) ||
    null;
  const wireStructure =
    normalizeCableTitle(sanitizeAdminText(String(formData.get("wireStructure") ?? ""))) ||
    null;
  const techSpecs =
    normalizeCableTitle(sanitizeAdminText(String(formData.get("techSpecs") ?? ""))) || null;
  const applications =
    normalizeCableTitle(sanitizeAdminText(String(formData.get("applications") ?? ""))) ||
    null;
  const advantages =
    normalizeCableTitle(sanitizeAdminText(String(formData.get("advantages") ?? ""))) || null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const isPublished = formData.get("isPublished") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const imageUrl = sanitizeAdminText(String(formData.get("imageUrl") ?? "")).trim();

  if (!nameFa) {
    redirect("/admin/products/new?error=name");
  }

  const slugBase = slugRaw || slugifyPersian(nameFa) || `product-${Date.now()}`;
  let slug = slugBase;

  if (slugRaw) {
    const taken = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (taken && taken.id !== id) {
      redirect(productSaveBack(id, "slug"));
    }
  } else {
    slug = await uniqueProductSlug(slugBase, id || undefined);
  }

  let product;
  try {
    const data = {
      nameFa,
      slug,
      introduction,
      wireStructure,
      techSpecs,
      applications,
      advantages,
      application: clipShort(applications, 240),
      body: introduction,
      // Drop stale SEO overrides that still had flipped sizes (۰.۷۵×۱)
      seoTitle: null as string | null,
      seoDescription: null as string | null,
      shortDesc: null as string | null,
      categoryId,
      isPublished,
      isFeatured,
      sortOrder,
    };

    product = await withDbRetry(() =>
      id
        ? prisma.product.update({ where: { id }, data })
        : prisma.product.create({ data }),
    );
  } catch (error) {
    const prismaCode =
      error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;
    await logAppError({
      source: "server",
      statusCode: 500,
      message: error instanceof Error ? error.message : "product save failed",
      path: id ? `/admin/products/${id}` : "/admin/products/new",
      stack: error instanceof Error ? error.stack : null,
      meta: { prismaCode, nameFa: nameFa.slice(0, 80), slug },
    });
    if (prismaCode === "P2002") redirect(productSaveBack(id, "slug"));
    if (prismaCode === "P2003") redirect(productSaveBack(id, "category"));
    redirect(productSaveBack(id, "save"));
  }

  if (!product) {
    redirect(productSaveBack(id, "save"));
  }

  if (imageUrl) {
    try {
      const previous = await prisma.productImage.findMany({
        where: { productId: product.id },
        select: { url: true },
      });

      await withDbRetry(async () => {
        await prisma.productImage.deleteMany({ where: { productId: product.id } });
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            alt: nameFa,
            sortOrder: 0,
          },
        });
      });

      for (const old of previous) {
        if (old.url !== imageUrl) {
          await maybeDeleteUnreferencedLocalUpload(old.url).catch(() => false);
        }
      }
    } catch (error) {
      await logAppError({
        source: "server",
        statusCode: 500,
        message: error instanceof Error ? error.message : "product image save failed",
        path: `/admin/products/${product.id}`,
        stack: error instanceof Error ? error.stack : null,
      });
      redirect(`/admin/products/${product.id}?error=save`);
    }
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/sitemap.xml");
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.popular, "max");
  revalidateTag(CACHE_TAGS.product, "max");
  revalidateTag(`product:${slug}`, "max");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { url: true },
    });
    await prisma.product.delete({ where: { id } });
    for (const img of images) {
      await maybeDeleteUnreferencedLocalUpload(img.url).catch(() => false);
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.popular, "max");
  revalidateTag(CACHE_TAGS.product, "max");
  redirect("/admin/products?deleted=1");
}

export async function upsertCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nameFa = String(formData.get("nameFa") ?? "").trim();
  if (!nameFa) redirect("/admin/categories?error=1");

  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw || slugifyPersian(nameFa) || `cat-${Date.now()}`;
  const description = String(formData.get("description") ?? "").trim() || null;
  let parentId = String(formData.get("parentId") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  // Only roots can be parents (one level of subcategories)
  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { id: true, parentId: true },
    });
    if (!parent || parent.parentId) {
      parentId = null;
    }
  }

  // Never parent to self
  if (id && parentId === id) parentId = null;

  // If editing a root that has children, keep it as root
  if (id && parentId) {
    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) parentId = null;
  }

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: { nameFa, slug, description, parentId, sortOrder },
      });
    } else {
      await prisma.category.create({
        data: { nameFa, slug, description, parentId, sortOrder },
      });
    }
  } catch {
    redirect("/admin/categories?error=1");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.catalog, "max");
  redirect("/admin/categories?saved=1");
}

/** Create several subcategories under one parent (one name per line). */
export async function createSubcategoriesBulkAction(formData: FormData) {
  await requireAdmin();
  const parentId = String(formData.get("parentId") ?? "").trim();
  const raw = String(formData.get("names") ?? "");
  const names = raw
    .split(/\n|،|,/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (!parentId || names.length === 0) {
    redirect("/admin/categories?error=1");
  }

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });
  if (!parent || parent.parentId) {
    redirect("/admin/categories?error=1");
  }

  const existing = await prisma.category.findMany({
    where: { parentId },
    select: { sortOrder: true },
    orderBy: { sortOrder: "desc" },
    take: 1,
  });
  let sortOrder = (existing[0]?.sortOrder ?? 0) + 1;

  for (const nameFa of names) {
    const baseSlug = slugifyPersian(nameFa) || `cat-${Date.now()}`;
    let slug = baseSlug;
    let n = 2;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }
    await prisma.category.create({
      data: { nameFa, slug, parentId, sortOrder },
    });
    sortOrder += 1;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.catalog, "max");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Move children to root before delete to avoid FK issues if any
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await prisma.category.delete({ where: { id } });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.catalog, "max");
  redirect("/admin/categories?deleted=1");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const telegramUrl = String(formData.get("telegramUrl") ?? "").trim();
  const phones = String(formData.get("phones") ?? "")
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const address = String(formData.get("address") ?? "") || null;
  const mapLatRaw = String(formData.get("mapLat") ?? "").trim().replace(",", ".");
  const mapLngRaw = String(formData.get("mapLng") ?? "").trim().replace(",", ".");
  const mapLatParsed = mapLatRaw ? Number(mapLatRaw) : null;
  const mapLngParsed = mapLngRaw ? Number(mapLngRaw) : null;
  const mapLat =
    mapLatParsed != null && Number.isFinite(mapLatParsed) && mapLatParsed >= -90 && mapLatParsed <= 90
      ? mapLatParsed
      : null;
  const mapLng =
    mapLngParsed != null && Number.isFinite(mapLngParsed) && mapLngParsed >= -180 && mapLngParsed <= 180
      ? mapLngParsed
      : null;
  const companyBlurb = String(formData.get("companyBlurb") ?? "") || null;
  const aboutHtml = String(formData.get("aboutHtml") ?? "") || null;
  const contactHtml = String(formData.get("contactHtml") ?? "") || null;

  try {
    await withDbRetry(() =>
      prisma.siteSetting.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          telegramUrl,
          phones,
          address,
          mapLat,
          mapLng,
          companyBlurb,
          aboutHtml,
          contactHtml,
        },
        update: {
          telegramUrl,
          phones,
          address,
          mapLat,
          mapLng,
          companyBlurb,
          aboutHtml,
          contactHtml,
        },
      }),
    );
  } catch {
    redirect("/admin/settings?error=db");
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  revalidateTag(CACHE_TAGS.settings, "max");
  redirect("/admin/settings?saved=1");
}

export async function manualDollarAction(formData: FormData) {
  await requireAdmin();
  const dateStr = String(formData.get("date") ?? ""); // YYYY-MM-DD
  const dateJalali = String(formData.get("dateJalali") ?? "").trim();
  const close = Number(String(formData.get("close") ?? "").replace(/,/g, ""));

  if (!dateStr || !dateJalali || !Number.isFinite(close)) {
    redirect("/admin/prices?error=1");
  }

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  try {
    await withDbRetry(() =>
      prisma.dollarDaily.upsert({
        where: { date },
        create: {
          date,
          dateJalali,
          close,
          source: "manual",
        },
        update: {
          dateJalali,
          close,
          source: "manual",
        },
      }),
    );
  } catch {
    redirect("/admin/prices?error=db");
  }

  revalidatePath("/prices");
  revalidatePath("/admin/prices");
  revalidateTag(CACHE_TAGS.snapshots, "max");
  redirect("/admin/prices?saved=1");
}

export async function syncTgjuDollarAction() {
  await requireAdmin();

  const rows = await fetchTgjuDollarHistory(0, 40);
  if (rows.length === 0) redirect("/admin/prices?error=sync");

  let upserted = 0;
  try {
    for (const row of rows) {
      const jalali = row.dateJalali || toJalaliLabel(row.date);
      await prisma.dollarDaily.upsert({
        where: { date: row.date },
        create: {
          date: row.date,
          dateJalali: jalali,
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
          source: "tgju",
        },
        update: {
          dateJalali: jalali,
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
          source: "tgju",
        },
      });
      upserted += 1;
    }
  } catch {
    redirect("/admin/prices?error=db");
  }

  revalidatePath("/prices");
  revalidatePath("/admin/prices");
  revalidateTag(CACHE_TAGS.snapshots, "max");
  redirect(`/admin/prices?saved=1&synced=${upserted}`);
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) redirect("/admin/settings?error=password");
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await withDbRetry(() =>
      prisma.user.update({
        where: { id: session.user!.id },
        data: { passwordHash },
      }),
    );
  } catch {
    redirect("/admin/settings?error=db");
  }
  redirect("/admin/settings?saved=1");
}

export async function resolveAppErrorAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.appErrorLog.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    });
  }
  revalidatePath("/admin/errors");
  redirect("/admin/errors?saved=1");
}

export async function resolveAllAppErrorsAction() {
  await requireAdmin();
  await prisma.appErrorLog.updateMany({
    where: { resolved: false },
    data: { resolved: true, resolvedAt: new Date() },
  });
  revalidatePath("/admin/errors");
  redirect("/admin/errors?saved=1");
}

export async function deleteResolvedAppErrorsAction() {
  await requireAdmin();
  await prisma.appErrorLog.deleteMany({ where: { resolved: true } });
  revalidatePath("/admin/errors");
  redirect("/admin/errors?deleted=1");
}
