/**
 * Brand varied catalog photos with real Mahkam website logo + MAHKAM text.
 * Left-edge brand rail (copyright) so product compositions stay visible.
 *
 * Prefers assets/var-{slug}.png (highly varied compositions).
 * Run: node scripts/brand-catalog-images.mjs
 */
import { mkdir, readFile, access, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "prisma/data/afshan-catalog.json");
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
const CACHE_BUST = "var2";
const RAIL = 168; // left brand rail width

const STYLES = {
  afshan: {
    rail: "#1c1917",
    accent: "#d4a574",
    label: "سیم افشان",
  },
  earth: {
    rail: "#102218",
    accent: "#f0d060",
    label: "سیم افشان ارت",
  },
};

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

async function resolveSource(slug) {
  for (const c of [
    path.join(assetsDir, `var-${slug}.png`),
    path.join(rawDir, `${slug}.png`),
    path.join(assetsDir, `gen-${slug}.png`),
    path.join(assetsDir, `ai-${slug}.png`),
    path.join(outDir, `${slug}.webp`),
  ]) {
    if (await exists(c)) return c;
  }
  return null;
}

/** Left-edge copyright rail: logo + مهکام + MAHKAM + size */
function leftRailSvg(style, sizeLabel) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${RAIL}" height="${H}" viewBox="0 0 ${RAIL} ${H}">
  <rect width="${RAIL}" height="${H}" fill="${style.rail}"/>
  <rect x="${RAIL - 6}" y="0" width="6" height="${H}" fill="${style.accent}"/>

  <!-- vertical MAHKAM -->
  <g transform="translate(78, 620) rotate(-90)">
    <text text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800"
          fill="#ffffff" letter-spacing="8">MAHKAM</text>
  </g>

  <text x="84" y="980" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700"
        fill="${style.accent}">مهکام</text>

  <text x="84" y="1040" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600"
        fill="#ffffff" opacity="0.85">${escapeXml(style.label)}</text>

  <text x="84" y="1100" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700"
        fill="#ffffff" direction="ltr">${escapeXml(sizeLabel)}</text>
</svg>`);
}

/** Small corner badge with MAHKAM for variety (some SKUs) */
function cornerBadgeSvg(style) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64">
  <rect width="220" height="64" rx="14" fill="${style.rail}" opacity="0.92"/>
  <text x="110" y="28" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700"
        fill="${style.accent}">مهکام</text>
  <text x="110" y="50" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800"
        fill="#ffffff" letter-spacing="2">MAHKAM</text>
</svg>`);
}

async function brandOne(product) {
  const style = product.isEarth ? STYLES.earth : STYLES.afshan;
  const src = await resolveSource(product.slug);
  if (!src) throw new Error(`No source for ${product.slug}`);

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
  const logoH = logoMeta.height || 100;

  const rail = await sharp(leftRailSvg(style, product.sizeLabel || ""), {
    density: 120,
  })
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

  // Alternate: also stamp a small MAHKAM badge on the photo (right/top) for half of SKUs
  if (hashSlug(product.slug) % 2 === 0) {
    const badge = await sharp(cornerBadgeSvg(style), { density: 120 })
      .png()
      .toBuffer();
    composites.push({ input: badge, top: 36, left: W - 248 });
  }

  const canvas = await sharp({
    create: { width: W, height: H, channels: 3, background: style.rail },
  })
    .png()
    .toBuffer();

  await sharp(canvas)
    .composite(composites)
    .webp({ quality: 85, effort: 4 })
    .toFile(path.join(outDir, `${product.slug}.webp`));

  await sharp(path.join(outDir, `${product.slug}.webp`))
    .resize(480, 480, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(path.join(thumbDir, `${product.slug}.webp`));
}

async function main() {
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });

  for (const product of products) {
    await brandOne(product);
    product.imagePath = `/images/catalog/${product.slug}.webp?v=${CACHE_BUST}`;
    console.log("branded", product.slug, product.isEarth ? "[ارت]" : "[افشان]");
  }

  await writeFile(catalogPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`Done: ${products.length} varied Mahkam-branded images (v=${CACHE_BUST})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
