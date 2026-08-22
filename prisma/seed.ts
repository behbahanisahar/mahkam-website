import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80";

async function main() {
  if (process.env.NODE_ENV === "production") {
    if (process.env.ALLOW_PRODUCTION_SEED !== "YES_I_UNDERSTAND") {
      console.error(
        "Refusing to seed: NODE_ENV=production. " +
          "This script upserts admin password and demo catalog data. " +
          "Set ALLOW_PRODUCTION_SEED=YES_I_UNDERSTAND only for intentional bootstrap.",
      );
      process.exit(1);
    }
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@mahkam.ir").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    console.error(
      "Refusing to seed: set ADMIN_PASSWORD to a strong password (min 12 chars). " +
        "No default production/dev password is applied.",
    );
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: "مدیر مهکام" },
    update: { passwordHash },
  });

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      telegramUrl: process.env.TELEGRAM_URL ?? "https://t.me/mahkamcable",
      phones: ["02166349014"],
      address: "تهران، خیابان لاله‌زار نو، کوچه معمار مخصوص، پاساژ چلچراغ، طبقه ۴، واحد ۱۰",
      mapLat: 35.700348,
      mapLng: 51.42455,
      companyBlurb:
        "شرکت گسترش سیم و کابل مهکام؛ تولیدکننده انواع سیم و کابل برق با تمرکز بر کیفیت و رضایت مشتری.",
      aboutHtml: null,
      contactHtml: null,
    },
    update: {
      phones: ["02166349014"],
      address: "تهران، خیابان لاله‌زار نو، کوچه معمار مخصوص، پاساژ چلچراغ، طبقه ۴، واحد ۱۰",
      mapLat: 35.700348,
      mapLng: 51.42455,
    },
  });

  // Parent categories (family)
  const afshan = await prisma.category.upsert({
    where: { slug: "sim-afshan" },
    create: {
      nameFa: "سیم افشان",
      slug: "sim-afshan",
      description: "سیم افشان مسی برای تأسیسات ساختمانی و صنعتی",
      sortOrder: 1,
    },
    update: { nameFa: "سیم افشان", description: "سیم افشان مسی برای تأسیسات ساختمانی و صنعتی" },
  });

  const maftoli = await prisma.category.upsert({
    where: { slug: "sim-maftoli" },
    create: {
      nameFa: "سیم مفتولی",
      slug: "sim-maftoli",
      description: "سیم مفتولی برای سیم‌کشی ثابت",
      sortOrder: 2,
    },
    update: {},
  });

  const power = await prisma.category.upsert({
    where: { slug: "ghodrat" },
    create: {
      nameFa: "کابل‌های قدرت",
      slug: "ghodrat",
      description: "کابل‌های قدرت تک و چندرشته مسی و آلومینیومی",
      sortOrder: 3,
    },
    update: {},
  });

  const control = await prisma.category.upsert({
    where: { slug: "control" },
    create: {
      nameFa: "کابل کنترل",
      slug: "control",
      sortOrder: 4,
    },
    update: {},
  });

  // Remove legacy catch-all after moving leftover products to سیم افشان
  const legacy = await prisma.category.findUnique({ where: { slug: "sakhtemani" } });
  if (legacy) {
    await prisma.product.updateMany({
      where: { categoryId: legacy.id },
      data: { categoryId: afshan.id },
    });
    await prisma.category.delete({ where: { id: legacy.id } });
  }

  const afshanSizes = [
    { nameFa: "سیم افشان ۰.۷۵×۱", slug: "sim-afshan-0-75x1", cross: "۰.۷۵", structure: "۱×۰.۷۵" },
    { nameFa: "سیم افشان ۱×۱", slug: "sim-afshan-1x1", cross: "۱", structure: "۱×۱" },
    { nameFa: "سیم افشان ۱×۱.۵", slug: "sim-afshan-1x1-5", cross: "۱.۵", structure: "۱×۱.۵" },
    { nameFa: "سیم افشان ۱×۲.۵", slug: "sim-afshan-1x2-5", cross: "۲.۵", structure: "۱×۲.۵" },
  ];

  const products: Array<{
    nameFa: string;
    slug: string;
    categoryId: string;
    conductor: string;
    isFeatured: boolean;
    introduction: string;
    wireStructure: string;
    techSpecs: string;
    applications: string;
    advantages: string;
    specs: Record<string, string>;
    image: string;
  }> = [
    ...afshanSizes.map((s, i) => ({
      nameFa: s.nameFa,
      slug: s.slug,
      categoryId: afshan.id,
      conductor: "مس",
      isFeatured: i < 2,
      introduction: `${s.nameFa} محصولی از خانواده سیم افشان مهکام است که برای سیم‌کشی مدارهای روشنایی و پریز در ساختمان‌ها طراحی شده است.`,
      wireStructure: `هادی مسی افشان کلاس ۵ با سطح مقطع ${s.cross} میلی‌متر مربع؛ ساختار ${s.structure}؛ روکش PVC انعطاف‌پذیر.`,
      techSpecs: `سطح مقطع: ${s.cross} میلی‌متر مربع\nساختار: ${s.structure}\nولتاژ نامی: ۴۵۰/۷۵۰ ولت\nکلاس هادی: ۵\nاستاندارد: ISIRI / IEC`,
      applications: "تأسیسات ساختمانی\nمدارهای روشنایی و پریز\nتابلوهای توزیع سبک\nمحیط‌های خشک داخلی",
      advantages: "انعطاف‌پذیری بالا\nنصب آسان در مسیرهای منحنی\nکیفیت هادی مسی\nعایق مقاوم در برابر سایش روزمره",
      specs: {
        "سطح مقطع": `${s.cross} میلی‌متر مربع`,
        ساختار: s.structure,
        "ولتاژ نامی": "۴۵۰/۷۵۰ ولت",
        "کلاس هادی": "۵",
        استاندارد: "ISIRI / IEC",
      },
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    })),
    {
      nameFa: "سیم مفتولی ۱×۲.۵",
      slug: "sim-maftoli-1x2-5",
      categoryId: maftoli.id,
      conductor: "مس",
      isFeatured: true,
      introduction: "سیم مفتولی مسی برای سیم‌کشی ثابت در مسیرهای مستقیم ساختمانی.",
      wireStructure: "هادی مسی مفتولی کلاس ۱ با سطح مقطع ۲.۵ میلی‌متر مربع؛ روکش PVC.",
      techSpecs: "سطح مقطع: ۲.۵ میلی‌متر مربع\nولتاژ نامی: ۴۵۰/۷۵۰ ولت\nکلاس هادی: ۱",
      applications: "سیم‌کشی ثابت\nمدارهای قدرت سبک ساختمانی",
      advantages: "مقاومت مکانیکی مناسب\nقیمت اقتصادی\nنصب در لوله و سینی",
      specs: {
        "سطح مقطع": "۲.۵ میلی‌متر مربع",
        "ولتاژ نامی": "۴۵۰/۷۵۰ ولت",
        "کلاس هادی": "۱",
      },
      image: PLACEHOLDER,
    },
    {
      nameFa: "کابل قدرت ۱×۹۵ مس",
      slug: "cable-power-1x95-cu",
      categoryId: power.id,
      conductor: "مس",
      isFeatured: true,
      introduction: "کابل قدرت تک‌رشته مسی برای انتقال انرژی در پروژه‌های صنعتی و ساختمانی.",
      wireStructure: "هادی مسی تک‌رشته با سطح مقطع ۹۵ میلی‌متر مربع؛ عایق PVC یا XLPE.",
      techSpecs: "سطح مقطع: ۹۵ میلی‌متر مربع\nولتاژ نامی: ۰.۶/۱ کیلوولت\nعایق: PVC / XLPE",
      applications: "تغذیه تابلوها\nخطوط انتقال کوتاه\nپروژه‌های صنعتی",
      advantages: "ظرفیت جریان بالا\nافت ولتاژ کم\nدوام در شرایط کاری سنگین",
      specs: {
        "سطح مقطع": "۹۵ میلی‌متر مربع",
        "ولتاژ نامی": "۰.۶/۱ کیلوولت",
        عایق: "PVC / XLPE",
      },
      image:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
    },
    {
      nameFa: "کابل کنترل ۱۲×۱.۵",
      slug: "cable-control-12x1-5",
      categoryId: control.id,
      conductor: "مس",
      isFeatured: true,
      introduction: "کابل کنترل چندرشته برای فرمان و سیگنال در اتوماسیون و تابلوها.",
      wireStructure: "۱۲ رشته هادی مسی افشان با سطح مقطع ۱.۵ میلی‌متر مربع؛ روکش کلی PVC.",
      techSpecs: "ساختار: ۱۲×۱.۵\nولتاژ نامی: ۳۰۰/۵۰۰ ولت",
      applications: "فرمان و کنترل\nسیگنالینگ\nاتوماسیون صنعتی",
      advantages: "تعداد رشته مناسب تابلو\nشناسایی آسان رنگ‌بندی\nانعطاف برای مسیرهای داخل تابلو",
      specs: {
        ساختار: "۱۲×۱.۵",
        "ولتاژ نامی": "۳۰۰/۵۰۰ ولت",
      },
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  for (const [index, p] of products.entries()) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        nameFa: p.nameFa,
        slug: p.slug,
        shortDesc: p.introduction.slice(0, 120),
        introduction: p.introduction,
        wireStructure: p.wireStructure,
        techSpecs: p.techSpecs,
        applications: p.applications,
        advantages: p.advantages,
        body: p.introduction,
        application: p.applications.split("\n")[0] ?? null,
        conductor: p.conductor,
        categoryId: p.categoryId,
        specs: p.specs,
        isPublished: true,
        isFeatured: p.isFeatured,
        sortOrder: index + 1,
        seoTitle: `${p.nameFa} | گسترش سیم و کابل مهکام`,
        seoDescription: p.introduction.slice(0, 160),
      },
      update: {
        nameFa: p.nameFa,
        shortDesc: p.introduction.slice(0, 120),
        introduction: p.introduction,
        wireStructure: p.wireStructure,
        techSpecs: p.techSpecs,
        applications: p.applications,
        advantages: p.advantages,
        body: p.introduction,
        application: p.applications.split("\n")[0] ?? null,
        categoryId: p.categoryId,
        specs: p.specs,
        isPublished: true,
        isFeatured: p.isFeatured,
      },
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.image,
          alt: p.nameFa,
          sortOrder: 0,
        },
      });
    }
  }

  const seededProducts = await prisma.product.findMany({
    where: { slug: { in: products.map((p) => p.slug) } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(seededProducts.map((p) => [p.slug, p.id]));

  const viewWeights: Record<string, number> = {
    "sim-afshan-1x1-5": 42,
    "sim-afshan-0-75x1": 30,
    "sim-afshan-1x1": 26,
    "sim-maftoli-1x2-5": 28,
    "cable-power-1x95-cu": 18,
    "cable-control-12x1-5": 24,
  };

  await prisma.productView.deleteMany({
    where: { productId: { in: seededProducts.map((p) => p.id) } },
  });

  const now = Date.now();
  for (const [slug, total] of Object.entries(viewWeights)) {
    const productId = bySlug.get(slug);
    if (!productId) continue;

    for (let i = 0; i < total; i++) {
      const daysAgo =
        i < Math.floor(total * 0.6) ? Math.floor(Math.random() * 6) : 8 + Math.floor(Math.random() * 20);
      const source = i % 3 === 0 ? "CARD" : "PAGE";
      await prisma.productView.create({
        data: {
          productId,
          source,
          viewedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 86400000),
          visitorKey: `seed-${slug}-${i}`,
        },
      });
    }
  }

  const samples = [
    { date: "2026-07-13", jalali: "1405/04/22", close: 1809850 },
    { date: "2026-07-12", jalali: "1405/04/21", close: 1796000 },
    { date: "2026-07-11", jalali: "1405/04/20", close: 1782000 },
  ];

  for (const s of samples) {
    await prisma.dollarDaily.upsert({
      where: { date: new Date(`${s.date}T00:00:00.000Z`) },
      create: {
        date: new Date(`${s.date}T00:00:00.000Z`),
        dateJalali: s.jalali,
        close: s.close,
        high: s.close * 1.01,
        low: s.close * 0.99,
        source: "seed",
      },
      update: {},
    });
  }

  await prisma.priceSnapshot.createMany({
    data: [
      { symbol: "USD_RLS", source: "seed", value: 1842000, unit: "ریال" },
      { symbol: "COPPER", source: "seed", value: 13616, unit: "دلار/تن" },
      { symbol: "ALUMINUM", source: "seed", value: 3178, unit: "دلار/تن" },
    ],
  });

  console.log("Seed complete.");
  console.log(`Admin email: ${email}`);
  console.log("Admin password: (the ADMIN_PASSWORD you provided — not printed)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
