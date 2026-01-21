# =============================================================================
# Synapse'26 - Multi-stage Dockerfile for Next.js
# Optimized for production builds with minimal image size
# Enhanced for mobile device performance
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# Install only production dependencies for the final image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 2: Builder
# Build the Next.js application with mobile optimizations
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Mobile optimization build arguments
ARG ENABLE_MOBILE_OPTIMIZATIONS=true
ENV ENABLE_MOBILE_OPTIMIZATIONS=${ENABLE_MOBILE_OPTIMIZATIONS}

# Build the application with optimizations
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner
# Production-ready minimal image optimized for mobile performance
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Install additional packages for performance monitoring and compression
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# =============================================================================
# Mobile Optimization Environment Variables
# =============================================================================

# Enable aggressive image optimization for mobile
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV NEXT_IMAGE_OPTIMIZATION=true

# Set memory limits appropriate for mobile-first serving
# Lower memory usage = faster response times on constrained networks
ENV NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# Enable HTTP/2 for better mobile performance (multiplexing)
ENV NEXT_HTTP2=true

# Compression settings for mobile bandwidth optimization
ENV NEXT_COMPRESS=true
ENV COMPRESSION_LEVEL=6

# Cache control for mobile devices (aggressive caching)
ENV CACHE_CONTROL_MAX_AGE=31536000
ENV STALE_WHILE_REVALIDATE=86400

# =============================================================================
# Security & User Setup
# =============================================================================

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create cache directories with proper permissions
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy standalone output (using standalone output mode for minimal bundle)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# =============================================================================
# Mobile-Optimized Server Configuration
# =============================================================================

# Create optimized server configuration for mobile
RUN echo '{\
  "compress": true,\
  "poweredByHeader": false,\
  "generateEtags": true,\
  "httpAgentOptions": {\
    "keepAlive": true,\
    "keepAliveMsecs": 30000\
  }\
}' > /app/server-config.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# =============================================================================
# Health Check - Optimized for mobile monitoring
# =============================================================================
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# =============================================================================
# Labels for container metadata
# =============================================================================
LABEL org.opencontainers.image.title="Synapse'26"
LABEL org.opencontainers.image.description="Synapse'26 Web Application - Mobile Optimized"
LABEL org.opencontainers.image.vendor="Synapse"
LABEL mobile.optimized="true"
LABEL mobile.responsive="true"
LABEL mobile.pwa.ready="true"

# =============================================================================
# Start Command
# =============================================================================
CMD ["node", "server.js"]
