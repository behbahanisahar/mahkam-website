# Production operations (Ubuntu VPS + Nginx + PM2)

## Domains

| Domain | Role |
|---|---|
| `https://mahkamcable.com` | Current live site — **do not break** |
| `https://mahkamcable.ir` | Intended primary/canonical after DNS + SSL |

Until `.ir` points to `85.208.255.211` and a certificate exists:

1. Keep `NEXT_PUBLIC_SITE_URL=https://mahkamcable.com`
2. Keep `NEXTAUTH_URL=https://mahkamcable.com`
3. Do **not** enable `.com` → `.ir` redirects in Nginx

When ready to cut over: see `docs/nginx/` and switch both env vars to `https://mahkamcable.ir`.

## Required environment variables

See `.env.example`. Critical production keys:

- `DATABASE_URL` — Postgres on the VPS
- `AUTH_SECRET` — long random secret
- `NEXTAUTH_URL` — public origin
- `NEXT_PUBLIC_SITE_URL` — same public origin (canonical/SEO)
- `CRON_SECRET` — protect `/api/cron/sync-prices`
- `UPLOAD_DIR` — persistent product uploads, e.g. `/var/www/mahkam-uploads`

## Self-hosted product uploads

Uploads are **not** stored in Git, `.next`, or `public/`.

```bash
sudo mkdir -p /var/www/mahkam-uploads/products
# App user must write; Nginx must read. Adjust users to match your VPS.
sudo chown -R deploy:www-data /var/www/mahkam-uploads
sudo find /var/www/mahkam-uploads -type d -exec chmod 755 {} \;
sudo find /var/www/mahkam-uploads -type f -exec chmod 644 {} \;
```

In the app `.env` (not committed):

```bash
UPLOAD_DIR="/var/www/mahkam-uploads"
```

Admin uploads via `POST /api/admin/uploads` (session required). Files are optimized with Sharp to WebP and saved as:

`/var/www/mahkam-uploads/products/{uuid}.webp`

Public URL stored in `ProductImage.url`:

`/uploads/products/{uuid}.webp`

Nginx serves `/uploads/` directly (see `docs/nginx/README.md`). Do **not** use `chmod 777`.

### Upload backups

```bash
# alongside DB dumps
rsync -a /var/www/mahkam-uploads/ /var/backups/mahkam/uploads-$(date +%F)/
find /var/backups/mahkam -maxdepth 1 -type d -name 'uploads-*' -mtime +14 -exec rm -rf {} \;
```

### Legacy UploadThing / external URLs

Existing `ProductImage.url` values (UploadThing CDN, Unsplash, `/images/...`) are **left untouched**. They keep working until an admin replaces the image. There is **no automatic migration or deletion** of remote CDN files.

## PM2

Typical process:

```bash
npm ci
npx prisma generate
npx prisma db push   # only when schema changed; never migrate reset / never seed on prod
npm run build
pm2 start npm --name mahkam -- start
pm2 save
pm2 startup
```

App must survive: `pm2 restart mahkam`, server reboot (with `pm2 startup`), fresh `npm ci` + `build`. Uploaded files under `UPLOAD_DIR` survive all of these.

## Cron (VPS — not Vercel)

`vercel.json` crons do **nothing** on this VPS. Use system cron or systemd timer:

```cron
0 6 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://mahkamcable.com/api/cron/sync-prices" >/tmp/mahkam-cron.log 2>&1
```

After domain cutover, change the hostname to `mahkamcable.ir`.

## Database backups

```bash
pg_dump "$DATABASE_URL" -Fc -f "/var/backups/mahkam/mahkam-$(date +%F).dump"
find /var/backups/mahkam -name '*.dump' -mtime +14 -delete
```

Also copy off-server weekly. Test restore quarterly on a staging DB.

## Prisma migrations (safe future path — do not run reset)

See `docs/PRISMA_MIGRATIONS.md`. Never use `prisma migrate reset` or `db seed` on production.

## Seed safety

`npm run db:seed` is blocked in production unless `ALLOW_PRODUCTION_SEED=YES_I_UNDERSTAND` is set.
