FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS production-build
RUN npm install --only=production && npm cache clean --force
COPY . .

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy built application
COPY --from=production-build --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=production-build --chown=nodeuser:nodejs /app .

# Create uploads directory
RUN mkdir -p uploads/documents uploads/receipts uploads/profiles logs
RUN chown -R nodeuser:nodejs uploads logs

USER nodeuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]