# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public site URL is inlined into the client bundle at build time
ARG NEXT_PUBLIC_SITE_URL=https://mahkamcable.ir
ARG NEXT_PUBLIC_SITE_NAME="گسترش سیم و کابل مهکام"
ARG NEXT_PUBLIC_HERO_IMAGE=/images/hero-minimal.webp
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_HERO_IMAGE=$NEXT_PUBLIC_HERO_IMAGE

# Optional: allows generateStaticParams/sitemap to query Postgres during build.
# Passed only into this stage — not baked into the runtime image as a default.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Prisma Client must exist before `next build`
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Default matches VPS mount; override via Compose/env if needed
ENV UPLOAD_DIR=/var/www/mahkam-uploads

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./

# Ensure upload mount point exists inside the container
RUN mkdir -p /var/www/mahkam-uploads/products

EXPOSE 3000

# Host volume /var/www/mahkam-uploads must be writable by this process.
# Prefer fixing ownership on the VPS (see docs/PRODUCTION.md).
CMD ["npm", "run", "start"]
