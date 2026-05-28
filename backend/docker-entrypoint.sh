#!/bin/sh
# docker-entrypoint.sh - Ensures proper permissions for Docker volumes (uploads)
# Runs as root (temporarily), fixes ownership, then switches to non-root user for app.

set -e

# Create uploads directory if it doesn't exist (for fresh volumes)
mkdir -p /app/uploads

# Fix ownership so the nodeuser (non-root) can write audio files, clones, etc.
# This fixes the common Docker volume permission issue on VPS deploys.
chown -R nodeuser:nodejs /app/uploads 2>/dev/null || true

# Also ensure proper perms on any other runtime-writable paths if added later
# (e.g. if using local temp dirs)

echo "[entrypoint] Permissions fixed for uploads volume. Starting as non-root user..."

# Use su-exec (lightweight, installed in Dockerfile) to drop privileges and run the CMD
exec su-exec nodeuser "$@"
