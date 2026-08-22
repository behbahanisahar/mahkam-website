#!/usr/bin/env bash
# Run ON THE VPS after extracting a new deploy (as root).
# Usage: bash scripts/vps-redeploy-seo.sh

set -u
APP_DIR="${APP_DIR:-/var/www/mahkam-website}"
TAR="${1:-/tmp/mahkam-deploy.tar.gz}"

if [[ ! -f "$TAR" ]]; then
  echo "Missing tarball: $TAR"
  echo "From your Mac first:"
  echo "  scp -P 3031 /tmp/mahkam-deploy.tar.gz root@85.208.255.211:/tmp/"
  exit 1
fi

mkdir -p "$APP_DIR"
# Keep production env
if [[ -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env" "/root/mahkam.env.bak.$(date +%Y%m%d%H%M%S)"
fi

tar -xzf "$TAR" -C "$APP_DIR"
cd "$APP_DIR"

# Ensure canonical SEO URL
if grep -q '^NEXT_PUBLIC_SITE_URL=' .env 2>/dev/null; then
  sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://mahkamcable.ir|' .env
else
  echo 'NEXT_PUBLIC_SITE_URL=https://mahkamcable.ir' >> .env
fi

docker compose up -d --build
sleep 8
docker exec mahkam-website npx prisma db push --skip-generate || true
docker exec mahkam-website node scripts/sync-afshan-catalog.mjs || true
docker exec mahkam-website node scripts/sync-aluminum-catalog.mjs || true
docker exec mahkam-website node scripts/sync-flex-catalog.mjs || true
docker exec mahkam-website node scripts/sync-maftoli-catalog.mjs || true

echo "=== sitemap check ==="
curl -sS "https://mahkamcable.ir/sitemap.xml" | grep -c '<loc>' || true
curl -sS "https://mahkamcable.ir/sitemap.xml" | grep '/products/' | head -10 || true
echo "Done. Submit sitemap in Search Console if not already."
