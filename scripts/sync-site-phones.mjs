/**
 * Upsert office phone numbers into SiteSetting (safe for production — no seed).
 * Run: node scripts/sync-site-phones.mjs
 * Docker: docker exec mahkam-website node scripts/sync-site-phones.mjs
 */
import { PrismaClient } from "@prisma/client";

const PHONES = ["02166349018", "02166349014", "09121090007"];

const prisma = new PrismaClient();

try {
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      phones: PHONES,
      telegramUrl: process.env.TELEGRAM_URL ?? "https://t.me/mahkamcable",
    },
    update: { phones: PHONES },
  });
  console.log("✓ site phones updated:", PHONES.join(", "));
} finally {
  await prisma.$disconnect();
}
