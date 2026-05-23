# SMTP Authentication Failed - Fix Guide

## Problem
`Invalid login: 535 5.7.8 Error: authentication failed`

This means your SMTP username or password is WRONG.

## Quick Fix (3 Steps)

### Step 1: Verify in Namecheap Panel
1. Go to https://www.namecheap.com/ and log in
2. Go to **Domain List** → Find your domain → Click **Manage**
3. Go to the **Advanced DNS** tab
4. Scroll to **Mail Settings** section
5. Make sure **Private Email** is set up
6. Check that your email account exists (e.g., `support@voiceforgeai.site`)
7. **Reset the password** - Click "Change Password" and set a new one

### Step 2: Update Your .env File

Open `backend/.env` and make sure these lines are correct:

```bash
# Use PORT 587 (more reliable than 465)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false

# IMPORTANT: Use the FULL email as username
SMTP_USER=support@voiceforgeai.site

# Use the password you just set in Namecheap panel
SMTP_PASS=your-new-password-here

# From address should match your SMTP_USER
EMAIL_FROM=VoiceForge AI <support@voiceforgeai.site>
```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then start again:
cd backend
npm run dev
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Wrong port | Use `587` not `465` |
| Wrong username | Use full email `support@voiceforgeai.site` not just `support` |
| Wrong password | Reset password in Namecheap panel |
| Account not active | Check email account status in Namecheap |
| Extra spaces | Make sure no spaces after values in .env |

## Test It

Run this test script:
```bash
cd backend
node scripts/test-smtp.js
```

## Still Not Working?

1. **Triple-check password** - Copy/paste from Namecheap exactly
2. **Try the PowerShell fix script:**
   ```powershell
   cd backend
   .\scripts\fix-smtp.ps1
   ```
3. **Contact Namecheap support** - The account might need activation

## Manual PowerShell Fix

If you want to fix it manually in PowerShell:

```powershell
# Read current .env
$content = Get-Content backend/.env -Raw

# Remove old SMTP lines
$content = $content -replace "(?m)^SMTP_.*\r?\n", ""
$content = $content -replace "(?m)^EMAIL_FROM=.*\r?\n", ""

# Add correct config
$content += "`nSMTP_HOST=mail.privateemail.com`nSMTP_PORT=587`nSMTP_SECURE=false`nSMTP_USER=support@voiceforgeai.site`nSMTP_PASS=YOUR_PASSWORD_HERE`nEMAIL_FROM=VoiceForge AI <support@voiceforgeai.site>`n"

# Save
$content | Set-Content backend/.env
```

---

**The main issue is usually:**
1. Wrong password (reset it in Namecheap)
2. Using port 465 instead of 587
3. Not using full email as username
