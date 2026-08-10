# Production operations (Ubuntu VPS + Nginx + Docker)

## Domains

| Domain | Role |
|---|---|
| `https://mahkamcable.com` | Legacy live host if still in use |
| `https://mahkamcable.ir` | Intended primary/canonical |

Set both `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to the public origin that Nginx serves (currently intended: `https://mahkamcable.ir`).

## Architecture

```text
Internet → Nginx
  ├── /uploads/*  → alias /var/www/mahkam-uploads/
  └── /*          → Docker container :3000 (Next.js)

PostgreSQL on the VPS host (not in Compose)
  ← container via DATABASE_URL …@172.17.0.1:5432/mahkam
```

## Required environment variables

See `.env.example`. Keep a real `.env` only on the VPS at `/var/www/mahkam-website/.env` (never commit).

Critical keys:

- `DATABASE_URL` — host Postgres from the container, e.g. `…@172.17.0.1:5432/mahkam`
- `AUTH_SECRET` — long random secret
- `NEXTAUTH_URL` — public origin
- `NEXT_PUBLIC_SITE_URL` — same public origin (canonical/SEO; also a Docker **build** arg)
- `CRON_SECRET` — protect `/api/cron/sync-prices`
- `UPLOAD_DIR=/var/www/mahkam-uploads`

## Docker Compose

Repo root: `Dockerfile`, `docker-compose.yml`.

Production Compose uses **`network_mode: host`** so the app reaches Postgres at `127.0.0.1:5432` (same as the VPS). Set:

```bash
DATABASE_URL="postgresql://saharbehbahani:PASSWORD@127.0.0.1:5432/mahkam?schema=public"
```

```bash
cd /var/www/mahkam-website
# .env must exist here (secrets)
docker compose down
docker compose build --no-cache
docker compose up -d
docker exec mahkam-website node scripts/sync-afshan-catalog.mjs
```

## Self-hosted product uploads

Uploads are **not** stored in Git, `.next`, or `public/`.

```bash
sudo mkdir -p /var/www/mahkam-uploads/products
# Container process must write; Nginx must read.
# If the container runs as root, root ownership on the host dir is fine:
sudo chown -R root:www-data /var/www/mahkam-uploads
sudo find /var/www/mahkam-uploads -type d -exec chmod 755 {} \;
sudo find /var/www/mahkam-uploads -type f -exec chmod 644 {} \;
```

Admin uploads via `POST /api/admin/uploads` (session required). Files are optimized with Sharp to WebP and saved as:

`/var/www/mahkam-uploads/products/{uuid}.webp`

Public URL stored in `ProductImage.url`:

`/uploads/products/{uuid}.webp`

Nginx should serve `/uploads/` directly (see `docs/nginx/README.md`). Next.js also has a safe fallback route at `src/app/uploads/[...path]/route.ts`. Do **not** use `chmod 777`.

### Upload backups

```bash
# alongside DB dumps
rsync -a /var/www/mahkam-uploads/ /var/backups/mahkam/uploads-$(date +%F)/
find /var/backups/mahkam -maxdepth 1 -type d -name 'uploads-*' -mtime +14 -exec rm -rf {} \;
```

### Legacy UploadThing / external URLs

Existing `ProductImage.url` values (UploadThing CDN, Unsplash, `/images/...`) are **left untouched**. They keep working until an admin replaces the image. There is **no automatic migration or deletion** of remote CDN files.

## Cron (VPS — not Vercel)

`vercel.json` crons do **nothing** on this VPS. Use system cron or systemd timer:

```cron
0 6 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://mahkamcable.ir/api/cron/sync-prices" >/tmp/mahkam-cron.log 2>&1
```

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
