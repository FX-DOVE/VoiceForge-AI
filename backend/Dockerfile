# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling in Docker
RUN apk add --no-cache dumb-init

# Create non-root user for security (best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set proper permissions
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5000

# Environment
ENV NODE_ENV=production
ENV PORT=5000

# Use dumb-init to handle signals properly (important for Docker)
ENTRYPOINT ["dumb-init", "--"]

# Start the API server (uses "start" script from package.json)
CMD ["npm", "start"]
