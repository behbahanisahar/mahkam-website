/**
 * Catalog photos — v2 style (approved sample):
 * - Coil with blank white paper sleeve on side
 * - Cut end showing conductor / cores
 * - MAHKAM + مهکام + specs on sleeve (SVG overlay)
 * - Same specs printed on cable jacket
 *
 * Run: node scripts/generate-catalog-v2.mjs
 */
import { access, copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/images/catalog");
const thumbDir = path.join(root, "public/images/catalog-thumbs");
const baseDir = path.join(root, "public/images/catalog-v2-bases");
const assetsDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-saharbehbahani-mahkam/assets",
);
const CACHE = "card14";
const W = 1600;
const THUMB = 480;
const FONT =
  process.env.MAHKAM_FA_FONT ||
  "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";
const STUDIO = { r: 238, g: 238, b: 238, alpha: 1 };

const EXTRA = [
  { slug: "sim-maftoli-1x2-5", sizeLabel: "1×2.5", kind: "maftoli", model: "v2-maftoli", voltage: "450/750 V" },
  { slug: "cable-power-1x95-cu", sizeLabel: "1×95", kind: "power-cu", model: "v2-power-cu", voltage: "0.6/1 kV" },
  { slug: "cable-control-12x1-5", sizeLabel: "12×1.5", kind: "control", model: "v2-control", voltage: "300/500 V" },
];

const ALIASES = [
  ["sim-afshan-1x1-5", "sim-afshan-1-5x1"],
  ["sim-afshan-1x2-5", "sim-afshan-2-5x1"],
];

const CATALOGS = [
  { file: "prisma/data/afshan-catalog.json", kind: "afshan" },
  { file: "prisma/data/aluminum-catalog.json", kind: "aluminum" },
  { file: "prisma/data/flex-catalog.json", kind: "flex" },
  { file: "prisma/data/flex-filler-catalog.json", kind: "filler" },
  { file: "prisma/data/maftoli-catalog.json", kind: "maftoli" },
];

/** Map studio model key → v2 base filename (without .png) */
const V2_BASE_MAP = {
  "hd-earth-afshan-thin": "v2-earth",
  "hd-earth-afshan-thick": "v2-earth-thick",
  "hd-afshan-brown": "v2-afshan-brown",
  "hd-afshan-black": "v2-afshan-black",
  "hd-afshan-blue": "v2-afshan-blue",
  "hd-afshan-red": "v2-afshan-red",
  "hd-afshan-red-6": "v2-afshan-red",
  "hd-afshan-black-10": "v2-afshan-black-thick",
  "hd-afshan-black-thick": "v2-afshan-black-thick",
  "hd-alum-1": "v2-alum-1",
  "hd-alum-2": "v2-alum-2",
  "hd-alum-3n": "v2-alum-3n",
  "hd-alum-4": "v2-alum-4",
  "hd-alum-5": "v2-alum-5",
  "hd-flex-2": "v2-flex-2",
  "hd-flex-3": "v2-flex-3",
  "hd-flex-4": "v2-flex-4",
  "hd-flex-5": "v2-flex-5",
  "hd-flex-3n": "v2-flex-3n",
  "hd-flex-filler-3": "v2-filler-3",
  "hd-flex-filler-3n": "v2-filler-3n",
  "hd-flex-filler-4": "v2-filler-4",
  "hd-maftoli-2-5": "v2-maftoli",
  "hd-power-cu-1": "v2-power-cu",
  "hd-control-12": "v2-control",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toLatinDigits(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function parseSize(sizeLabel) {
  const raw = toLatinDigits(String(sizeLabel || ""))
    .replace(/[×xX]/g, "x")
    .replace(/\s/g, "");
  const m = raw.match(/^(\d+)x([\d.]+)(?:\+([\d.]+))?$/i);
  if (!m) return { cores: 1, section: raw || "?", neutral: null, label: sizeLabel || "?" };
  return {
    cores: Number(m[1]),
    section: m[2],
    neutral: m[3] ?? null,
    label: sizeLabel,
  };
}

function productBlob(product) {
  return [
    product.wireStructure,
    product.techSpecs,
    product.introduction,
    product.applications,
    product.advantages,
  ]
    .filter(Boolean)
    .join("\n");
}

function modelFor(product, kind) {
  const blob = productBlob(product);
  const earth =
    Boolean(product.isEarth) || /سبز و زرد|سبز\/زرد|Green-Yellow|Green\/Yellow/i.test(blob);
  const size = parseSize(product.sizeLabel);
  const mm = Number(size.section);

  if (earth) return mm >= 16 ? "hd-earth-afshan-thick" : "hd-earth-afshan-thin";
  if (kind === "aluminum") {
    if (size.neutral != null || size.cores === 3) return "hd-alum-3n";
    if (size.cores <= 1) return "hd-alum-1";
    if (size.cores === 2) return "hd-alum-2";
    if (size.cores === 4) return "hd-alum-4";
    return "hd-alum-5";
  }
  if (kind === "filler") {
    if (size.neutral != null || /\+/.test(String(product?.sizeLabel || ""))) return "hd-flex-filler-3n";
    if (size.cores === 4) return "hd-flex-filler-4";
    return "hd-flex-filler-3";
  }
  if (kind === "flex") {
    if (size.neutral != null) return "hd-flex-3n";
    if (size.cores <= 1) return mm >= 50 ? "hd-afshan-black-thick" : "hd-flex-2";
    if (size.cores === 2) return "hd-flex-2";
    if (size.cores === 3) return "hd-flex-3";
    if (size.cores === 4) return "hd-flex-4";
    return "hd-flex-5";
  }
  if (kind === "maftoli") {
    if (size.neutral != null) return size.cores <= 1 ? "hd-flex-2" : "hd-flex-3n";
    if (size.cores <= 1) return mm >= 50 ? "hd-power-cu-1" : "hd-maftoli-2-5";
    if (size.cores === 2) return "hd-flex-2";
    if (size.cores === 3) return "hd-flex-3";
    if (size.cores === 4) return "hd-flex-4";
    return "hd-flex-5";
  }
  if (/آبی/.test(blob)) return "hd-afshan-blue";
  if (/قرمز/.test(blob) && mm >= 6) return "hd-afshan-red-6";
  if (/قرمز/.test(blob)) return "hd-afshan-red";
  if (/قهوه‌ای|قهوه ای/.test(blob)) return "hd-afshan-brown";

  if (mm <= 0.75) return "hd-afshan-brown";
  if (mm <= 1) return "hd-afshan-black";
  if (mm <= 1.5) return "hd-afshan-blue";
  if (mm <= 4) return "hd-afshan-red";
  if (mm <= 6) return "hd-afshan-red-6";
  if (mm <= 10) return "hd-afshan-black-10";
  return "hd-afshan-black-thick";
}

function voltageFor(kind, product) {
  if (product?.voltage) return product.voltage;
  if (kind === "aluminum" || kind === "power-cu" || kind === "filler") return "0.6/1 kV";
  if (kind === "control" || kind === "flex") return "300/500 V";
  if (kind === "maftoli") {
    const size = parseSize(product?.sizeLabel);
    const mm = Number(size.section);
    if (size.neutral != null || (size.cores >= 3 && mm >= 35) || (size.cores === 1 && mm >= 50)) {
      return "0.6/1 kV";
    }
    if (size.cores === 1) return "450/750 V";
    return "300/500 V";
  }
  return "450/750 V";
}

function svgStyles() {
  return `@font-face { font-family: 'FaChip'; src: url('file://${FONT}'); }
    .fa { font-family: 'FaChip', 'Arial Unicode MS', Arial, sans-serif; }
    .latin { font-family: Arial, Helvetica, sans-serif; }`;
}

/** White paper sleeve — matches approved v2 screenshot */
function paperSleeveSvg(sizeLabel, voltage, canvas) {
  const s = canvas / W;
  const x = Math.round(310 * s);
  const y = Math.round(560 * s);
  const w = Math.round(340 * s);
  const h = Math.round(175 * s);
  const spec = `${esc(sizeLabel)} mm² ${esc(voltage)}`;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}">
  <defs><style>${svgStyles()}</style></defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.round(4 * s)}" fill="#ffffff" stroke="#dddddd" stroke-width="${Math.max(1, Math.round(1 * s))}"/>
  <text class="latin" x="${x + Math.round(w / 2)}" y="${y + Math.round(52 * s)}" text-anchor="middle" font-size="${Math.round(36 * s)}" font-weight="800" fill="#111111">MAHKAM</text>
  <text class="fa" x="${x + Math.round(w / 2)}" y="${y + Math.round(98 * s)}" text-anchor="middle" font-size="${Math.round(32 * s)}" font-weight="700" fill="#111111">مهکام</text>
  <text class="latin" x="${x + Math.round(w / 2)}" y="${y + Math.round(145 * s)}" text-anchor="middle" font-size="${Math.round(24 * s)}" font-weight="600" fill="#333333">${spec}</text>
</svg>`);
}

function jacketInk(product, kind) {
  const blob = productBlob(product);
  if (product.isEarth || /Green-Yellow|سبز/i.test(blob)) return "#2a2a2a";
  if (kind === "maftoli") return "#ffffff";
  return "#c8c8c8";
}

function cablePrintSvg(sizeLabel, voltage, canvas, ink) {
  const s = canvas / W;
  const line = `MAHKAM مهکام ${esc(sizeLabel)} mm² ${esc(voltage)}`;
  const x = Math.round(480 * s);
  const y = Math.round(1180 * s);
  const fs = Math.round(24 * s);
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}">
  <defs><style>${svgStyles()}</style></defs>
  <text class="fa" x="${x}" y="${y}" font-size="${fs}" font-weight="600" fill="${ink}" opacity="0.92"
        transform="rotate(-6 ${x} ${y})">${line}</text>
</svg>`);
}

async function resolveBase(modelKey, overrideModel) {
  const key = overrideModel || V2_BASE_MAP[modelKey] || "v2-afshan-black";
  const local = path.join(baseDir, `${key}.png`);
  const asset = path.join(assetsDir, `${key}.png`);
  try {
    await access(local);
    return local;
  } catch {
    await access(asset);
    return asset;
  }
}

async function renderProduct(product, kind, modelOverride) {
  const modelKey = modelOverride || modelFor(product, kind);
  const src = await resolveBase(modelKey, product.model);
  const voltage = voltageFor(kind, product);
  const ink = jacketInk(product, kind);
  const layers = [
    { input: cablePrintSvg(product.sizeLabel, voltage, W, ink), left: 0, top: 0 },
    { input: paperSleeveSvg(product.sizeLabel, voltage, W), left: 0, top: 0 },
  ];
  const quality = 92;
  await sharp(src)
    .resize(W, W, { fit: "cover", position: "centre" })
    .composite(layers)
    .webp({ quality })
    .toFile(path.join(outDir, `${product.slug}.webp`));

  await sharp(src)
    .resize(THUMB, THUMB, { fit: "cover", position: "centre" })
    .composite([
      { input: cablePrintSvg(product.sizeLabel, voltage, THUMB, ink), left: 0, top: 0 },
      { input: paperSleeveSvg(product.sizeLabel, voltage, THUMB), left: 0, top: 0 },
    ])
    .webp({ quality: 86 })
    .toFile(path.join(thumbDir, `${product.slug}.webp`));

  return modelKey;
}

async function bumpCatalog(file, cache = CACHE) {
  const full = path.join(root, file);
  const data = JSON.parse(await readFile(full, "utf8"));
  for (const p of data) p.imagePath = `/images/catalog/${p.slug}.webp?v=${cache}`;
  await writeFile(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return data;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  await mkdir(baseDir, { recursive: true });

  let count = 0;
  for (const { file, kind } of CATALOGS) {
    const products = await bumpCatalog(file);
    console.log(`→ ${file} (${products.length})`);
    for (const p of products) {
      const model = await renderProduct(p, kind);
      console.log(`  ${p.slug}  ${p.sizeLabel}  ${model}`);
      count++;
    }
  }

  for (const p of EXTRA) {
    const voltage = p.voltage || voltageFor(p.kind, p);
    const src = await resolveBase(null, p.model);
    const ink = jacketInk(p, p.kind);
    await sharp(src).resize(W, W, { fit: "cover", position: "centre" }).composite([
      { input: cablePrintSvg(p.sizeLabel, voltage, W, ink), left: 0, top: 0 },
      { input: paperSleeveSvg(p.sizeLabel, voltage, W), left: 0, top: 0 },
    ]).webp({ quality: 92 })
      .toFile(path.join(outDir, `${p.slug}.webp`));
    await sharp(src).resize(THUMB, THUMB, { fit: "cover", position: "centre" }).composite([
      { input: cablePrintSvg(p.sizeLabel, voltage, THUMB, ink), left: 0, top: 0 },
      { input: paperSleeveSvg(p.sizeLabel, voltage, THUMB), left: 0, top: 0 },
    ]).webp({ quality: 86 })
      .toFile(path.join(thumbDir, `${p.slug}.webp`));
    console.log(`  extra ${p.slug}  ${p.model}`);
    count++;
  }

  for (const [alias, canon] of ALIASES) {
    await copyFile(path.join(outDir, `${canon}.webp`), path.join(outDir, `${alias}.webp`));
    await copyFile(path.join(thumbDir, `${canon}.webp`), path.join(thumbDir, `${alias}.webp`));
  }

  const aliases = JSON.parse(
    await readFile(path.join(root, "prisma/data/prod-flex-aliases.json"), "utf8"),
  );
  for (const a of aliases) {
    a.imagePath = `/images/catalog/${a.latinSlug}.webp?v=${CACHE}`;
  }
  await writeFile(
    path.join(root, "prisma/data/prod-flex-aliases.json"),
    `${JSON.stringify(aliases, null, 2)}\n`,
    "utf8",
  );
  for (const a of aliases) {
    await copyFile(path.join(outDir, `${a.latinSlug}.webp`), path.join(outDir, `${a.prodSlug}.webp`));
    await copyFile(
      path.join(thumbDir, `${a.latinSlug}.webp`),
      path.join(thumbDir, `${a.prodSlug}.webp`),
    );
  }

  console.log(`✓ v2 catalog ready: ${count} renders, v=${CACHE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
