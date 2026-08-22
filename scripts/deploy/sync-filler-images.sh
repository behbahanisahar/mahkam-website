#!/usr/bin/env bash
# Regenerate فیلردار photos + sync DB image URLs on VPS.
# Usage (on VPS after git pull):
#   bash scripts/deploy/sync-filler-images.sh

set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/mahkam-website}"
cd "$APP_DIR"

echo "→ sync-flex-catalog (filler imagePath → ProductImage.url)"
docker exec mahkam-website node scripts/sync-flex-catalog.mjs

echo "→ verify sample URL in DB output above should include ?v=card11"
curl -sS "https://mahkamcable.ir/products/cable-flex-filler-3x10" | grep -o 'cable-flex-filler[^" ]*' | head -3 || true
echo "✓ done — hard-refresh /products?category=cable-flex-filler"
