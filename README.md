# گسترش سیم و کابل مهکام

وب‌سایت فارسی RTL برای شرکت گسترش سیم و کابل مهکام — کاتالوگ محصولات، سئو، پنل مدیریت فارسی، و ماژول نرخ دلار/مس/آلومینیوم.

## فناوری‌ها

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth.js (ورود ادمین)
- Tailwind CSS 4
- آپلود تصویر خودمیزبان روی VPS (`UPLOAD_DIR` + Nginx `/uploads/`)

## راه‌اندازی محلی

```bash
cp .env.example .env.local
# DATABASE_URL و AUTH_SECRET و ADMIN_PASSWORD را پر کنید
# آپلود محلی پیش‌فرض: .data/uploads (بدون نیاز به UPLOAD_DIR)

npm install
npm run db:push
npm run db:seed
npm run dev
```

- سایت: http://localhost:3000
- پنل: http://localhost:3000/admin/login

**Seed:** در production بدون `ALLOW_PRODUCTION_SEED=YES_I_UNDERSTAND` اجرا نمی‌شود. `ADMIN_PASSWORD` حداقل ۱۲ کاراکتر الزامی است. هرگز روی دیتابیس پروداکشن seed نزنید مگر با آگاهی کامل.

## دامنه و SEO

- فعلی زنده: `https://mahkamcable.com`
- هدف canonical: `https://mahkamcable.ir` (پس از DNS/SSL)

تا قبل از cutover هر دو را روی `.com` نگه دارید:

```
NEXTAUTH_URL=https://mahkamcable.com
NEXT_PUBLIC_SITE_URL=https://mahkamcable.com
```

جزئیات: `docs/PRODUCTION.md` و `docs/nginx/README.md`.

## نرخ‌ها

- **زنده (CURRENT):** لایودیتا → کش/API → UI (در صورت خطا، آخرین `PriceSnapshot` از Postgres به‌عنوان fallback)
- **تاریخی (HISTORY):** کرون/ادمین → `DollarDaily` (+ snapshots برای fallback)

همگام‌سازی دستی:

```bash
curl -H "Authorization: Bearer CRON_SECRET" \
  "https://YOUR_DOMAIN/api/cron/sync-prices?backfill=1"
```

روی **VPS** باید cron سیستمی تنظیم شود — `vercel.json` روی Ubuntu/PM2 اجرا نمی‌شود. زمان پیشنهادی: روزانه `0 6 * * *` UTC. جزئیات در `docs/PRODUCTION.md`.

## استقرار VPS

1. متغیرهای `.env.example` را روی سرور تنظیم کنید (`UPLOAD_DIR=/var/www/mahkam-uploads`)
2. دایرکتوری آپلود و location Nginx برای `/uploads/` — `docs/PRODUCTION.md` / `docs/nginx/README.md`
3. `npm ci && npx prisma generate && npm run build`
4. PM2: `pm2 start npm --name mahkam -- start && pm2 save`
5. Schema: فقط در صورت نیاز `npx prisma db push` — هرگز `migrate reset` / seed روی پروداکشن
6. کرون روزانه برای `/api/cron/sync-prices`

مهاجرت Prisma در آینده: `docs/PRISMA_MIGRATIONS.md`.

## ساختار

- `src/app/(site)` — صفحات عمومی
- `src/app/(admin)/admin` — پنل فارسی
- `src/app/api/admin/uploads` — آپلود امن تصویر
- `src/lib/prices/` — لایودیتا + TGJU + snapshots
- `prisma/schema.prisma` — مدل داده
- `docs/` — عملیات پروداکشن، Nginx، migrations
