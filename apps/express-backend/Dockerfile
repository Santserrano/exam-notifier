# -------- BUILDER STAGE --------
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm y OpenSSL
RUN apk add --no-cache openssl
RUN npm install -g pnpm@8.15.4

# Configurar npm y pnpm para mejor rendimiento
RUN npm config set registry https://registry.npmjs.org/ && \
    pnpm config set store-dir .pnpm-store && \
    pnpm config set network-timeout 100000 && \
    pnpm config set network-concurrency 1 && \
    pnpm config set fetch-retries 3 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000

# Copiar archivos de configuración
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
COPY ../../apps/express-backend/package.json ./apps/express-backend/
COPY ../../packages/database/package.json ./packages/database/
COPY ../../config/tsconfig/package.json ./config/tsconfig/

# Instalar dependencias con configuración optimizada
RUN pnpm install --frozen-lockfile --prefer-offline

# Copiar schema.prisma
COPY ../../packages/database/prisma ./packages/database/prisma

# Copiar el código fuente
COPY ../../apps/express-backend/src ./apps/express-backend/src
COPY ../../apps/express-backend/tsconfig.json ./apps/express-backend/
COPY ../../apps/express-backend/tsup.config.ts ./apps/express-backend/
COPY ../../packages/database/src ./packages/database/src
COPY ../../packages/database/tsconfig.json ./packages/database/
COPY ../../packages/database/tsup.config.ts ./packages/database/
COPY ../../config/tsconfig/base.json ./config/tsconfig/
COPY ../../config/tsconfig/node18.json ./config/tsconfig/

# Generar Prisma y compilar
RUN cd packages/database && pnpm exec prisma generate
RUN cd packages/database && pnpm run build
RUN cd apps/express-backend && pnpm run build

# -------- RUNTIME STAGE --------
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm y OpenSSL en producción
RUN apk add --no-cache openssl
RUN npm install -g pnpm@8.15.4

# Configurar npm y pnpm para mejor rendimiento
RUN npm config set registry https://registry.npmjs.org/ && \
    pnpm config set store-dir .pnpm-store && \
    pnpm config set network-timeout 100000 && \
    pnpm config set network-concurrency 1 && \
    pnpm config set fetch-retries 3 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000

# Copiar solo archivos necesarios desde builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/express-backend/package.json ./apps/express-backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/config/tsconfig/package.json ./config/tsconfig/
COPY --from=builder /app/apps/express-backend/dist ./apps/express-backend/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile --prefer-offline

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Exponer puerto
EXPOSE 3001

# Comando de arranque
CMD ["node", "apps/express-backend/dist/index.js"]    