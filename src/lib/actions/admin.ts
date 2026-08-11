"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma, withDbRetry } from "@/lib/prisma";
import { slugifyPersian } from "@/lib/utils";
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

export async function upsertProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nameFa = normalizeCableTitle(String(formData.get("nameFa") ?? "").trim());
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw || slugifyPersian(nameFa) || `product-${Date.now()}`;
  const introduction =
    normalizeCableTitle(String(formData.get("introduction") ?? "")) || null;
  const wireStructure =
    normalizeCableTitle(String(formData.get("wireStructure") ?? "")) || null;
  const techSpecs =
    normalizeCableTitle(String(formData.get("techSpecs") ?? "")) || null;
  const applications =
    normalizeCableTitle(String(formData.get("applications") ?? "")) || null;
  const advantages =
    normalizeCableTitle(String(formData.get("advantages") ?? "")) || null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const isPublished = formData.get("isPublished") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!nameFa) {
    redirect("/admin/products/new?error=name");
  }

  const data = {
    nameFa,
    slug,
    introduction,
    wireStructure,
    techSpecs,
    applications,
    advantages,
    application: applications?.split("\n").find((l) => l.trim())?.trim() ?? null,
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

  const product = await withDbRetry(() =>
    id
      ? prisma.product.update({ where: { id }, data })
      : prisma.product.create({ data }),
  );

  if (imageUrl) {
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
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.popular, "max");
  revalidateTag(CACHE_TAGS.product, "max");
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
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.popular, "max");
  redirect("/admin/products?deleted=1");
}

export async function upsertCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nameFa = String(formData.get("nameFa") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw || slugifyPersian(nameFa) || `cat-${Date.now()}`;
  const description = String(formData.get("description") ?? "") || null;
  const parentId = String(formData.get("parentId") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

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

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.catalog, "max");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
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
