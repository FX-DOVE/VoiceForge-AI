# VoiceForge AI Billing System (Post-2026 Refactor)

## Core Principles

- **Credits are accounting units only.** They do not determine profitability.
- **Profitability** is always calculated from:
  - `apiBudget` (payment * apiShare)
  - `ttsCostPerMillionCharacters` (real xAI cost)
  - `charactersGenerated`
  - `estimatedApiCostUsd`

- **Fixed 50% gross margin** model is enforced via `platformShare` + `apiShare` = 1.0

## Billing Settings (Single Source of Truth)

All values live in the `BillingSetting` collection (singleton):

- `platformShare` / `apiShare` (must sum to 1.0)
- `ttsCostPerMillionCharacters` (default 15.00)
- `creditsPerCharacter` (default 2)
- `minimumDepositUsd`, `maximumDepositUsd`
- `welcomeCredits`

Admin changes take effect immediately for all future deposits and charges.

## Key Formulas

### Deposit → Credits
```js
apiBudget = amount * apiShare
characters = (apiBudget / ttsCostPerMillionCharacters) * 1_000_000
credits = Math.floor(characters * creditsPerCharacter)
```

### Usage Charging
```js
creditsCharged = Math.ceil(characters * creditsPerCharacter)
estimatedApiCost = (characters / 1_000_000) * ttsCostPerMillionCharacters
```

## Important Files

- `src/models/BillingSetting.js`
- `src/utils/creditCalc.js` (all calculations must go through here)
- `src/services/paymentService.js`
- `src/services/ttsService.js` + `jobs/ttsGeneration.js`

## Migration

Run `node scripts/migrate-billing-2026.js` after deploying the refactor. It preserves existing balances.

## Legacy

All old hardcoded values ($4.20, 238095 credits per dollar, etc.) have been removed.

## Analytics

The TTS analytics endpoint now returns a `billing` object with:
- totalCreditsCharged
- estimatedApiCostUsd
- totalCharactersBilled

Use this for revenue vs cost reporting.
