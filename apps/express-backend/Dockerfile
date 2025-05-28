FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/express-backend/package.json ./apps/express-backend/
COPY packages/database/package.json ./packages/database/
COPY config/tsconfig/package.json ./config/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY apps/express-backend/src ./apps/express-backend/src
COPY apps/express-backend/tsup.config.ts ./apps/express-backend/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsup.config.ts ./packages/database/

# Copy tsconfig files
COPY apps/express-backend/tsconfig.json ./apps/express-backend/
COPY packages/database/tsconfig.json ./packages/database/

# Copy turbo config
COPY turbo.json ./

# Copy prisma schema
COPY packages/database/prisma ./packages/database/prisma

# Copiar el paquete eslint-config completo
COPY config/eslint ./config/eslint

# Copiar el paquete tsconfig completo
COPY config/tsconfig ./config/tsconfig

# Build the application
RUN pnpm run build --filter=@exam-notifier/database --filter=express-backend

# Production image
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and built code
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/express-backend/package.json ./apps/express-backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/apps/express-backend/dist ./apps/express-backend/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "apps/express-backend/dist/index.js"] 