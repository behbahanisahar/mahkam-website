/**
 * Upsert «کابل های افشان قابل انعطاف» + «فیلردار» under سیم افشان.
 * Reuses production categories/products (Persian slugs, Word-order sizes)
 * so photos attach to the SKUs already on the live site.
 *
 * Run: node scripts/sync-flex-catalog.mjs
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function catalogKey(p) {
  const n = p.neutral ? `+${p.neutral}` : "";
  return `${p.cores}x${p.section}${n}`;
}

/** Parse size from live titles like `35×5` (section×cores) or `95+185×3`. */
function parseWordNameSize(name) {
  const s = String(name || "")
    .replace(/\s/g, "")
    .replace(/[xX]/g, "×");
  let m = s.match(/(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)×(\d+)/);
  if (m) return `${m[3]}x${m[2]}+${m[1]}`;
  m = s.match(/(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)/);
  if (m) return `${m[1]}x${m[2]}+${m[3]}`;
  m = s.match(/(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = m[1];
  const b = m[2];
  if (["2", "3", "4", "5"].includes(b)) return `${b}x${a}`;
  return `${a}x${b}`;
}

async function upsertImage(productId, url, alt) {
  const existing = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
  if (existing) {
    await prisma.productImage.update({
      where: { id: existing.id },
      data: { url, alt, sortOrder: 0 },
    });
  } else {
    await prisma.productImage.create({
      data: { productId, url, alt, sortOrder: 0 },
    });
  }
}

async function findOrCreateChild(parentId, { preferredSlug, altSlugs, nameFa, description, sortOrder }) {
  for (const slug of [preferredSlug, ...altSlugs]) {
    const found = await prisma.category.findUnique({ where: { slug } });
    if (found) {
      return prisma.category.update({
        where: { id: found.id },
        data: { nameFa, description, parentId, sortOrder },
      });
    }
  }
  const byName = await prisma.category.findFirst({ where: { nameFa, parentId } });
  if (byName) {
    return prisma.category.update({
      where: { id: byName.id },
      data: { description, parentId, sortOrder },
    });
  }
  return prisma.category.create({
    data: { slug: preferredSlug, nameFa, description, parentId, sortOrder },
  });
}

function productFields(p, categoryId, sort, featuredUntil) {
  return {
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
    conductor: "مس",
    categoryId,
    isPublished: true,
    isFeatured: sort <= featuredUntil,
    sortOrder: sort,
  };
}

async function upsertProducts(products, categoryId, featuredUntil, pool, usedIds) {
  let sort = 0;
  const aliases = JSON.parse(
    await readFile(path.join(__dirname, "..", "prisma/data/prod-flex-aliases.json"), "utf8"),
  );
  const latinToProd = new Map(aliases.map((a) => [a.latinSlug, a.prodSlug]));

  for (const p of products) {
    sort += 10;
    const imageUrl = p.imagePath || `/images/catalog/${p.slug}.webp`;
    const key = catalogKey(p);
    const filler = Boolean(p.isFiller);
    const prodSlug = latinToProd.get(p.slug);
    const match = pool.find((row) => {
      if (usedIds.has(row.id)) return false;
      if (row.slug === p.slug) return true;
      if (prodSlug && row.slug === prodSlug) return true;
      const rowFiller =
        (row.nameFa || "").includes("فیلردار") || (row.slug || "").includes("filler");
      if (rowFiller !== filler) return false;
      return parseWordNameSize(row.nameFa) === key;
    });
    const data = { ...productFields(p, categoryId, sort, featuredUntil) };
    if (match && match.slug !== p.slug) {
      const taken = await prisma.product.findUnique({
        where: { slug: p.slug },
        select: { id: true },
      });
      if (!taken) data.slug = p.slug;
    }

    let product;
    if (match) {
      product = await prisma.product.update({
        where: { id: match.id },
        data,
      });
      usedIds.add(match.id);
      console.log("update", match.slug, "←", p.slug, "→", imageUrl);
    } else {
      product = await prisma.product.upsert({
        where: { slug: p.slug },
        create: { ...data, slug: p.slug },
        update: data,
      });
      usedIds.add(product.id);
      console.log("upsert", product.slug, "→", imageUrl);
    }
    await upsertImage(product.id, imageUrl, p.nameFa);
  }
}

async function main() {
  const flex = JSON.parse(
    await readFile(path.join(__dirname, "..", "prisma/data/flex-catalog.json"), "utf8"),
  );
  const filler = JSON.parse(
    await readFile(
      path.join(__dirname, "..", "prisma/data/flex-filler-catalog.json"),
      "utf8",
    ),
  );

  const parent = await prisma.category.upsert({
    where: { slug: "sim-afshan" },
    create: {
      nameFa: "سیم افشان",
      slug: "sim-afshan",
      description: "سیم افشان مسی با عایق PVC",
      sortOrder: 10,
      parentId: null,
    },
    update: { parentId: null, sortOrder: 10 },
  });

  const flexCat = await findOrCreateChild(parent.id, {
    preferredSlug: "cable-flex",
    altSlugs: ["کابل-های-افشان-قابل-انعطاف"],
    nameFa: "کابل های افشان قابل انعطاف",
    description: "کابل چندرشته افشان مسی قابل انعطاف (PVC)",
    sortOrder: 12,
  });

  const fillerCat = await findOrCreateChild(parent.id, {
    preferredSlug: "cable-flex-filler",
    altSlugs: ["کابل-افشان-قابل-انعطاف-فیلردار"],
    nameFa: "کابل افشان قابل انعطاف فیلردار",
    description: "کابل افشان فیلردار چندرشته برای قدرت فشار ضعیف",
    sortOrder: 13,
  });

  console.log("categories", {
    parent: parent.slug,
    flex: flexCat.slug,
    filler: fillerCat.slug,
  });

  const pool = await prisma.product.findMany({
    where: {
      OR: [
        { nameFa: { contains: "قابل انعطاف" } },
        { slug: { startsWith: "cable-flex" } },
        { categoryId: { in: [flexCat.id, fillerCat.id] } },
      ],
    },
    select: { id: true, slug: true, nameFa: true },
  });
  const usedIds = new Set();

  await upsertProducts(flex, flexCat.id, 40, pool, usedIds);
  await upsertProducts(filler, fillerCat.id, 40, pool, usedIds);
  console.log(`Synced ${flex.length} flex + ${filler.length} filler`);

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
