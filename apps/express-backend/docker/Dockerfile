FROM node:20-alpine

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

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["pnpm", "run", "dev", "--filter=express-backend"] 