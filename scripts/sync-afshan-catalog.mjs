/**
 * Idempotent upsert of افشان catalog categories + products + images.
 * Safe to re-run. Does not delete unrelated products.
 *
 * Run locally:  node scripts/sync-afshan-catalog.mjs
 * On VPS:       docker exec mahkam-website node scripts/sync-afshan-catalog.mjs
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const catalogPath = path.join(__dirname, "..", "prisma", "data", "afshan-catalog.json");
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Catalog JSON empty");
  }

  const parent = await prisma.category.upsert({
    where: { slug: "sim-afshan" },
    create: {
      nameFa: "سیم افشان",
      slug: "sim-afshan",
      description: "سیم افشان مسی با عایق PVC",
      sortOrder: 10,
      parentId: null,
    },
    // Clear any legacy parent so the mega-menu (parentId: null) can see this root.
    update: {
      nameFa: "سیم افشان",
      description: "سیم افشان مسی با عایق PVC",
      parentId: null,
      sortOrder: 10,
    },
  });

  const earth = await prisma.category.upsert({
    where: { slug: "sim-earth-afshan" },
    create: {
      nameFa: "سیم ارت افشان",
      slug: "sim-earth-afshan",
      description: "سیم افشان ارت با روکش سبز و زرد",
      parentId: parent.id,
      sortOrder: 11,
    },
    update: {
      nameFa: "سیم ارت افشان",
      parentId: parent.id,
      description: "سیم افشان ارت با روکش سبز و زرد",
      sortOrder: 11,
    },
  });

  console.log("categories", {
    root: { slug: parent.slug, parentId: parent.parentId },
    earth: { slug: earth.slug, parentId: earth.parentId },
  });

  let sort = 0;
  for (const p of products) {
    sort += 10;
    const categoryId = p.isEarth ? earth.id : parent.id;
    const imageUrl = p.imagePath || `/images/catalog/${p.slug}.webp`;

    // Word visual titles are cores×section (1×0.75). Clear stale SEO/short
    // overrides that still had flipped sizes (۰.۷۵×۱) from earlier imports.
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        nameFa: p.nameFa,
        slug: p.slug,
        introduction: p.introduction || null,
        wireStructure: p.wireStructure || null,
        techSpecs: p.techSpecs || null,
        applications: p.applications || null,
        advantages: p.advantages || null,
        body: p.introduction || null,
        application: (p.applications || "").split("\n").find((l) => l.trim())?.trim() || null,
        shortDesc: null,
        seoTitle: null,
        seoDescription: null,
        conductor: "مس",
        categoryId,
        isPublished: true,
        isFeatured: sort <= 40 && !p.isEarth,
        sortOrder: sort,
      },
      update: {
        nameFa: p.nameFa,
        introduction: p.introduction || null,
        wireStructure: p.wireStructure || null,
        techSpecs: p.techSpecs || null,
        applications: p.applications || null,
        advantages: p.advantages || null,
        body: p.introduction || null,
        application: (p.applications || "").split("\n").find((l) => l.trim())?.trim() || null,
        shortDesc: null,
        seoTitle: null,
        seoDescription: null,
        conductor: "مس",
        categoryId,
        isPublished: true,
        sortOrder: sort,
      },
    });

    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id },
      orderBy: { sortOrder: "asc" },
    });

    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url: imageUrl, alt: p.nameFa, sortOrder: 0 },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: p.nameFa,
          sortOrder: 0,
        },
      });
    }

    console.log("upsert", product.slug, "→", imageUrl);
  }

  console.log(`Synced ${products.length} افشان products`);

  // Bust Next.js layout/menu cache (empty mega-menu after first boot)
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/revalidate", {
        method: "POST",
        headers: { "x-cron-secret": secret },
      });
      console.log("revalidate", res.status, await res.text());
    } catch (e) {
      console.warn("revalidate skipped:", e instanceof Error ? e.message : e);
    }
  } else {
    console.warn("CRON_SECRET missing — clear cache manually: rm -rf /app/.next/cache && docker compose restart");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
