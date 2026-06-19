FROM node:20-alpine AS base

# ── deps: only what server.js needs (better-sqlite3 native build) ──
# We install better-sqlite3 directly rather than `npm ci`, because the
# committed package-lock.json still references the old Next.js/Prisma stack
# while the live app is the plain Node server in server.js.
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install --omit=dev better-sqlite3@^12.10.1

# ── runner: plain Node HTTP server serving the static frontend/ ──
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 selverine

COPY --from=deps /app/node_modules ./node_modules
COPY server.js database.js ./
COPY frontend ./frontend

# Writable app dir so the SQLite file can be created on first request
RUN chown -R selverine:nodejs /app
USER selverine

EXPOSE 3000
CMD ["node", "server.js"]
