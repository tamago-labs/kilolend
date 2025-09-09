# Kilo Point Bot Dockerfile for KiloLend Protocol
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
    adduser -S kilopoint -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R kilopoint:nodejs /app
USER kilopoint

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Kilo point bot health check')" || exit 1

# Expose port (if needed for monitoring)
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV POLL_INTERVAL_SECONDS=60
ENV SCAN_WINDOW_SECONDS=60
ENV MAX_BLOCKS_PER_SCAN=100
ENV DAILY_KILO_DISTRIBUTION=100000

# Start the application
CMD ["npm", "start"]
