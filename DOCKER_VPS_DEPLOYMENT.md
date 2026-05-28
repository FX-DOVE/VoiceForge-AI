# VoiceForge AI — Docker VPS Deployment Guide (Production Ready)

This guide shows how to host **both frontend and backend reliably** on a VPS using only Docker + Docker Compose with zero common gotchas (permission issues, lost uploads, broken healthchecks, wrong domains, SSL pain).

The stack is production-hardened:
- Persistent user-generated audio via named Docker volume
- Non-root containers with automatic volume permission fixes
- Working healthchecks
- Caddy (optional but recommended) for automatic HTTPS + reverse proxy inside Docker
- Full support for **your own domain** (build-time + runtime env)
- Easy updates, logs, and backups

---

## 1. Prerequisites

- A VPS (Ubuntu 22.04/24.04 recommended, 2GB+ RAM, 2+ vCPU for comfort)
- Docker + Docker Compose v2 installed (`curl -fsSL https://get.docker.com | sh`)
- A domain name with A record pointing to your VPS IP
- MongoDB (recommended: MongoDB Atlas — free tier works great; or install Mongo on the VPS)
- xAI API key (for TTS)
- (Optional but ideal) SMTP credentials for emails (Namecheap Private Email etc.)

---

## 2. Prepare Environment Files

```bash
# On your VPS (after cloning)
cd VoiceForge\ AI   # or whatever you named the folder (avoid spaces if possible)

# Backend env (most important)
cp backend/.env.example backend/.env
nano backend/.env   # or vim
```

**Critical variables to set in `backend/.env`** (others have sensible defaults):

```env
NODE_ENV=production
PORT=5000

# Your public domain (HTTPS). This is used for generated audio URLs, emails, etc.
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://yourdomain.com

MONGODB_URI=mongodb+srv://... (Atlas) or mongodb://host.docker.internal:27017/voiceforge

JWT_ACCESS_SECRET=replace-with-64+random-chars
JWT_REFRESH_SECRET=replace-with-another-64+random-chars

XAI_API_KEY=your-xai-key-here
XAI_TEAM_ID=...

# Email (highly recommended)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@yourdomain.com
SMTP_PASS=yourpassword
EMAIL_FROM=VoiceForge AI <support@yourdomain.com>

# Optional but useful
ADMIN_EMAIL=you@yourdomain.com
```

**For custom domain in Docker builds**, also create a `.env` file **in the project root** (next to docker-compose.yml):

```env
DOMAIN=yourdomain.com
```

This lets docker-compose pass `https://yourdomain.com` correctly to the Next.js build (metadata, canonical links, sitemaps, auth redirects).

---

## 3. Quick Deploy with Caddy (Recommended — Easiest SSL)

Caddy gives you free automatic HTTPS + renewal. No certbot, no nginx.conf fighting.

1. Edit the `Caddyfile` in the project root and replace `voiceforgeai.site` with your real domain(s).

2. From the project root:

```bash
# Build fresh images (important after first .env changes)
docker compose build --no-cache

# Start everything (Redis + API + Worker + Frontend + Caddy)
docker compose up -d

# Watch logs
docker compose logs -f --tail=100
```

3. Visit `https://yourdomain.com`. Caddy will auto-provision the certificate on first request (may take 10-30s the very first time).

Done. Your entire stack is now running behind proper HTTPS, proxied correctly, with persistent storage.

---

## 4. Alternative: Use Your Own Nginx on the Host (Traditional)

If you prefer managing nginx + certbot yourself on the VPS:

- Keep using the existing `nginx/voiceforgeai.site.conf` (update the domain/paths as needed).
- The compose file still publishes safe localhost-only ports (`127.0.0.1:3000` and `:5000`).
- For `/uploads`, either:
  - Proxy `/uploads/` to `http://127.0.0.1:5000/uploads/` (simplest), or
  - Use a bind mount on the `uploads_data` volume to a host directory and point nginx `alias` at it.

Caddy route is strongly preferred for new VPS setups.

---

## 5. Important Docker Details & Gotchas Solved

| Problem (common on VPS)              | Solution in this setup |
|--------------------------------------|------------------------|
| Audio files disappear after `docker compose down` or image rebuild | Named `uploads_data` volume mounted at `/app/uploads` for both api + worker |
| "Permission denied" writing uploads when using non-root container + volume | `docker-entrypoint.sh` + `su-exec` fixes ownership on every start |
| Healthchecks fail (wget missing) → restart loops | `wget` explicitly installed in backend Dockerfile |
| Custom domain shows wrong URLs / broken canonicals / bad OG images | Build args (`NEXT_PUBLIC_SITE_URL`) + improved middleware + storage logic |
| CORS errors on new domain            | Configurable via `ADDITIONAL_CORS_ORIGINS` + `CLIENT_URL`/`SERVER_URL` |
| Hard to update the app               | `docker compose pull && docker compose up -d --build` |
| MongoDB connection from inside Docker | Use `host.docker.internal` (already enabled) or run Mongo in Docker too |

---

## 6. Useful Commands

```bash
# Full restart + rebuild after code or .env change
docker compose up -d --build

# View logs for specific service
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f caddy

# Check health
docker compose ps
docker inspect --format='{{json .State.Health}}' voiceforge-api

# Shell into running container (debug)
docker compose exec api sh

# Backup uploads (very important!)
docker run --rm -v voiceforgeai_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore
docker run --rm -v voiceforgeai_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data

# Stop everything
docker compose down          # keeps volumes
docker compose down -v       # DANGER: deletes volumes too
```

---

## 7. Adding MongoDB (Optional — Self-Contained)

If you want everything in one compose file (not recommended for production DBs), you can add this service:

```yaml
  mongo:
    image: mongo:7
    container_name: voiceforge-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - voiceforge-network
    # ports: ["127.0.0.1:27017:27017"]  # only if you need host access
```

Then set `MONGODB_URI=mongodb://mongo:27017/voiceforge` in backend/.env and restart.

Use Atlas for real production (backups, scaling, monitoring included).

---

## 8. Firewall (UFW example on Ubuntu)

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 443/udp   # HTTP/3
ufw --force enable
```

Never expose 5000 or 3000 publicly.

---

## 9. Updating the Application

```bash
git pull
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

The persistent `uploads_data` volume means all previous generations survive.

---

## 10. Troubleshooting

- **Caddy not getting cert**: DNS must be correct and port 80 reachable. Check `docker compose logs caddy`.
- **Uploads not persisting**: Confirm volume exists (`docker volume ls`) and mounted in both api + worker.
- **"Connection refused" to Mongo from Docker**: Use `host.docker.internal` in the URI or put mongo in the compose network.
- **Frontend still shows old domain**: Rebuild was needed (`--no-cache` or delete `.next` in build context).
- **Worker not processing jobs**: Check redis health and `docker compose logs worker`.

For more, run `docker compose ps` and inspect the unhealthy services.

---

You now have a production-grade, Docker-only deployment of VoiceForge AI frontend + backend that is easy to maintain on any VPS.

If you run into issues not covered here, the Dockerfiles, entrypoint, and compose are heavily commented for future maintainers.
