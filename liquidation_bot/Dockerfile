# Liquidation Bot Dockerfile for KiloLend Protocol
FROM node:20.3.1-alpine

# Set working directory
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S liquidator -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R liquidator:nodejs /app
USER liquidator

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Liquidation bot health check')" || exit 1

# Expose port (if needed for monitoring)
EXPOSE 3002

# Set environment variables
ENV NODE_ENV=production
ENV CHECK_INTERVAL_SECONDS=300
ENV MIN_PROFIT_USD=10
ENV MAX_GAS_PRICE_GWEI=50
ENV MAX_LIQUIDATION_USD=10000
ENV MIN_COLLATERAL_USD=100

# Start the application
CMD ["npm", "start"]
