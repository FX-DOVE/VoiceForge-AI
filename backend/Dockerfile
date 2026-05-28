# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (smaller + more secure image)
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install tools needed for:
# - dumb-init: proper signal handling (Docker best practice)
# - su-exec: lightweight user switching in entrypoint (for volume permission fixes)
# - wget: for Docker healthchecks (used by compose)
RUN apk add --no-cache dumb-init su-exec wget

# Create non-root user (uid 1001). Note: entrypoint will temporarily run as root
# to fix Docker volume permissions, then switch to this user for the Node process.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code (pruned by .dockerignore - no node_modules, .env, uploads, etc.)
COPY . .

# Set base ownership (entrypoint will handle runtime volume dirs like uploads)
RUN chown -R nodeuser:nodejs /app

# Copy and prepare entrypoint (runs as root initially for chown on volumes, then drops privs)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    chown root:root /app/docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Environment
ENV NODE_ENV=production
ENV PORT=5000

# IMPORTANT:
# - We do NOT set USER here. The entrypoint starts as root (for volume chown fix),
#   then uses su-exec to switch to nodeuser before exec'ing the app.
# - This is the standard safe pattern for persistent Docker volumes on VPS.
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]

# Default command (overridden by worker in compose). Works for both api and worker.
CMD ["npm", "start"]
