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
  echo "Missing $APP_DIR/.env — abort"
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "→ docker compose build (cached layers) + up"
docker compose build
docker compose up -d

if [[ "${1:-}" == "--sync-catalog" ]]; then
  echo "→ sync-afshan-catalog (updates imagePath + product copy in DB)"
  docker exec mahkam-website node scripts/sync-afshan-catalog.mjs || true
  echo "→ sync-aluminum-catalog"
  docker exec mahkam-website node scripts/sync-aluminum-catalog.mjs || true
  echo "→ sync-flex-catalog"
  docker exec mahkam-website node scripts/sync-flex-catalog.mjs || true
  echo "→ sync-maftoli-catalog"
  docker exec mahkam-website node scripts/sync-maftoli-catalog.mjs || true
else
  echo "tip: pass --sync-catalog to push new imagePath versions into DB"
fi

echo "→ health"
sleep 3
curl -sS -o /dev/null -w "home=%{http_code}\n" https://mahkamcable.ir/ || true
curl -sS https://mahkamcable.ir/ | grep -o 'هنوز دسته‌بندی[^<]*' || echo "menu: categories OK (empty message not found)"
echo "✓ done"
