# Richiede output: 'standalone' in next.config.ts (già configurato)

# ---- base ----
FROM node:20-alpine AS base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --include=dev

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Utente non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Artefatti standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI + tsx per eseguire migrazioni e seed via docker exec
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma      ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma            ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines   ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/tsx          ./node_modules/.bin/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx               ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tslib             ./node_modules/tslib
COPY --from=builder --chown=nextjs:nodejs /app/prisma                         ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts               ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json                  ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json                   ./package.json

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
