# Nginx — prepare only; do not enable .ir cutover until DNS + cert exist

Server IP: `85.208.255.211`

## Architecture

```text
Internet
  ↓
Nginx
  ├── /uploads/*       → alias /var/www/mahkam-uploads/*
  ├── /_next/static/*  → Next :3000 (long cache)
  ├── /images/*        → Next :3000 (long cache)
  └── everything else  → Next.js :3000 (Docker Compose)
```

## Product uploads (add to the live .com server block now)

Inside the existing HTTPS `server` for `mahkamcable.com` (and later `.ir`):

```nginx
# Persistent product images — NOT proxied through Next.js
location /uploads/ {
    alias /var/www/mahkam-uploads/;
    access_log off;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    add_header X-Content-Type-Options nosniff;
    # Prevent script execution if mis-uploaded
    location ~* \.(php|exe|sh|cgi)$ { deny all; }
}

# Public catalog / hero / section images — serve from disk (skip Node)
# APP_DIR is usually /var/www/mahkam-website
location ^~ /images/ {
    alias /var/www/mahkam-website/public/images/;
    access_log off;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    add_header X-Content-Type-Options nosniff;
    try_files $uri @next_images;
}

# Fallback if a file is missing from the host bind (e.g. only inside Docker)
location @next_images {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    access_log off;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}

# Hashed Next build assets — long cache at the edge
location ^~ /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Persistent product images — NOT proxied through Next.js
location /uploads/ {
    alias /var/www/mahkam-uploads/;
    access_log off;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    add_header X-Content-Type-Options nosniff;
    location ~* \.(php|exe|sh|cgi)$ { deny all; }
}

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_intercept_errors on;
}

# Static friendly pages when Next/Docker is down (502/503/504)
location ^~ /errors/ {
    alias /var/www/mahkam-website/public/errors/;
    default_type text/html;
    charset utf-8;
    access_log off;
}

error_page 502 503 504 /errors/offline.html;
```

**Trailing slash note:** `location /uploads/` + `alias /var/www/mahkam-uploads/;` maps
`/uploads/products/x.webp` → `/var/www/mahkam-uploads/products/x.webp`.

Create the directory before reload:

```bash
sudo mkdir -p /var/www/mahkam-uploads/products
sudo chown -R deploy:www-data /var/www/mahkam-uploads
sudo chmod 755 /var/www/mahkam-uploads /var/www/mahkam-uploads/products
sudo nginx -t && sudo systemctl reload nginx
```

## Phase A (current) — keep live host working

Serve the Next.js app (Docker on port 3000) for the active domain with existing SSL.

Do **not** add `.com` → `.ir` redirects until DNS + cert for `.ir` are ready.

Add the `/uploads/` location above to the current HTTPS server block.

## Phase B (when .ir A-record → 85.208.255.211 and cert issued)

1. Issue cert for `mahkamcable.ir` and `www.mahkamcable.ir` (certbot).
2. Switch app env to `https://mahkamcable.ir`.
3. Rebuild/restart Docker: `cd /var/www/mahkam-website && docker compose up -d --build`
4. Enable the redirect server blocks below (include the same `/uploads/` location on the primary host).
5. Verify Search Console property for `.ir`.

### Intended final layout (example)

```nginx
server {
    listen 443 ssl http2;
    server_name mahkamcable.com www.mahkamcable.com;
    return 301 https://mahkamcable.ir$request_uri;
}

server {
    listen 80;
    server_name mahkamcable.com www.mahkamcable.com mahkamcable.ir www.mahkamcable.ir;
    return 301 https://mahkamcable.ir$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.mahkamcable.ir;
    return 301 https://mahkamcable.ir$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mahkamcable.ir;
    # ssl_certificate ... (.ir cert)

    location /uploads/ {
        alias /var/www/mahkam-uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Until Phase B, keep the existing working `.com` proxy config and only add `/uploads/`.
