/**
 * Idempotent upsert of «کابل مفتول» under سیم مفتولی.
 *
 * Run locally:  node scripts/sync-maftoli-catalog.mjs
 * On VPS:       docker exec mahkam-website node scripts/sync-maftoli-catalog.mjs
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const catalogPath = path.join(__dirname, "..", "prisma", "data", "maftoli-catalog.json");
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Maftoli catalog JSON empty");
  }

  const parent = await prisma.category.upsert({
    where: { slug: "sim-maftoli" },
    create: {
      nameFa: "سیم مفتولی",
      slug: "sim-maftoli",
      description: "سیم و کابل مفتولی مسی برای سیم‌کشی ثابت",
      sortOrder: 2,
      parentId: null,
    },
    update: {
      nameFa: "سیم مفتولی",
      description: "سیم و کابل مفتولی مسی برای سیم‌کشی ثابت",
      parentId: null,
    },
  });

  const existingChild = await prisma.category.findUnique({
    where: { slug: "cable-maftoli" },
  });
  const child = existingChild
    ? await prisma.category.update({
        where: { id: existingChild.id },
        data: {
          nameFa: "کابل مفتول",
          description: "کابل چندرشته مفتولی مسی (کلاس 1 / PVC)",
          parentId: parent.id,
          sortOrder: 21,
        },
      })
    : await prisma.category.create({
        data: {
          slug: "cable-maftoli",
          nameFa: "کابل مفتول",
          description: "کابل چندرشته مفتولی مسی (کلاس 1 / PVC)",
          parentId: parent.id,
          sortOrder: 21,
        },
      });

  console.log("category", { parent: parent.slug, child: child.slug, id: child.id });

  let sort = 0;
  for (const p of products) {
    sort += 10;
    const imageUrl = p.imagePath || `/images/catalog/${p.slug}.webp`;

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
        application:
          (p.applications || "").split("\n").find((l) => l.trim())?.trim() || null,
        shortDesc: null,
        seoTitle: null,
        seoDescription: null,
        conductor: p.conductor || "مس",
        categoryId: child.id,
        isPublished: true,
        isFeatured: sort <= 40,
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
        application:
          (p.applications || "").split("\n").find((l) => l.trim())?.trim() || null,
        shortDesc: null,
        seoTitle: null,
        seoDescription: null,
        conductor: p.conductor || "مس",
        categoryId: child.id,
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

  console.log(`Synced ${products.length} maftoli products`);

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
