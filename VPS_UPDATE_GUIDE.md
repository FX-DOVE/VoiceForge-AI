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

---

## 8. Voices missing in /voices (library) or /studio after build/deploy

This is common after a fresh pull + rebuild if the MongoDB `voices` collection was never seeded or the sync for ElevenLabs (Premium voices) was not re-run on the VPS.

The stock voices (VoiceForge Free + Pro + Premium) live in Mongo and are **not** baked into the Docker image. You must run the population scripts against your DB.

### Critical: Rebuild the container after git pull (this is why the script was not found)

After `git pull`, the new script is on the **host** filesystem, but the running `api` Docker container is using an **old image** that was built before the file existed.

You **must** rebuild so the new script is copied into /app/scripts/ inside the container:

```bash
# From the project root (where docker-compose.yml is)
docker compose build --no-cache api
docker compose up -d api
```

Only then run the script.

### One-command fix (recommended)

From your project directory on the VPS (where docker-compose.yml lives):

```bash
# Run the all-in-one refresher (seeds Free/Pro defaults + syncs your ElevenLabs Premium voices + backfills + billing profiles)
docker compose exec api node scripts/refresh-all-voices.js
```

This script:
- Seeds the base Free + xAI Pro voices
- Syncs **all public ElevenLabs voices** your ELEVENLABS_API_KEY can use (this populates the VoiceForge Premium tab and most of the library)
- Backfills provider / model / costTier fields (important for the rebrand to show correct "VoiceForge Premium / Studio" labels and correct credit costs)
- Ensures BillingProfiles exist (so Pro/Premium generations charge the right "eleven lab api budget" instead of free/xai rates)

It is safe and idempotent.

### After the script finishes

```bash
# (Strongly recommended) Generate local cached previews for EL voices
# This avoids repeated calls to ElevenLabs for sample audio (saves money + prevents 402 errors on free-tier keys)
docker compose exec api node scripts/generateElevenLabsPreviews.js
```

Then restart to be sure:

```bash
docker compose up -d
```

### Full sequence the user should run (copy-paste this block)

```bash
cd /var/www/VoiceForge-AI   # or wherever your project root is

git pull

# Rebuild api so new script is inside the container
docker compose build --no-cache api
docker compose up -d api

# Now run the refresher
docker compose exec api node scripts/refresh-all-voices.js

# Then generate previews
docker compose exec api node scripts/generateElevenLabsPreviews.js

# Final restart
docker compose up -d
```

### Alternative: run individual scripts (if the one script has issues)

```bash
docker compose exec api node scripts/seed-voices.js
docker compose exec api node scripts/syncElevenLabsVoices.js     # The important one for Premium voices
docker compose exec api node scripts/backfill-voice-models.js
docker compose exec api node scripts/seed-billing-profiles.js
docker compose exec api node scripts/generateElevenLabsPreviews.js
```

### Requirements

- Your `backend/.env` (the one the api container sees) **must** contain a valid `ELEVENLABS_API_KEY` that has access to voices (the same one you used locally).
- If you see "No voices returned" or 401/403, double-check the key in the VPS .env and do `docker compose up -d --build api` after editing.

### Verify

After the scripts:

- Go to https://yourdomain.com/voices → you should see Free / Pro / Premium tabs with many voices.
- In Studio → All / Free / Pro / Premium / My Clones should have voices.
- Cloned voices (if any) should show as VoiceForge Premium in the cost preview, not Free.

If still empty after the script, check logs:

```bash
docker compose logs api | grep -i "sync\|seed\|voice\|eleven"
```

And confirm the key is loaded:

```bash
docker compose exec api node -e "console.log('EL key present?', !!process.env.ELEVENLABS_API_KEY)"
```

Run the script again after fixing the key.

This should get your library and studio fully populated with the correct VoiceForge Free / Pro / Premium voices (with proper labels and charging).

---

Let me know the output of the refresh script or any errors (especially around the EL key), and I'll give the exact next command.
