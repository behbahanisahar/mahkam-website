# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
  npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
# Source last so dependency layer stays cached when only app code changes
COPY . .

ARG NEXT_PUBLIC_SITE_URL=https://mahkamcable.ir
ARG NEXT_PUBLIC_SITE_NAME="گسترش سیم و کابل مهکام"
ARG NEXT_PUBLIC_HERO_IMAGE=/images/hero-shining-night-1920.webp
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_HERO_IMAGE=$NEXT_PUBLIC_HERO_IMAGE
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Avoid OOM kills on small VPS during Next compile
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN npx prisma generate
# Reuse Next compile cache between builds on the same VPS
RUN --mount=type=cache,target=/app/.next/cache \
  npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/var/www/mahkam-uploads

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.ts ./

RUN mkdir -p /var/www/mahkam-uploads/products

EXPOSE 3000
CMD ["npm", "run", "start"]
