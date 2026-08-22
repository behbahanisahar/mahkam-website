#!/usr/bin/env bash
# Emergency: site shows 502 — restart container or rebuild if needed.
# Run ON THE VPS: bash scripts/deploy/vps-recover.sh

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
  echo "Missing $APP_DIR/.env"
  echo "Run: bash scripts/deploy/restore-env.sh"
  exit 1
fi

echo "→ git sync"
git fetch origin main
git reset --hard origin/main

echo "→ try restart existing image"
if docker compose up -d; then
  sleep 5
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
  if [[ "$code" == "200" || "$code" == "307" ]]; then
    echo "✓ app back on :3000 (HTTP $code)"
    exit 0
  fi
fi

echo "→ restart failed — full rebuild"
bash scripts/deploy/vps-rebuild.sh --sync-catalog
