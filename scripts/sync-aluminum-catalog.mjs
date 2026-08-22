/**
 * Idempotent upsert of کابل آلومینیوم categories + products + images.
 *
 * Run locally:  node scripts/sync-aluminum-catalog.mjs
 * On VPS:       docker exec mahkam-website node scripts/sync-aluminum-catalog.mjs
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const catalogPath = path.join(__dirname, "..", "prisma", "data", "aluminum-catalog.json");
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Aluminum catalog JSON empty");
  }

  const parent = await prisma.category.upsert({
    where: { slug: "cable-aluminum" },
    create: {
      nameFa: "کابل آلومینیوم",
      slug: "cable-aluminum",
      description: "کابل قدرت آلومینیومی فشار ضعیف (PVC / XLPE)",
      sortOrder: 30,
      parentId: null,
    },
    update: {
      nameFa: "کابل آلومینیوم",
      description: "کابل قدرت آلومینیومی فشار ضعیف (PVC / XLPE)",
      parentId: null,
      sortOrder: 30,
    },
  });

  console.log("category", { slug: parent.slug, id: parent.id });

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
        conductor: p.conductor || "آلومینیوم",
        categoryId: parent.id,
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
        conductor: p.conductor || "آلومینیوم",
        categoryId: parent.id,
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

  console.log(`Synced ${products.length} aluminum products`);

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
