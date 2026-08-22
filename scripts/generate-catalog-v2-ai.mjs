/**
 * Build AI photo prompts for v2 catalog (natural printed text — no SVG overlay).
 * Agent generates assets/catalog-v2/{slug}.png then run:
 *   node scripts/generate-catalog-v2-ai.mjs --import
 */
import { access, copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const queuePath = path.join(root, "scripts/catalog-v2-queue.json");
const assetDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-saharbehbahani-mahkam/assets/catalog-v2",
);
const assetsDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-saharbehbahani-mahkam/assets",
);
const outDir = path.join(root, "public/images/catalog");
const thumbDir = path.join(root, "public/images/catalog-thumbs");
const CACHE = "card15";
const W = 1600;
const THUMB = 480;

const CATALOGS = [
  { file: "prisma/data/afshan-catalog.json", kind: "afshan" },
  { file: "prisma/data/aluminum-catalog.json", kind: "aluminum" },
  { file: "prisma/data/flex-catalog.json", kind: "flex" },
  { file: "prisma/data/flex-filler-catalog.json", kind: "filler" },
  { file: "prisma/data/maftoli-catalog.json", kind: "maftoli" },
];

const EXTRA = [
  { slug: "sim-maftoli-1x2-5", sizeLabel: "1×2.5", kind: "maftoli", voltage: "450/750 V" },
  { slug: "cable-power-1x95-cu", sizeLabel: "1×95", kind: "power-cu", voltage: "0.6/1 kV" },
  { slug: "cable-control-12x1-5", sizeLabel: "12×1.5", kind: "control", voltage: "300/500 V" },
];

function productBlob(p) {
  return [p.wireStructure, p.techSpecs, p.introduction, p.applications, p.advantages]
    .filter(Boolean)
    .join("\n");
}

function parseSize(sizeLabel) {
  const raw = String(sizeLabel || "").replace(/[×xX]/g, "x").replace(/\s/g, "");
  const m = raw.match(/^(\d+)x([\d.]+)(?:\+([\d.]+))?$/i);
  if (!m) return { cores: 1, section: "?", neutral: null };
  return { cores: Number(m[1]), section: m[2], neutral: m[3] ?? null };
}

function voltageFor(kind, product) {
  if (product?.voltage) return product.voltage;
  if (kind === "aluminum" || kind === "power-cu" || kind === "filler") return "0.6/1 kV";
  if (kind === "control" || kind === "flex") return "300/500 V";
  if (kind === "maftoli") {
    const s = parseSize(product?.sizeLabel);
    const mm = Number(s.section);
    if (s.neutral != null || (s.cores >= 3 && mm >= 35) || (s.cores === 1 && mm >= 50)) return "0.6/1 kV";
    if (s.cores === 1) return "450/750 V";
    return "300/500 V";
  }
  return "450/750 V";
}

function visualDesc(product, kind) {
  const blob = productBlob(product);
  const size = parseSize(product.sizeLabel);
  const mm = Number(size.section);
  const earth =
    Boolean(product.isEarth) || /سبز و زرد|Green-Yellow/i.test(blob);

  if (earth) {
    return mm >= 16
      ? "thick green-yellow striped earth wire, large copper strands at cut end"
      : "green-yellow striped earth wire, copper strands at cut end";
  }
  if (kind === "maftoli") {
    return "red PVC solid-core wire, solid copper conductor visible at cut end";
  }
  if (kind === "aluminum") {
    if (size.cores <= 1) return "black power cable, SILVER aluminum strands at cut end";
    if (size.cores === 2) return "black 2-core cable, silver aluminum cores brown blue insulation at cut end";
    if (size.neutral) return "black 3-core+neutral cable, silver aluminum cores at cut end";
    if (size.cores === 4) return "black 4-core cable, silver aluminum cores at cut end";
    return "black 5-core cable, silver aluminum cores at cut end";
  }
  if (kind === "filler") {
    if (size.neutral) return "black filler power cable, white filler visible, silver/copper cores at cut end";
    if (size.cores === 4) return "black 4-core filler cable, white filler between cores at cut end";
    return "black 3-core filler cable, white filler material visible at cut end, brown blue black cores";
  }
  if (kind === "flex" || (kind === "maftoli" && size.cores > 1)) {
    if (size.neutral) return "black flexible cable with neutral, brown black grey blue cores copper at cut end";
    if (size.cores === 2) return "black 2-core flexible cable, brown and blue cores copper strands at cut end";
    if (size.cores === 3) return "black 3-core flexible cable, brown black grey cores at cut end";
    if (size.cores === 4) return "black 4-core flexible cable, brown black grey blue cores at cut end";
    if (size.cores >= 5) return "black 5-core flexible cable, multiple colored cores at cut end";
  }
  if (kind === "power-cu") return "very thick black single-core copper power cable, heavy copper at cut end";
  if (kind === "control") return "black control cable, many thin cores visible at cut end";

  if (/آبی/.test(blob)) return "blue single-core wire, copper strands at cut end";
  if (/قرمز/.test(blob)) return "red single-core wire, copper strands at cut end";
  if (/قهوه/.test(blob)) return "brown single-core wire, copper strands at cut end";
  if (mm <= 0.75) return "brown single-core wire, copper at cut end";
  if (mm <= 1) return "black single-core wire, copper strands at cut end";
  if (mm <= 1.5) return "blue single-core wire, copper at cut end";
  if (mm <= 6) return "red single-core wire, copper at cut end";
  return "thick black single-core wire, large copper strands at cut end";
}

export function promptFor(product, kind) {
  const spec = `${product.sizeLabel} mm² ${voltageFor(kind, product)}`;
  const vis = visualDesc(product, kind);
  return (
    `Professional product catalog photo, square 1:1. Warm light beige-gray textured studio floor (NOT flat cold gray). ` +
    `${vis}. Neat round coil, cable cut end pointing toward camera. ` +
    `Small white paper sleeve wrapped on coil side with naturally PRINTED black ink text (not digital overlay): ` +
    `"MAHKAM" bold, "مهکام", "${spec}". ` +
    `Same specs naturally printed in light gray along cable jacket: "MAHKAM مهکام ${spec}". ` +
    `Photorealistic, soft studio lighting, no watermark, no corner badges.`
  );
}

async function buildQueue() {
  const queue = [];
  for (const { file, kind } of CATALOGS) {
    const products = JSON.parse(await readFile(path.join(root, file), "utf8"));
    for (const p of products) queue.push({ slug: p.slug, kind, sizeLabel: p.sizeLabel, prompt: promptFor(p, kind) });
  }
  for (const p of EXTRA) queue.push({ slug: p.slug, kind: p.kind, sizeLabel: p.sizeLabel, prompt: promptFor(p, p.kind) });
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  console.log(`✓ queue ${queue.length} → ${queuePath}`);
  return queue;
}

async function importAssets() {
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  await mkdir(assetDir, { recursive: true });

  async function findSrc(slug) {
    for (const p of [
      path.join(assetDir, `${slug}.png`),
      path.join(assetsDir, `catv2-${slug}.png`),
      path.join(assetsDir, `${slug}.png`),
    ]) {
      try {
        await access(p);
        return p;
      } catch {
        /* try next */
      }
    }
    return null;
  }

  let ok = 0;
  for (const { file, kind } of CATALOGS) {
    const products = JSON.parse(await readFile(path.join(root, file), "utf8"));
    for (const p of products) {
      const src = await findSrc(p.slug);
      if (!src) {
        console.warn(`  missing ${p.slug}`);
        continue;
      }
      await sharp(src).resize(W, W, { fit: "cover" }).webp({ quality: 92 }).toFile(path.join(outDir, `${p.slug}.webp`));
      await sharp(src).resize(THUMB, THUMB, { fit: "cover" }).webp({ quality: 86 }).toFile(path.join(thumbDir, `${p.slug}.webp`));
      p.imagePath = `/images/catalog/${p.slug}.webp?v=${CACHE}`;
      ok++;
    }
    await writeFile(path.join(root, file), `${JSON.stringify(products, null, 2)}\n`, "utf8");
  }
  for (const p of EXTRA) {
    const src = await findSrc(p.slug);
    if (!src) continue;
    await sharp(src).resize(W, W, { fit: "cover" }).webp({ quality: 92 }).toFile(path.join(outDir, `${p.slug}.webp`));
    await sharp(src).resize(THUMB, THUMB, { fit: "cover" }).webp({ quality: 86 }).toFile(path.join(thumbDir, `${p.slug}.webp`));
    ok++;
  }
  const aliases = JSON.parse(
    await readFile(path.join(root, "prisma/data/prod-flex-aliases.json"), "utf8"),
  );
  for (const a of aliases) {
    a.imagePath = `/images/catalog/${a.latinSlug}.webp?v=${CACHE}`;
    const src = path.join(outDir, `${a.latinSlug}.webp`);
    try {
      await copyFile(src, path.join(outDir, `${a.prodSlug}.webp`));
      await copyFile(path.join(thumbDir, `${a.latinSlug}.webp`), path.join(thumbDir, `${a.prodSlug}.webp`));
    } catch {
      /* latin slug may be missing if batch incomplete */
    }
  }
  await writeFile(
    path.join(root, "prisma/data/prod-flex-aliases.json"),
    `${JSON.stringify(aliases, null, 2)}\n`,
    "utf8",
  );
  console.log(`✓ imported ${ok} photos v=${CACHE}`);
}

const arg = process.argv[2];
if (arg === "--import") importAssets().catch(console.error);
else buildQueue().catch(console.error);
