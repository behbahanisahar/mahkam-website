/**
 * Brand aluminum catalog photos with varied colors/poses (distinct from افشان).
 * Same Mahkam left-rail layout, cooler aluminum accent.
 *
 * Run: node scripts/generate-aluminum-images.mjs
 */
import { mkdir, readFile, writeFile, copyFile, access } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "prisma/data/aluminum-catalog.json");
const outDir = path.join(root, "public/images/catalog");
const thumbDir = path.join(root, "public/images/catalog-thumbs");
const rawDir = path.join(root, "public/images/catalog-raw");
const logoPath = path.join(root, "public/images/mahkam-logo.png");
const assetsDir =
  process.env.MAHKAM_ASSETS_DIR ||
  path.join(
    process.env.HOME || "",
    ".cursor/projects/Users-saharbehbahani-mahkam/assets",
  );

const W = 1200;
const H = 1200;
const RAIL = 168;
const CACHE_BUST = "al3";

/** Cooler aluminum brand rail (afshan uses copper #d4a574). */
const STYLE = {
  rail: "#1a2332",
  accent: "#9aa8b8",
  label: "کابل آلومینیوم",
};

/**
 * Varied studio sources — different jacket colors + poses.
 * Prefer multi-core looking shots for 3× / 4× / 5× SKUs.
 */
const SOURCES_SINGLE = [
  "aluminum-src-grey-coils.png",
  "aluminum-src-navy-infinity.png",
  "aluminum-src-silver-scurve.png",
  "aluminum-src-teal-pretzel.png",
  "aluminum-src-brown-rings.png",
  "aluminum-src-white-ring.png",
  "aluminum-src-orange-figure8.png",
];

const SOURCES_MULTI = [
  "aluminum-src-stripe-cross.png",
  "aluminum-src-orange-figure8.png",
  "aluminum-src-grey-coils.png",
  "aluminum-src-navy-infinity.png",
  "aluminum-src-teal-pretzel.png",
  "aluminum-src-brown-rings.png",
  "aluminum-src-silver-scurve.png",
  "aluminum-src-white-ring.png",
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function isMultiCore(product) {
  const size = String(product.sizeLabel || "");
  return (
    size.includes("+") ||
    size.startsWith("2") ||
    size.startsWith("3") ||
    size.startsWith("4") ||
    size.startsWith("5")
  );
}

function pickSourceName(product) {
  const pool = isMultiCore(product) ? SOURCES_MULTI : SOURCES_SINGLE;
  return pool[hashSlug(product.slug) % pool.length];
}

async function resolveSource(product) {
  const name = pickSourceName(product);
  // Do NOT read rawDir/${slug}.png — that file is also our write target.
  const preferred = [
    path.join(assetsDir, `var-${product.slug}.png`),
    path.join(assetsDir, name),
    path.join(rawDir, "_aluminum-src", name),
    ...SOURCES_SINGLE.flatMap((n) => [
      path.join(assetsDir, n),
      path.join(rawDir, "_aluminum-src", n),
    ]),
  ];
  for (const c of preferred) {
    if (await exists(c)) return c;
  }
  return null;
}

function leftRailSvg(sizeLabel) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${RAIL}" height="${H}" viewBox="0 0 ${RAIL} ${H}">
  <rect width="${RAIL}" height="${H}" fill="${STYLE.rail}"/>
  <rect x="${RAIL - 6}" y="0" width="6" height="${H}" fill="${STYLE.accent}"/>
  <g transform="translate(78, 620) rotate(-90)">
    <text text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800"
          fill="#ffffff" letter-spacing="8">MAHKAM</text>
  </g>
  <text x="84" y="980" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700"
        fill="${STYLE.accent}">مهکام</text>
  <text x="84" y="1040" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600"
        fill="#ffffff" opacity="0.85">${escapeXml(STYLE.label)}</text>
  <text x="84" y="1100" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700"
        fill="#ffffff" direction="ltr">${escapeXml(sizeLabel)}</text>
</svg>`);
}

function cornerBadgeSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64">
  <rect width="220" height="64" rx="14" fill="${STYLE.rail}" opacity="0.92"/>
  <text x="110" y="28" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700"
        fill="${STYLE.accent}">مهکام</text>
  <text x="110" y="50" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800"
        fill="#ffffff" letter-spacing="2">MAHKAM</text>
</svg>`);
}

async function brandOne(product) {
  const src = await resolveSource(product);
  if (!src) throw new Error(`No photo source for ${product.slug}`);

  await mkdir(rawDir, { recursive: true });
  const rawPng = path.join(rawDir, `${product.slug}.png`);
  await sharp(src)
    .resize(W - RAIL, H, { fit: "cover", position: "centre" })
    .png()
    .toFile(rawPng);

  const photo = await sharp(rawPng).toBuffer();

  const logo = await sharp(logoPath)
    .resize({ width: 118, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoW = logoMeta.width || 100;

  const rail = await sharp(leftRailSvg(product.sizeLabel || ""), { density: 120 })
    .resize(RAIL, H)
    .png()
    .toBuffer();

  const composites = [
    { input: photo, top: 0, left: RAIL },
    { input: rail, top: 0, left: 0 },
    {
      input: logo,
      top: 48,
      left: Math.round((RAIL - logoW) / 2),
    },
  ];

  if (hashSlug(product.slug) % 2 === 0) {
    const badge = await sharp(cornerBadgeSvg(), { density: 120 }).png().toBuffer();
    composites.push({ input: badge, top: 36, left: W - 248 });
  }

  const canvas = await sharp({
    create: { width: W, height: H, channels: 3, background: STYLE.rail },
  })
    .png()
    .toBuffer();

  const outFile = path.join(outDir, `${product.slug}.webp`);
  await sharp(canvas)
    .composite(composites)
    .webp({ quality: 85, effort: 4 })
    .toFile(outFile);

  await sharp(outFile)
    .resize(480, 480, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(path.join(thumbDir, `${product.slug}.webp`));

  return path.basename(src);
}

async function main() {
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });

  const allSources = [...new Set([...SOURCES_SINGLE, ...SOURCES_MULTI])];
  await mkdir(path.join(rawDir, "_aluminum-src"), { recursive: true });
  for (const name of allSources) {
    const from = path.join(assetsDir, name);
    if (await exists(from)) {
      await copyFile(from, path.join(rawDir, "_aluminum-src", name));
    }
  }

  for (const product of products) {
    const srcName = await brandOne(product);
    product.imagePath = `/images/catalog/${product.slug}.webp?v=${CACHE_BUST}`;
    console.log("branded", product.slug, product.sizeLabel, "←", srcName);
  }

  await writeFile(catalogPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`Done: ${products.length} varied aluminum images (v=${CACHE_BUST})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
