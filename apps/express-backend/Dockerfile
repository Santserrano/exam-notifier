FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/express-backend/package.json ./apps/express-backend/
COPY packages/database/package.json ./packages/database/
COPY packages/business/package.json ./packages/business/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/express-backend/src ./apps/express-backend/src
COPY packages/database/src ./packages/database/src
COPY packages/business/src ./packages/business/src

# Copy tsconfig files
COPY apps/express-backend/tsconfig.json ./apps/express-backend/
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/business/tsconfig.json ./packages/business/

# Build the application
RUN pnpm run build --filter=express-backend

# Production image
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and built code
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/express-backend/package.json ./apps/express-backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/business/package.json ./packages/business/
COPY --from=builder /app/apps/express-backend/dist ./apps/express-backend/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/business/dist ./packages/business/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "apps/express-backend/dist/index.js"] 