/**
 * HD studio catalog photos (not infographics).
 * Maps each SKU to a color/structure model, then writes catalog + thumbs
 * with a small MAHKAM size chip matching product details.
 *
 * Run: node scripts/generate-industrial-catalog-images.mjs
 */
import { access, copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/images/catalog");
const thumbDir = path.join(root, "public/images/catalog-thumbs");
const studioDir = path.join(root, "public/images/catalog-studio");
const assetsDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-saharbehbahani-mahkam/assets",
);
const CACHE = "card8";
const FILLER_CACHE = "card11";
const W = 1600;
const H = 1600;
const FONT =
  process.env.MAHKAM_FA_FONT ||
  "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";

const MODEL_SOURCES = {
  "hd-afshan-brown": "hd-afshan-brown-v2.png",
  "hd-afshan-black": "hd-afshan-black-v2.png",
  "hd-afshan-blue": "hd-afshan-blue-v2.png",
  "hd-afshan-red": "hd-afshan-red-v2.png",
  "hd-afshan-red-6": "hd-afshan-red-6-v2.png",
  "hd-afshan-black-10": "hd-afshan-black-10-v2.png",
  "hd-afshan-black-thick": "hd-afshan-black-thick-v2.png",
  "hd-earth-thin": "hd-earth-thin-v2.png",
  "hd-earth-thick": "hd-earth-thick-v2.png",
  "hd-alum-1": "hd-alum-1.png",
  "hd-alum-2": "hd-alum-2.png",
  "hd-alum-3n": "hd-alum-3n.png",
  "hd-alum-4": "hd-alum-4.png",
  "hd-alum-5": "hd-alum-5.png",
  "hd-maftoli-2-5": "hd-maftoli-2-5.png",
  "hd-power-cu-1": "hd-power-cu-1.png",
  "hd-control-12": "hd-control-12.png",
  "hd-flex-2": "hd-flex-2.png",
  "hd-flex-3": "hd-flex-3.png",
  "hd-flex-4": "hd-flex-4.png",
  "hd-flex-5": "hd-flex-5.png",
  "hd-flex-3n": "hd-flex-3n.png",
  "hd-flex-filler-3": "hd-flex-filler-3.png",
  "hd-flex-filler-3n": "hd-flex-filler-3n.png",
  "hd-flex-filler-4": "hd-flex-filler-4.png",
};

/** Products outside afshan/aluminum JSON — mapped from their copy (cores/color). */
const EXTRA = [
  {
    slug: "sim-maftoli-1x2-5",
    sizeLabel: "1×2.5",
    kind: "maftoli",
    model: "hd-maftoli-2-5",
    voltage: "450/750 V",
  },
  {
    slug: "cable-power-1x95-cu",
    sizeLabel: "1×95",
    kind: "power-cu",
    model: "hd-power-cu-1",
    voltage: "0.6/1 kV",
  },
  {
    slug: "cable-control-12x1-5",
    sizeLabel: "12×1.5",
    kind: "control",
    model: "hd-control-12",
    voltage: "300/500 V",
  },
];

/** Legacy duplicate slugs → canonical HD files. */
const ALIASES = [
  ["sim-afshan-1x1-5", "sim-afshan-1-5x1"],
  ["sim-afshan-1x2-5", "sim-afshan-2-5x1"],
];

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

  if (earth) return mm >= 16 ? "hd-earth-thick" : "hd-earth-thin";
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
    if (size.cores === 3) return "hd-flex-filler-3";
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

function svgFontStyles() {
  return `@font-face { font-family: 'FaChip'; src: url('file://${FONT}'); }
      .fa { font-family: 'FaChip', 'Arial Unicode MS', Arial, sans-serif; }
      .latin { font-family: Arial, Helvetica, sans-serif; }`;
}

/** Bottom-right info chip on product detail pages only. */
function chipSvg(sizeLabel, voltage, canvas = W) {
  const scale = canvas / W;
  const y0 = Math.round(1418 * scale);
  const h0 = Math.round(126 * scale);
  const w0 = Math.round(470 * scale);
  const x0 = Math.round(56 * scale);
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}">
  <defs><style>${svgFontStyles()}</style></defs>
  <rect x="${x0}" y="${y0}" width="${w0}" height="${h0}" rx="${Math.round(22 * scale)}" fill="#ffffff"/>
  <rect x="${x0}" y="${y0}" width="${Math.round(10 * scale)}" height="${h0}" rx="${Math.round(4 * scale)}" fill="#ff4d00"/>
  <text class="latin" x="${x0 + Math.round(36 * scale)}" y="${y0 + Math.round(46 * scale)}" font-size="${Math.round(28 * scale)}" font-weight="800" fill="#111111">MAHKAM</text>
  <text class="fa" x="${x0 + Math.round(244 * scale)}" y="${y0 + Math.round(46 * scale)}" font-size="${Math.round(24 * scale)}" font-weight="700" fill="#c45a12">مهکام</text>
  <text class="latin" x="${x0 + Math.round(36 * scale)}" y="${y0 + Math.round(90 * scale)}" font-size="${Math.round(26 * scale)}" font-weight="700" fill="#222222">${esc(sizeLabel)} mm²</text>
  <text class="latin" x="${x0 + Math.round(36 * scale)}" y="${y0 + Math.round(118 * scale)}" font-size="${Math.round(16 * scale)}" fill="#666666">${esc(voltage)}</text>
</svg>`);
}

const STUDIO = { r: 232, g: 229, b: 224, alpha: 1 };

async function ensureModels() {
  await mkdir(studioDir, { recursive: true });
  console.log("→ copy studio photos (keep floor, wrap, jacket print)");
  for (const [key, file] of Object.entries(MODEL_SOURCES)) {
    const src = path.join(assetsDir, file);
    const dest = path.join(studioDir, `${key}.png`);
    await access(src);
    await copyFile(src, dest);
  }
}

const THUMB = 480;
/** Listing cards: fill most of the square. Detail photos keep a bit more margin. */
const CARD_FILL = 0.86;
const DETAIL_FILL = 0.82;

async function compositeOnStudio(srcPath, size, fill, { sizeLabel, voltage, detailChip = false }) {
  const quality = size >= 800 ? 92 : 86;
  const layers = [];
  if (detailChip) {
    layers.push({ input: chipSvg(sizeLabel, voltage, size), left: 0, top: 0 });
  }
  return sharp(srcPath)
    .resize(size, size, { fit: "cover", position: "centre" })
    .composite(layers)
    .webp({ quality });
}

async function renderOne(product, kind, modelOverride) {
  const model = modelOverride || modelFor(product, kind);
  const src = path.join(studioDir, `${model}.png`);
  await access(src);
  const voltage = voltageFor(kind, product);
  const opts = { sizeLabel: product.sizeLabel, voltage };
  await (
    await compositeOnStudio(src, W, DETAIL_FILL, { ...opts, detailChip: true })
  ).toFile(path.join(outDir, `${product.slug}.webp`));
  await (await compositeOnStudio(src, THUMB, CARD_FILL, opts)).toFile(
    path.join(thumbDir, `${product.slug}.webp`),
  );
  return model;
}

async function loadAndBump(file, cache = CACHE) {
  const full = path.join(root, file);
  const data = JSON.parse(await readFile(full, "utf8"));
  for (const p of data) {
    p.imagePath = `/images/catalog/${p.slug}.webp?v=${cache}`;
  }
  await writeFile(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return data;
}

async function rebuildThumbsFromCatalog() {
  await mkdir(thumbDir, { recursive: true });
  const { readdir } = await import("fs/promises");
  const files = (await readdir(outDir)).filter((f) => f.endsWith(".webp"));
  console.log(`→ rebuild listing thumbs ${files.length}`);
  for (const file of files) {
    await sharp(path.join(outDir, file))
      .resize(THUMB, THUMB, { fit: "contain", background: STUDIO })
      .flatten({ background: STUDIO })
      .webp({ quality: 84 })
      .toFile(path.join(thumbDir, file));
  }
  console.log("✓ thumbs ready");
}

async function main() {
  if (process.argv.includes("--thumbs-only")) {
    await rebuildThumbsFromCatalog();
    return;
  }
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  await ensureModels();
  const extrasOnly = process.argv.includes("--extras-only");
  const flexOnly = process.argv.includes("--flex-only");
  const fillerOnly = process.argv.includes("--filler-only");
  const maftoliOnly = process.argv.includes("--maftoli-only");
  if (fillerOnly) {
    const filler = await loadAndBump("prisma/data/flex-filler-catalog.json", FILLER_CACHE);
    console.log(`→ filled flex copper ${filler.length} (v=${FILLER_CACHE})`);
    for (const p of filler) {
      const model = await renderOne(p, "filler");
      console.log(`  filler ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
    const aliases = JSON.parse(
      await readFile(path.join(root, "prisma/data/prod-flex-aliases.json"), "utf8"),
    );
    const fillerSlugs = new Set(filler.map((p) => p.slug));
    for (const a of aliases) {
      if (!fillerSlugs.has(a.latinSlug)) continue;
      a.imagePath = `/images/catalog/${a.latinSlug}.webp?v=${FILLER_CACHE}`;
      await copyFile(
        path.join(outDir, `${a.latinSlug}.webp`),
        path.join(outDir, `${a.prodSlug}.webp`),
      );
      await copyFile(
        path.join(thumbDir, `${a.latinSlug}.webp`),
        path.join(thumbDir, `${a.prodSlug}.webp`),
      );
      console.log(`  alias ${a.prodSlug} ← ${a.latinSlug}`);
    }
    await writeFile(
      path.join(root, "prisma/data/prod-flex-aliases.json"),
      `${JSON.stringify(aliases, null, 2)}\n`,
      "utf8",
    );
    console.log(`✓ filler catalog ready v=${FILLER_CACHE}`);
    return;
  }
  if (maftoliOnly) {
    const maftoli = await loadAndBump("prisma/data/maftoli-catalog.json");
    console.log(`→ solid copper maftoli ${maftoli.length} (v=${CACHE})`);
    for (const p of maftoli) {
      const model = await renderOne(p, "maftoli");
      console.log(`  maftoli ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
    console.log(`✓ HD catalog ready v=${CACHE}`);
    return;
  }
  if (!extrasOnly && !flexOnly) {
    const afshan = await loadAndBump("prisma/data/afshan-catalog.json");
    const aluminum = await loadAndBump("prisma/data/aluminum-catalog.json");
    console.log(`→ HD catalog photos ${afshan.length + aluminum.length} (v=${CACHE})`);
    for (const p of afshan) {
      const model = await renderOne(p, "afshan");
      console.log(`  afshan ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
    for (const p of aluminum) {
      const model = await renderOne(p, "aluminum");
      console.log(`  alum ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
  } else {
    console.log(flexOnly ? "→ flexible copper only" : "→ extras + aliases only");
  }
  if (!flexOnly) {
    for (const p of EXTRA) {
      const model = await renderOne(p, p.kind, p.model);
      console.log(`  extra ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
    for (const [alias, canon] of ALIASES) {
      await copyFile(path.join(outDir, `${canon}.webp`), path.join(outDir, `${alias}.webp`));
      await copyFile(path.join(thumbDir, `${canon}.webp`), path.join(thumbDir, `${alias}.webp`));
      console.log(`  alias ${alias} ← ${canon}`);
    }
  }
  if (!flexOnly) {
    const maftoli = await loadAndBump("prisma/data/maftoli-catalog.json");
    console.log(`→ solid copper maftoli ${maftoli.length}`);
    for (const p of maftoli) {
      const model = await renderOne(p, "maftoli");
      console.log(`  maftoli ${p.slug}  ${p.sizeLabel}  ${model}`);
    }
  }
  const slugFilter = process.env.CATALOG_SLUGS?.split(",").map((s) => s.trim()).filter(Boolean);
  const flex = await loadAndBump("prisma/data/flex-catalog.json");
  const filler = await loadAndBump("prisma/data/flex-filler-catalog.json", FILLER_CACHE);
  const flexList = slugFilter ? flex.filter((p) => slugFilter.includes(p.slug)) : flex;
  const fillerList = slugFilter ? filler.filter((p) => slugFilter.includes(p.slug)) : filler;
  console.log(`→ flexible copper ${flexList.length + fillerList.length}`);
  for (const p of flexList) {
    const model = await renderOne(p, "flex");
    console.log(`  flex ${p.slug}  ${p.sizeLabel}  ${model}`);
  }
  for (const p of fillerList) {
    const model = await renderOne(p, "filler");
    console.log(`  filler ${p.slug}  ${p.sizeLabel}  ${model}`);
  }
  if (slugFilter) {
    console.log(`✓ HD catalog ready v=${CACHE}`);
    return;
  }
  const aliases = JSON.parse(
    await readFile(path.join(root, "prisma/data/prod-flex-aliases.json"), "utf8"),
  );
  for (const a of aliases) {
    const cache = a.latinSlug.startsWith("cable-flex-filler") ? FILLER_CACHE : CACHE;
    a.imagePath = `/images/catalog/${a.latinSlug}.webp?v=${cache}`;
  }
  await writeFile(
    path.join(root, "prisma/data/prod-flex-aliases.json"),
    `${JSON.stringify(aliases, null, 2)}\n`,
    "utf8",
  );
  console.log(`→ production slug aliases ${aliases.length}`);
  for (const a of aliases) {
    const src = path.join(outDir, `${a.latinSlug}.webp`);
    const srcThumb = path.join(thumbDir, `${a.latinSlug}.webp`);
    await copyFile(src, path.join(outDir, `${a.prodSlug}.webp`));
    await copyFile(srcThumb, path.join(thumbDir, `${a.prodSlug}.webp`));
    console.log(`  alias ${a.prodSlug} ← ${a.latinSlug}`);
  }
  console.log(`✓ HD catalog ready v=${CACHE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
