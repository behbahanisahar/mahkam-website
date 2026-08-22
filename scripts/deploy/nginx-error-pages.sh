#!/usr/bin/env bash
# Install Mahkam static 502/503/504 error page into the live nginx site config.
# Run ON THE VPS as root (or with sudo).
#
# Usage:
#   sudo bash scripts/deploy/nginx-error-pages.sh
#   sudo bash scripts/deploy/nginx-error-pages.sh /etc/nginx/sites-enabled/mahkamcable.ir

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/mahkam-website}"
SNIPPET="$APP_DIR/docs/nginx/error-pages.conf"
MARKER="# mahkam-error-pages"

if [[ ! -f "$SNIPPET" ]]; then
  echo "Missing snippet: $SNIPPET"
  exit 1
fi

if [[ ! -f "$APP_DIR/public/errors/offline.html" ]]; then
  echo "Missing page: $APP_DIR/public/errors/offline.html"
  exit 1
fi

pick_site_conf() {
  if [[ -n "${1:-}" ]]; then
    echo "$1"
    return
  fi
  for f in \
    /etc/nginx/sites-enabled/mahkamcable.ir \
    /etc/nginx/sites-enabled/mahkamcable.com \
    /etc/nginx/sites-enabled/default; do
    if [[ -f "$f" ]]; then
      echo "$f"
      return
    fi
  done
  echo ""
}

SITE_CONF="$(pick_site_conf "${1:-}")"
if [[ -z "$SITE_CONF" ]]; then
  echo "Could not find nginx site config. Pass path as first argument."
  exit 1
fi

echo "→ site config: $SITE_CONF"

if grep -q "$MARKER" "$SITE_CONF"; then
  echo "✓ error-pages block already present — reload nginx only"
else
  TMP="$(mktemp)"
  awk -v marker="$MARKER" -v snippet="$SNIPPET" '
    BEGIN { inserted=0 }
    /location \// && inserted==0 && /proxy_pass/ {
      print marker
      while ((getline line < snippet) > 0) print line
      close(snippet)
      print ""
      inserted=1
    }
    { print }
    END {
      if (inserted==0) {
        print ""
        print marker
        while ((getline line < snippet) > 0) print line
        close(snippet)
      }
    }
  ' "$SITE_CONF" > "$TMP"
  cp -a "$SITE_CONF" "${SITE_CONF}.bak.$(date +%F-%H%M%S)"
  mv "$TMP" "$SITE_CONF"
  echo "✓ inserted error-pages block before first proxy location"
fi

nginx -t
systemctl reload nginx

echo "→ verify"
curl -sS -o /dev/null -w "offline.html HTTP %{http_code}\n" "https://mahkamcable.ir/errors/offline.html" || true
echo "✓ done"
