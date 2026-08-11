/**
 * Burn Mahkam logo + مهکام / MAHKAM text into catalog images (copyright).
 * Per-category color/style chrome; slight unique crop per SKU.
 *
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
const logoPath = path.join(root, "public/images/mahkam-logo.png");
const assetsDir =
  process.env.MAHKAM_ASSETS_DIR ||
  path.join(
    process.env.HOME || "",
    ".cursor/projects/Users-saharbehbahani-mahkam/assets",
  );

const W = 1200;
const H = 1200;
const CACHE_BUST = "mahkam5";

/** Category visual systems — same layout, different color language */
const STYLES = {
  afshan: {
    wash: "#f6efe6",
    stripe: "#b87333",
    stripeSoft: "#e2c49a",
    badge: "#1c1917",
    accent: "#d4a574",
    label: "سیم افشان",
    modulate: { brightness: 1.02, saturation: 1.06, hue: 6 },
  },
  earth: {
    wash: "#eef5f0",
    stripe: "#2f9e44",
    stripeSoft: "#a8d5b0",
    badge: "#102218",
    accent: "#f0d060",
    label: "سیم افشان ارت",
    modulate: { brightness: 1.03, saturation: 1.1, hue: -10 },
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
    path.join(assetsDir, `ai-${slug}.png`),
    path.join(outDir, `${slug}.webp`),
    path.join(outDir, `${slug}.png`),
  ]) {
    if (await exists(c)) return c;
  }
  return null;
}

function brandOverlaySvg(style, sizeLabel) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${style.wash}" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="${style.wash}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="botFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${style.badge}" stop-opacity="0"/>
      <stop offset="55%" stop-color="${style.badge}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${style.badge}" stop-opacity="0.88"/>
    </linearGradient>
  </defs>

  <!-- category color rails -->
  <rect x="0" y="0" width="14" height="${H}" fill="${style.stripe}"/>
  <rect x="${W - 14}" y="0" width="14" height="${H}" fill="${style.stripeSoft}"/>

  <rect x="0" y="0" width="${W}" height="150" fill="url(#topFade)"/>
  <rect x="0" y="${H - 220}" width="${W}" height="220" fill="url(#botFade)"/>

  <!-- copyright brand bar -->
  <rect x="48" y="${H - 158}" width="${W - 96}" height="110" rx="22" fill="${style.badge}" opacity="0.96"/>
  <rect x="48" y="${H - 158}" width="10" height="110" rx="4" fill="${style.stripe}"/>

  <text x="88" y="${H - 112}" text-anchor="start"
        font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700"
        fill="${style.accent}">مهکام</text>
  <text x="88" y="${H - 76}" text-anchor="start"
        font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700"
        fill="#ffffff" letter-spacing="2">MAHKAM</text>

  <text x="${W - 88}" y="${H - 112}" text-anchor="end"
        font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600"
        fill="${style.accent}">${escapeXml(style.label)}</text>
  <text x="${W - 88}" y="${H - 74}" text-anchor="end"
        font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700"
        fill="#ffffff" direction="ltr">${escapeXml(sizeLabel)}</text>
</svg>`);
}

async function brandOne(product) {
  const style = product.isEarth ? STYLES.earth : STYLES.afshan;
  const src = await resolveSource(product.slug);
  if (!src) throw new Error(`No source image for ${product.slug}`);

  const seed = hashSlug(product.slug);
  const positions = [
    "centre",
    "north",
    "south",
    "east",
    "west",
    "northeast",
    "northwest",
    "southeast",
    "southwest",
  ];
  const position = positions[seed % positions.length];

  const photo = await sharp(src)
    .rotate()
    .resize(W, H, { fit: "cover", position })
    .modulate(style.modulate)
    .toBuffer();

  const logoH = 96;
  const logo = await sharp(logoPath)
    .resize({ height: logoH, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoW = Math.min(logoMeta.width || 100, W - 40);

  const chrome = await sharp(brandOverlaySvg(style, product.sizeLabel || ""), {
    density: 96,
  })
    .resize(W, H)
    .png()
    .toBuffer();

  await sharp(photo)
    .composite([
      { input: chrome, top: 0, left: 0 },
      {
        input: logo,
        top: 32,
        left: Math.max(0, Math.round((W - logoW) / 2)),
      },
    ])
    .webp({ quality: 84, effort: 4 })
    .toFile(path.join(outDir, `${product.slug}.webp`));
}

async function main() {
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  await mkdir(outDir, { recursive: true });

  for (const product of products) {
    await brandOne(product);
    product.imagePath = `/images/catalog/${product.slug}.webp?v=${CACHE_BUST}`;
    console.log("branded", product.slug, product.isEarth ? "[ارت]" : "[افشان]");
  }

  await writeFile(catalogPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`Done: ${products.length} Mahkam-branded catalog images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
