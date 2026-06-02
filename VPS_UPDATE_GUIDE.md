# VPS Update Guide for VoiceForge AI (after GitHub push)

## 1. On your local machine (done)
We just pushed the latest changes (full working /contact with real email to support@voiceforgeai.site, rebrand, etc.) to GitHub.

## 2. On your VPS - Update the running app (recommended, since it was already live)

SSH into your VPS:

```bash
ssh youruser@your-vps-ip
```

Go to the project folder (the one with docker-compose.yml):

```bash
cd VoiceForge-AI   # or whatever folder name you used. Avoid spaces if possible.
# or cd /path/to/your/project
```

Pull the new code:

```bash
git pull origin main
```

**Update your environment files** (this is what you asked for):

```bash
# Backend (most important - contains SMTP and support email)
nano backend/.env
```

Key things to ensure / update for the new contact system:

```env
# Make sure these point to your support email
SMTP_USER=support@voiceforgeai.site
SMTP_PASS=your-real-password-here
EMAIL_FROM=VoiceForge AI <support@voiceforgeai.site>

# Optional explicit support target (controller falls back to this)
SUPPORT_EMAIL=support@voiceforgeai.site

# Your public URLs (critical)
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://yourdomain.com
```

Also check root .env if you use it for Docker:

```bash
nano .env   # or .env.docker
```

Make sure:

```env
DOMAIN=yourdomain.com
```

Save and exit (Ctrl+O, Enter, Ctrl+X in nano).

## 3. Rebuild and restart (rehost with updates)

```bash
# Rebuild images (important because we added new backend routes + contact controller + frontend form logic)
docker compose build --no-cache

# Restart everything (or selectively)
docker compose up -d

# Follow logs to confirm it came up cleanly
docker compose logs -f --tail=100
```

Watch for:
- api service starting without errors
- "[email] SMTP connection verified" (or the mocked warning if you didn't set SMTP yet)
- No "contactRoutes" or import errors

## 4. Test the new contact functionality

- Visit https://yourdomain.com/contact
- Fill the form and submit → you should get a success message.
- Check the inbox of support@voiceforgeai.site — you should receive the formatted submission.
- The person who submitted should also receive an auto-confirmation email.

You can also test the mailto cards (they open email client directly).

## 5. If you want a completely fresh clone instead of pull (nuclear option)

```bash
# On VPS, stop current
docker compose down

# Move old folder aside
mv VoiceForge-AI VoiceForge-AI-backup-$(date +%F)

# Fresh clone
git clone https://github.com/FX-DOVE/VoiceForge-AI.git
cd VoiceForge-AI

# Copy your old .env files over (very important)
cp ../VoiceForge-AI-backup-*/backend/.env backend/.env
cp ../VoiceForge-AI-backup-*/.env .env   # if exists

# Then proceed with the build + up steps above
docker compose build --no-cache
docker compose up -d
```

## 6. Useful commands after update

```bash
# Restart only backend after .env change
docker compose up -d --no-deps --build api

# View contact-related logs (if you add logging)
docker compose logs -f api | grep -i contact

# Check if new /contact endpoint is alive (from inside the api container or via curl on host)
docker compose exec api wget -qO- http://localhost:5000/api/contact || echo "use curl or test via browser form"

# Full status
docker compose ps
```

## 7. Troubleshooting after update

- If form submit fails with 404: the api container didn't rebuild. Run `docker compose build --no-cache api && docker compose up -d api`
- Emails not sending: double-check backend/.env SMTP_* values (especially user must be full email for many providers). Check `docker compose logs api | grep -i email`
- Old UI showing: clear browser cache or force `docker compose build --no-cache frontend`
- Permission issues on uploads: the entrypoint script should handle it.

The persistent volume means all your previous voice generations and uploads are safe.

After this, your VPS will be running the exact same code as what we just pushed, including the fully working contact system that emails support@voiceforgeai.site.

Let me know the output of the logs or any errors you hit and I can help debug live.
