# =============================================================================
# BrumKit — Multi-stage Dockerfile for apps/web (Next.js 15 standalone)
# Build context: repo root
# Usage: docker build -f apps/web/Dockerfile -t brumkit-web .
# =============================================================================

# =============================================================================
# Stage 1 — base: Prune the monorepo with turbo
# =============================================================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install --global turbo@^2 --no-fund --no-audit

# Copy full monorepo (.dockerignore keeps the context lean)
COPY . .

# Prune to only packages needed by apps/web
RUN turbo prune web --docker

# =============================================================================
# Stage 2 — installer: Install dependencies on the pruned workspace
# =============================================================================
FROM node:20-alpine AS installer

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install --global pnpm@10.0.0 --no-fund --no-audit

# Copy manifests first for optimal layer caching
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --no-frozen-lockfile

# Copy full pruned source after dependency installation
COPY --from=base /app/out/full/ .

# Generate Prisma client (does not connect to the database; schema-only step)
RUN pnpm --filter @repo/database db:generate

# =============================================================================
# Stage 3 — builder: Build the Next.js application
# =============================================================================
FROM node:20-alpine AS builder

RUN npm install --global pnpm@10.0.0 --no-fund --no-audit

WORKDIR /app

# NEXT_PUBLIC_* vars are baked into the client bundle at build time.
# Pass these via --build-arg when the deployment URL is known.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Dummy DATABASE_URL satisfies env checks during build; no DB connection is made.
ARG DATABASE_URL=postgresql://localhost/build_placeholder

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    DATABASE_URL=$DATABASE_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=installer /app .

RUN pnpm --filter web build:docker

# =============================================================================
# Stage 4 — runner: Minimal production image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    NEXTJS_PORT=3000 \
    HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output mirrors the monorepo structure:
#   apps/web/.next/standalone/
#     apps/web/server.js   ← entry point
#     node_modules/        ← minimal inlined deps
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
