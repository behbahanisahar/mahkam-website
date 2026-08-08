# Nginx — prepare only; do not enable .ir cutover until DNS + cert exist

Server IP: `85.208.255.211`

## Architecture

```text
Internet
  ↓
Nginx
  ├── /uploads/*  → alias /var/www/mahkam-uploads/*
  └── everything else → Next.js :3000 (PM2)
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

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
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

## Phase A (current) — keep .com working

Serve the Next.js app (PM2 on port 3000) for `mahkamcable.com` / `www.mahkamcable.com` with existing SSL.

Do **not** add `.com` → `.ir` redirects yet.

Add the `/uploads/` location above to the current `.com` config.

## Phase B (when .ir A-record → 85.208.255.211 and cert issued)

1. Issue cert for `mahkamcable.ir` and `www.mahkamcable.ir` (certbot).
2. Switch app env to `https://mahkamcable.ir`.
3. Rebuild/restart PM2.
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
