#!/usr/bin/env bash
# Restore production .env on the VPS from known backup locations.
#
# Usage:
#   bash scripts/deploy/restore-env.sh
#   bash scripts/deploy/restore-env.sh /path/to/.env.backup

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/mahkam-website}"
TARGET="$APP_DIR/.env"

if [[ -n "${1:-}" ]]; then
  if [[ ! -f "$1" ]]; then
    echo "Backup file not found: $1"
    exit 1
  fi
  cp -a "$1" "$TARGET"
  chmod 600 "$TARGET"
  echo "✓ restored .env from $1"
  exit 0
fi

if [[ -f "$TARGET" ]]; then
  echo "✓ .env already exists at $TARGET"
  exit 0
fi

pick_latest() {
  local pattern="$1"
  local latest=""
  shopt -s nullglob
  local files=( $pattern )
  shopt -u nullglob
  if ((${#files[@]} == 0)); then
    return 1
  fi
  latest="$(ls -1t "${files[@]}" 2>/dev/null | head -1)"
  if [[ -n "$latest" && -f "$latest" ]]; then
    echo "$latest"
    return 0
  fi
  return 1
}

candidates=()

if src="$(pick_latest /root/mahkam.env.bak.*)"; then
  candidates+=("$src")
fi

if src="$(pick_latest /var/www/mahkam-website.bak.*/.env)"; then
  candidates+=("$src")
fi

if src="$(pick_latest /var/www/mahkam-website/.env.bak.*)"; then
  candidates+=("$src")
fi

if ((${#candidates[@]} > 0)); then
  src="${candidates[0]}"
  cp -a "$src" "$TARGET"
  chmod 600 "$TARGET"
  echo "✓ restored .env from $src"
  exit 0
fi

echo "✗ no .env backup found on this server."
echo
echo "Look manually:"
echo "  ls -la /root/mahkam.env.bak.*"
echo "  ls -la /var/www/mahkam-website.bak.*/.env"
echo
echo "If you find one:"
echo "  cp /root/mahkam.env.bak.YYYY-MM-DD-HHMMSS $TARGET"
echo "  chmod 600 $TARGET"
echo
echo "Or recreate from template (you must fill secrets):"
echo "  cp $APP_DIR/.env.example $TARGET"
echo "  nano $TARGET"
echo
echo "Required: DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL"
exit 1
