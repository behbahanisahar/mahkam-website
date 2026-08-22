#!/usr/bin/env bash
# Rebuild Next image on the VPS using Docker layer cache (NOT --no-cache).
# Run ON THE VPS from /var/www/mahkam-website after mac-rsync.sh
#
# Usage:
#   bash scripts/deploy/vps-rebuild.sh
#   bash scripts/deploy/vps-rebuild.sh --sync-catalog

set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/mahkam-website}"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  if [[ -f scripts/deploy/restore-env.sh ]]; then
    echo "→ .env missing — trying restore-env.sh"
    bash scripts/deploy/restore-env.sh || true
  fi
fi

if [[ ! -f .env ]]; then
  echo "Missing $APP_DIR/.env — abort"
  echo "Run: bash scripts/deploy/restore-env.sh"
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "→ docker compose build (old container stays up until swap)"
if ! docker compose build; then
  echo "✗ build failed — restarting previous container if any"
  docker compose up -d || true
  docker logs mahkam-website --tail 60 2>&1 || true
  exit 1
fi

echo "→ docker compose up -d"
docker compose up -d --remove-orphans

echo "→ wait for app on :3000"
ok=0
for i in $(seq 1 20); do
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
  if [[ "$code" == "200" || "$code" == "307" ]]; then
    echo "✓ app healthy (HTTP $code)"
    ok=1
    break
  fi
  echo "  attempt $i/20 — HTTP $code"
  sleep 3
done

if [[ "$ok" -eq 0 ]]; then
  echo "✗ app did not respond on :3000"
  docker logs mahkam-website --tail 80 2>&1 || true
  exit 1
fi

if [[ "${1:-}" == "--sync-catalog" ]]; then
  echo "→ sync-afshan-catalog (updates imagePath + product copy in DB)"
  docker exec mahkam-website node scripts/sync-afshan-catalog.mjs || true
  echo "→ sync-aluminum-catalog"
  docker exec mahkam-website node scripts/sync-aluminum-catalog.mjs || true
  echo "→ sync-flex-catalog"
  docker exec mahkam-website node scripts/sync-flex-catalog.mjs || true
  echo "→ sync-maftoli-catalog"
  docker exec mahkam-website node scripts/sync-maftoli-catalog.mjs || true
  echo "→ sync-site-phones"
  docker exec mahkam-website node scripts/sync-site-phones.mjs || true
else
  echo "tip: pass --sync-catalog to push new imagePath versions into DB"
fi

echo "→ health"
sleep 3
curl -sS -o /dev/null -w "home=%{http_code}\n" https://mahkamcable.ir/ || true
curl -sS https://mahkamcable.ir/ | grep -o 'هنوز دسته‌بندی[^<]*' || echo "menu: categories OK (empty message not found)"

if [[ -f scripts/deploy/nginx-error-pages.sh ]]; then
  echo "→ nginx static 502 page"
  chmod +x scripts/deploy/nginx-error-pages.sh
  bash scripts/deploy/nginx-error-pages.sh || echo "WARN: nginx error pages — run manually with sudo"
fi

echo "✓ done"
