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

After `git pull`, the new script is on the **host** filesystem, but the running `api` Docker container is using an **old image** that was built before the file existed in the build context.

You **must** rebuild so the new script (and any code changes) is copied into /app/scripts/ inside the container:

```bash
# From the project root (where docker-compose.yml is)
docker compose build --no-cache api
docker compose up -d api
```

Only then run the script. (The refresh script now includes comprehensive backfills that will set provider="free" for tier=free voices, isPublic/isActive etc even on pre-existing docs.)

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

# 1. Rebuild api so new script + code is inside the container (critical after pull)
docker compose build --no-cache api
docker compose up -d api

# 2. Run the refresher (this will backfill providers for free voices, set isPublic/isActive, sync EL if key, seed billing etc)
docker compose exec api node scripts/refresh-all-voices.js

# 3. Generate local previews for EL voices (prevents API spam for samples)
docker compose exec api node scripts/generateElevenLabsPreviews.js

# 4. Final restart
docker compose up -d
```

After this, /voices and studio should show the voices (Free/Edge with provider=free, xAI with xai, Premium if EL key was used).
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
docker compose logs api | grep -i "sync\|seed\|voice\|eleven\|backfill"
```

And confirm the key is loaded:

```bash
docker compose exec api node -e "console.log('EL key present?', !!process.env.ELEVENLABS_API_KEY)"
```

### If STILL empty: run the aggressive force backfill

The previous backfills may have missed some edge cases on your specific VPS data (e.g. docs that have tier=free but provider stuck as "xai", or isPublic/isActive not flipped because of update semantics).

Pull latest, rebuild, then run this dedicated force script:

```bash
git pull
docker compose build --no-cache api
docker compose up -d api

# Aggressive fixer - loops every voice and forces correct provider/source/isPublic/isActive/tier/model based on data
docker compose exec api node scripts/force-backfill-voices.js

# Previews again
docker compose exec api node scripts/generateElevenLabsPreviews.js

docker compose up -d
```

This script prints verification counts for free/xai/el pub+active voices.

### Verify after everything

```bash
# Quick count from inside container
docker compose exec api node -e '
  require("dotenv").config();
  const { connectDB } = require("./src/config/db");
  const { Voice } = require("./src/models");
  (async () => {
    await connectDB();
    const total = await Voice.countDocuments();
    const pubAct = await Voice.countDocuments({isPublic:true, isActive:true});
    const free = await Voice.countDocuments({provider:"free", isPublic:true, isActive:true});
    const xai = await Voice.countDocuments({provider:"xai", isPublic:true, isActive:true});
    const el = await Voice.countDocuments({provider:"elevenlabs", isPublic:true, isActive:true});
    console.log("Total:", total, "Pub+Act:", pubAct, "Free:", free, "xAI:", xai, "EL:", el);
    process.exit(0);
  })();
'
```

If pubAct > 0 (as in your case: 246), the DB is good. The API should return voices.

The issue is almost certainly the **frontend container still running old build**.

You rebuilt only `api` before, but the Next.js frontend (which does the fetch to /api/voices and renders the lists/tabs in library and studio) needs rebuild too to pick up the latest JS (rebrand filters, displayTier logic, grouping, etc.).

### Rebuild frontend (critical when DB is good but UI empty)

```bash
# From project root
docker compose build --no-cache frontend
docker compose up -d frontend

# Make caddy pick up the new frontend
docker compose up -d caddy
```

Then, in browser:

- Hard refresh: Ctrl + Shift + R (or Cmd+Shift+R on Mac)
- Or open incognito/private window
- Or clear site data for your domain

Test the raw API (should now return data):

In browser console (F12):

fetch('/api/voices').then(r => r.json()).then(console.log)

Or with curl on VPS (or from another machine):

curl -k https://yourdomain.com/api/voices | head -c 500

If it returns voices array with length >0 , then it's a frontend cache/build issue — the rebuild + hard refresh will fix the UI.

If the curl also returns [], then the running api container is still old code (rebuild api again and up -d api).

Since your DB count shows 246 pub+active with correct breakdown (51 free, 71 xai, 124 el), and the sample docs look good (provider, tier, isPublic, isActive set), once the frontend is on latest code it will show.

Free plan users will see the free + (if pro plan) the xai ones via the server filter, but "all" unauth or pro will see all.

The laptop works because local `npm run dev` uses latest source directly, no Docker build layer.

After the frontend rebuild + hard refresh, the /library and /studio should populate immediately with the voices.

---

## 10. Mismatch: only ~21 premium voices in library vs 124 in studio, only 21 have working previews ("could not load preview")

**Issues found (by scanning code with grep for seed/sync/preview/generate/elevenlabs/provider=elevenlabs etc.):**

- `backend/scripts/seed-many-el-premium-voices.js` seeds ~100 "el-premium-*" slugs (diversityData ~100 entries, cycling realIdsPool of ~20 real EL voice_ids). Sets provider=elevenlabs, elevenlabsVoiceId (real), tier=pro, etc. Note in header: "Generation may require paid ElevenLabs plan for some 'library' voices."

- `backend/scripts/syncElevenLabsVoices.js`: fetches from key, validates with tiny generateSpeech, keeps only usable (~21 that don't 402 paid_plan_required). Inserts with "vf-*" slugs + proper fields. These are the good ones.

- `backend/scripts/generateElevenLabsPreviews.js`: for current el voices, prefers local cache file (in uploads/voice-previews/ via getPreviewPath using elevenlabsVoiceId or slug). If no cache, tries elevenlabs.generateSpeech; on paid_plan_required, does Voice.findByIdAndDelete to remove unusable. Logs "Removed (unusable on current EL plan)". Then uploads result as previewUrl.

- In `backend/src/services/voiceService.js` getVoicePreview + _generateAndCachePreview:
  - If source=elevenlabs or provider=elevenlabs or has elevenlabsVoiceId: check local file first (for the 21 good).
  - No local: try EL gen (for extras: fails if not usable).
  - Catch: fallback to synthesizeSpeechEdge with edgeTtsVoiceId = xaiVoiceId (for seeded extras: xaiVoiceId = el id like "21m00Tcm4TlvDq8ikWAM" -- invalid Edge voice name!).
  - Edge fails -> throw -> frontend toast "Could not load voice preview." (studio/page.js, voices/page-client.js).

- Library (/voices premium tab): server listVoices(provider=elevenlabs) + elevenlabsVoiceId filter -> only the ~21 good/usable (synced ones that have proper ids and passed validation; extras may have been deleted if generate run, or if not, perhaps user counts only playable or library has additional client filter like core or the 21 are the ones with local previews).

- Studio: loads all via voicesApi.list() (no provider), client filter on displayTier==="premium" (set by getDisplayTier if provider=elevenlabs even with id) or has elevenlabsVoiceId -> shows all 124 (good + extras from seed-many).

- Previews only exist (local files + previewUrl) for the ~21 validated good ones. Extras have no cache, on-demand fails -> error.

- The seed-many was for diversity, but with free EL key (only 21 usable), they cause bloat, no previews, errors, and count mismatch.

**The script to clear it up:**

New `backend/scripts/cleanup-el-extras.js` (added in this update):
- Deletes all with slug matching /^el-premium-/ AND provider=elevenlabs (the extras from seed-many; leaves the vf-* from sync).
- Then auto-execs generateElevenLabsPreviews.js (ensures the remaining ~21 good have local previews cached, and will remove any other bad EL it finds during attempts).

After run: both library and studio will have matching ~21 premium, all playable.

### Exact VPS commands

```bash
cd /var/www/VoiceForge-AI

git pull

docker compose build --no-cache api
docker compose up -d api

# Cleanup extras + auto ensure previews for good ones
docker compose exec api node scripts/cleanup-el-extras.js

docker compose up -d
```

Then hard refresh browser.

Verify:

```bash
docker compose exec api node -e '
  require("dotenv").config();
  const { connectDB } = require("./src/config/db");
  const { Voice } = require("./src/models");
  (async () => {
    await connectDB();
    const el = await Voice.countDocuments({provider:"elevenlabs", isPublic:true, isActive:true});
    const withPreview = await Voice.countDocuments({provider:"elevenlabs", isPublic:true, isActive:true, previewUrl:{$ne:""}});
    console.log("EL:", el, "with preview:", withPreview);
    process.exit(0);
  })();
'
```

Should now be ~21 for both, all with previews.

If you want the diversity voices, upgrade your EL plan to paid, set the key, re-run syncElevenLabsVoices.js + generateElevenLabsPreviews.js (no need for seed-many).

This cleans the issues. The generate script is the "cleaner" (removes on fail), but the dedicated script targets the known extras from seed-many and ensures previews.

---

Let me know the output of the force-backfill (the verification counts) and the inspect count above, and whether it works after. If not, paste the exact error or count, and the content of a sample voice doc (redact sensitive).
