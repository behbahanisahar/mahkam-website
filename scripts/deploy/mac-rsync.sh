#!/usr/bin/env bash
# Fast push from Mac → VPS (no 75MB tarball).
# Usage:
#   ./scripts/deploy/mac-rsync.sh
#   HOST=root@85.208.255.211 PORT=3031 ./scripts/deploy/mac-rsync.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="${HOST:-root@85.208.255.211}"
PORT="${PORT:-3031}"
REMOTE="${REMOTE:-/var/www/mahkam-website}"

cd "$ROOT"

if [[ "${SKIP_GENERATE:-}" == "1" ]]; then
  echo "→ skip catalog photo generate (SKIP_GENERATE=1)"
else
  echo "→ compose HD catalog photos from studio models"
  node scripts/generate-industrial-catalog-images.mjs
fi

echo "→ rsync code to ${HOST}:${REMOTE} (port ${PORT})"
rsync -az --delete \
  -e "ssh -p ${PORT}" \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .env \
  --exclude .env.local \
  --exclude .env.* \
  --exclude public/images/catalog-raw \
  --exclude '*.tsbuildinfo' \
  --exclude .DS_Store \
  --exclude mahkam-deploy.tar.gz \
  --exclude .data \
  --exclude coverage \
  --exclude .cursor \
  "${ROOT}/" "${HOST}:${REMOTE}/"

echo "✓ files synced (including fresh catalog images)"
echo
echo "On the VPS, pick ONE:"
echo "  A) Code + images:  bash scripts/deploy/vps-rebuild.sh --sync-catalog"
echo "  B) Code only:      bash scripts/deploy/vps-rebuild.sh"
echo "  C) Only clear cache/menu:    docker compose restart"
echo "  D) Only DB catalog sync:     docker exec mahkam-website node scripts/sync-afshan-catalog.mjs && docker exec mahkam-website node scripts/sync-aluminum-catalog.mjs && docker exec mahkam-website node scripts/sync-flex-catalog.mjs && docker exec mahkam-website node scripts/sync-maftoli-catalog.mjs"
echo "  E) NEXT_PUBLIC_* change:     bash scripts/deploy/vps-rebuild.sh --sync-catalog"
