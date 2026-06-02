# VoiceForge Enterprise Upgrade - Verification Guide

**IMPORTANT**: All changes are migrations + additive. No existing functionality was removed or altered in payment/wallet/xAI paths.

## Pre-Upgrade State Preserved
- Single wallet: `totalCredits`, `creditsRemaining` on User (untouched)
- All deposits via Paystack continue to work exactly as before
- xAI generation path identical for non-ElevenLabs voices
- Existing Pro users (plan=pro) keep xAI access + wallet charging at xai profile rates
- Existing balances, transactions, usage history, AudioGeneration.provider etc. preserved
- $2.99 piggyback in deposits still activates Professional (backward compat for old checkout links)

## New Architecture Summary
- FREE: free provider voices only (0 credits)
- PRO: xai provider (existing pay-as-you-go wallet)
- PROFESSIONAL ($2.99/mo via dedicated /professional/subscribe or checkout?plan=professional): elevenlabs provider + cloning
- One wallet, provider-specific BillingSetting.providerProfiles.{xai,elevenlabs,free}
- Dynamic charging: credits = ceil( chars * profile.creditsPerCharacter )
- Admin edits profiles live (no restart)

## API Additions (existing APIs 100% intact)
- POST /api/professional/subscribe
- GET /api/professional/status
- POST /api/professional/renew
- POST /api/elevenlabs/generate (protected)
- GET /api/voices/provider/:provider
- GET /api/voices?provider=my-clones (with auth)

Middleware: requireProfessional() protects cloning + el-gen

## Frontend Additions
- Voices: tabs All/Free/xAI/ElevenLabs/My Cloned
- Studio: provider badges + live "N chars → M credits (Provider)" preview
- Dashboard: Current Plan badges + Professional Status + Renew button
- Pricing: 3 plan cards matching spec
- Billing: quick Professional status + renew
- Admin Billing: editable xai + elevenlabs profiles

## 10 Test Points (from spec)

1. Existing xAI generation still works.
   - Use a xAI/pro voice in Studio → generates with xAI, charges at xai profile rate (default 2 cr/char)

2. Existing deposits still work.
   - /billing or /checkout , pay $5+ → credits added using xai (or eleven if pro) profile, wallet updated, legacy flow same

3. Existing wallet still works.
   - One wallet visible in dashboard/billing/usage, creditsRemaining deducted on gen

4. Existing users keep balances.
   - Run migration, check users.totalCredits/creditsRemaining unchanged

5. Professional subscription works.
   - Go to /pricing or dashboard upgrade → /checkout?plan=professional → $2.99 pay → verify sets plan=professional + ProfessionalMembership active 30d
   - Or use new POST /professional/subscribe then complete pay

6. ElevenLabs generation works.
   - With active Professional, pick ElevenLabs voice in Studio or use /elevenlabs/generate → charges at 7 cr/char (or configured), uses EL API

7. Voice cloning works.
   - Professional only: /cloning/upload → configure → start → ElevenLabs instant clone → Voice with provider=elevenlabs created, appears in My Cloned

8. Expiration works.
   - After endDate, status=expired via daily job (server start + 12h).
   - Access to el gen + cloning denied (403 "Professional membership required")
   - Cloned voices remain in DB, never deleted

9. Provider-specific charging works.
   - Free voice: 0 credits
   - xAI voice: uses xai profile (admin editable)
   - EL voice: uses elevenlabs profile (admin editable)
   - Preview shows correct chars/credits/provider before submit

10. No regression in production features.
    - Auth, dashboard, history, payments, admin, xAI Grok usage tracking, emails, etc. all continue
    - Old plan=pro users unaffected
    - Old $2.99 deposits via generic checkout still activate mem

## How to Run Verification

### Backend
```bash
cd backend
node scripts/migrate-professional-complete.js   # safe, idempotent
node -e 'require("./src/server")' # or npm run dev (needs .env + mongo)
```

- Check logs for "Professional membership" activation on $2.99
- Call GET /api/professional/status after login (use token)
- Trigger expiration manually: node -e '
  require("./src/services/professionalService").expirePastDue().then(c=>console.log("expired",c))
'

### Admin Billing
- Login admin → /admin/billing-settings
- Edit xAI cost/credits + shares, ElevenLabs cost etc. Save.
- Changes reflected in estimates + next gens/deposits (live)

### Frontend Manual
- Visit /pricing → see 3 plans
- /voices → use top tabs (All, Free, xAI, ElevenLabs, My Cloned). My requires signin
- Studio → select different providers, see live cost preview with Provider + credits req
- Dashboard → see plan badge + Professional status + renew link
- As Professional user: cloning works, EL gen works; as free/pro: blocked with upgrade msg
- Pay $2.99 via checkout or subscribe API → status updates, access granted

### DB Checks (mongo shell or compass)
- User has plan + credits fields intact
- ProfessionalMembership has docs for subs
- Voice docs have provider: free|xai|elevenlabs
- BillingSetting.providerProfiles has xai + elevenlabs + free with 4 fields each
- UsageRecord.meta.provider populated

## Rollback / Safety
- All new code is additive (new routes, new mw, new fields with defaults)
- Old code paths (xaiTts, paystack init/verify, tts fast/queue for xai, etc.) untouched
- If needed, disable elevenlabs by removing key; Professional checks will still gate but generation will fail gracefully at EL layer
- Never deletes users/voices/payments

## Notes
- Subscription does NOT grant free/unlimited generations. Always deducts credits per provider profile.
- Cloned voices for Professional are stored with provider=elevenlabs; generation routes to EL.
- Existing xAI clones (legacy path) continue using xAI fallback matcher if any.

Upgrade complete. All requirements addressed with zero destructive changes.
