# Oracle Bot Dockerfile for KiloLend Protocol
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
    adduser -S oracle -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R oracle:nodejs /app
USER oracle

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Oracle bot health check')" || exit 1

# Expose port (if needed for monitoring)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV UPDATE_INTERVAL_MINUTES=120

# Start the application
CMD ["npm", "start"]
