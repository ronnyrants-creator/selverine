FROM node:20-alpine AS base

# ── deps: native build for better-sqlite3 + pure-JS bcryptjs ──
# We install the runtime deps directly (not `npm ci`) because the committed
# lock history references an older stack while the live app is the plain Node
# server in server.js. Keeping this explicit makes the image reproducible.
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install --omit=dev better-sqlite3@^12.10.1 bcryptjs@^2.4.3

# ── runner: plain Node HTTP server serving frontend/ + API + /admin ──
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Persist SQLite on a mounted volume by default (mount a volume at /data in EasyPanel).
ENV DB_PATH=/data/selverine.db

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 selverine \
 && mkdir -p /data

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js database.js ./
COPY src ./src
COPY frontend ./frontend

# Writable app + data dirs so the SQLite file can be created at runtime.
RUN chown -R selverine:nodejs /app /data
USER selverine

EXPOSE 3000
CMD ["node", "server.js"]
