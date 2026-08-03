# گسترش سیم و کابل مهکام

وب‌سایت فارسی RTL برای شرکت گسترش سیم و کابل مهکام — کاتالوگ محصولات، سئو، پنل مدیریت فارسی، و ماژول نرخ دلار/مس/آلومینیوم.

## فناوری‌ها

- Next.js 16 (App Router) + TypeScript
- PostgreSQL (Railway) + Prisma
- Auth.js (ورود ادمین)
- Tailwind CSS 4 — تم شیشه‌ای روشن

## راه‌اندازی محلی

```bash
cp .env.example .env.local
# DATABASE_URL و AUTH_SECRET را پر کنید

npm install
npm run db:push
npm run db:seed
npm run dev
```

- سایت: http://localhost:3000
- پنل: http://localhost:3000/admin/login
- پیش‌فرض ادمین: `admin@mahkam.ir` / `admin123456` (از `.env.local`)

## نرخ‌ها

- **زنده:** کارت‌های بک‌آپ از TGJU + لینک به [لایودیتا](https://www.livedata.ir/)
- **تاریخی دلار:** همگام‌سازی TGJU در `DollarDaily` + جستجوی تاریخ شمسی

همگام‌سازی دستی:

```bash
curl "http://localhost:3000/api/cron/sync-prices?secret=CRON_SECRET&backfill=1"
```

روی Vercel کرون هر ۶ ساعت (`vercel.json`) اجرا می‌شود.

## استقرار

1. پروژه را در Vercel وصل کنید
2. متغیرهای `.env.example` را در Vercel تنظیم کنید
3. `CRON_SECRET` را برای کرون تنظیم کنید
4. پس از دیپلوی: `db:push` و `db:seed` را یک‌بار اجرا کنید

## ساختار

- `src/app/(site)` — صفحات عمومی
- `src/app/(admin)/admin` — پنل فارسی
- `src/lib/prices/tgju.ts` — همگام‌سازی نرخ
- `prisma/schema.prisma` — مدل داده
