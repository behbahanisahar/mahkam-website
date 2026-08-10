/**
 * Generate catalog product images for افشان SKUs into public/images/catalog/
 * Run: node scripts/generate-afshan-images.mjs
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "prisma/data/afshan-catalog.json");
const outDir = path.join(root, "public/images/catalog");

const W = 1200;
const H = 1200;

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSvg(product) {
  const earth = Boolean(product.isEarth);
  const size = product.sizeLabel || "";
  const title = earth ? "سیم افشان ارت" : "سیم افشان";
  const accent = earth ? "#2f9e44" : "#b87333";
  const accent2 = earth ? "#f4d35e" : "#d4a574";
  const coil = earth ? "#3d8b40" : "#c9893a";
  const coilDark = earth ? "#1e5c28" : "#8a4f1f";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f3ec"/>
      <stop offset="55%" stop-color="#efe6d8"/>
      <stop offset="100%" stop-color="#e4d5c2"/>
    </linearGradient>
    <linearGradient id="coil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${coil}"/>
      <stop offset="100%" stop-color="${coilDark}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="600" cy="480" r="340" fill="url(#glow)"/>

  <!-- cable spool body -->
  <ellipse cx="600" cy="520" rx="260" ry="90" fill="${coilDark}" opacity="0.35"/>
  <rect x="360" y="300" width="480" height="380" rx="40" fill="url(#coil)"/>
  <ellipse cx="600" cy="300" rx="240" ry="70" fill="${accent2}"/>
  <ellipse cx="600" cy="680" rx="240" ry="70" fill="${coilDark}"/>

  <!-- winding lines -->
  ${Array.from({ length: 14 }, (_, i) => {
    const y = 330 + i * 24;
    return `<path d="M380 ${y} Q600 ${y - 18} 820 ${y}" fill="none" stroke="${earth && i % 2 === 0 ? accent2 : "rgba(255,255,255,0.22)"}" stroke-width="6" stroke-linecap="round"/>`;
  }).join("\n  ")}

  <!-- loose cable end -->
  <path d="M820 520 C940 500 980 620 900 700 C850 750 760 740 740 690" fill="none" stroke="${accent}" stroke-width="28" stroke-linecap="round"/>
  <path d="M820 520 C940 500 980 620 900 700 C850 750 760 740 740 730" fill="none" stroke="${earth ? accent2 : "#e8c39e"}" stroke-width="10" stroke-linecap="round" opacity="0.7"/>

  <!-- size badge -->
  <rect x="260" y="820" width="680" height="160" rx="28" fill="#1c1917" opacity="0.92"/>
  <text x="600" y="880" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="${accent2}">${escapeXml(title)}</text>
  <text x="600" y="945" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#ffffff" direction="ltr">${escapeXml(size)} mm²</text>

  <text x="600" y="1140" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#6b5b4b">مهکام</text>
</svg>`;
}

async function main() {
  const products = JSON.parse(await readFile(catalogPath, "utf8"));
  await mkdir(outDir, { recursive: true });

  for (const product of products) {
    const file = `${product.slug}.webp`;
    const abs = path.join(outDir, file);
    const svg = Buffer.from(buildSvg(product));
    await sharp(svg)
      .webp({ quality: 82, effort: 4 })
      .toFile(abs);
    product.imagePath = `/images/catalog/${file}`;
    console.log("wrote", product.imagePath);
  }

  await writeFile(catalogPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`Done: ${products.length} images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
