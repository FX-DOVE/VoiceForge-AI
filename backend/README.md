# VoiceForge AI — Backend API

Production-ready Express.js + MongoDB API for VoiceForge AI.

## Requirements

- Node.js 18+
- MongoDB 6+
- Redis 6+ (optional, for BullMQ training workers)

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API base URL: `http://localhost:5000/api`

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `XAI_API_KEY` | xAI API key for text-to-speech |
| `REDIS_URL` | Redis for training job queue |
| `CLOUDINARY_*` | Optional cloud storage |
| `RESEND_API_KEY` | Optional password-reset emails |
| `STRIPE_SECRET_KEY` | Optional billing |

Without Redis, training jobs are queued but require `npm run worker` when Redis is available. Local file storage is used when Cloudinary is not configured.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API (production) |
| `npm run worker` | Start BullMQ training worker |
| `npm test` | Run health check test |

## API routes

### Auth
- `POST /api/auth/register` — `{ email, password, name? }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/forgot-password` — `{ email }`
- `POST /api/auth/reset-password` — `{ token, password }`
- `GET /api/auth/me` — Bearer token required

### Users
- `GET /api/users/profile`
- `PATCH /api/users/profile` — `{ name?, avatarUrl? }`

### Voices
- `GET /api/voices` — query: `type`, `gender`, `language`, `search`
- `POST /api/voices` — create voice (authenticated)

### Voice cloning
- `POST /api/cloning/upload` — multipart `samples[]`, optional `cloneId`
- `POST /api/cloning/configure` — `{ cloneId, name, description?, visibility? }`
- `POST /api/cloning/start` — `{ cloneId }`
- `GET /api/cloning/:id/status`

### Text-to-speech
- `POST /api/tts/generate` — `{ text, voiceSlug?, voiceId?, language?, codec?, speed?, stability? }`
- `GET /api/tts/:id`
- `GET /api/tts/history`

### Usage
- `GET /api/usage/summary`

### Admin (role: `admin`)
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/system-health`

### Files & notifications
- `POST /api/files/upload` — multipart `file`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Health
- `GET /api/health`

## Response format

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

```json
{
  "success": false,
  "message": "Clear, user-friendly explanation.",
  "errors": {}
}
```

## Authentication

Send the access token in the header:

```
Authorization: Bearer <accessToken>
```

Login and register responses include `accessToken`, `refreshToken`, and `user`.

## xAI TTS

The server calls `POST https://api.x.ai/v1/tts` with:

- `voice_id` (default: `Eve`)
- `language` (default: `en`)
- `codec` (default: `mp3`)
- `sample_rate` (default: `44100`)
- `bit_rate` (default: `128000`)

Generated audio is stored locally or on Cloudinary, with metadata saved in MongoDB.

## Frontend connection

Point your Next.js app at the API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project structure

```
backend/
  src/
    config/       # env, db, redis
    models/       # Mongoose schemas
    controllers/
    services/
    routes/
    middleware/
    validators/
    jobs/         # BullMQ queue + worker
    integrations/ # xAI, storage, email
    utils/
  uploads/
  tests/
```

## Create an admin user

After registering, set role in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin", plan: "pro" } })
```
