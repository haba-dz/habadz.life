# syntax=docker/dockerfile:1

########## deps ##########
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

########## build ##########
# Build runs under Node, not bun: bun 1.3 segfaults running `next build` for
# Next 16 inside linux containers. node:22-slim (glibc) matches the
# platform-specific optional deps (lightningcss) that bun installed above.
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are inlined into the client bundle at build time — they are
# public by nature (shipped to browsers), so plain build args are fine.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_DEPLOYMENT_ID
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID \
    NEXT_TELEMETRY_DISABLED=1

# Server-actions key via BuildKit secret (a build ARG would leak into image
# history). Keep it stable across builds so in-flight encrypted action
# closures survive a redeploy.
RUN --mount=type=secret,id=next_actions_key \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_actions_key 2>/dev/null || true)" \
    ./node_modules/.bin/next build

########## runtime ##########
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
