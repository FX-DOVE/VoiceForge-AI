# VoiceForge AI — Frontend

Production-ready, **frontend-only** Next.js app for VoiceForge AI (Aurora Dark SaaS). Uses mock data and client-side navigation flows—ready to wire to a backend later.

## Stack

- **Next.js 15** (App Router, JavaScript)
- **Tailwind CSS v4**
- **Framer Motion** (page transitions, hovers, wizard progress)
- **Lucide React** (icons)
- **Zustand** (voice cloning wizard UI state)
- **Radix UI** + **class-variance-authority** (shadcn-style primitives: `Button`, `Dialog`, etc.)
- **Sonner** (toasts)
- **`next/image`** for optimized remote images (Google CDN URLs from the prototype)

## Setup

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Routes

| Area | Paths |
|------|--------|
| Public | `/`, `/features`, `/pricing`, `/faq`, `/login`, `/signup`, `/forgot-password` |
| App | `/dashboard`, `/studio`, `/settings`, `/billing` |
| Cloning wizard | `/cloning` → redirects to `/cloning/upload`, `/cloning/configure`, `/cloning/train` |
| Monetization | `/checkout`, `/success` |
| Admin | `/admin`, `/admin/users`, `/admin/billing`, `/admin/settings` |

## Project layout

- `app/` — routes, layouts, `globals.css`, `template.js` (page motion)
- `components/` — layout, UI, cloning wizard, motion helpers
- `lib/` — `utils`, `mock-data`
- `stores/` — Zustand (cloning draft)
- `styles/` — extra CSS (range inputs, skeleton shimmer)
- `public/` — static assets (add your PNGs here if you place design files in the repo)

## Design reference

Visual and flow reference lives in the repo root (e.g. `voiceforge_ai_natural_ai_voices.html` and per-screen `code.html` folders). No PNGs were present in the workspace at build time; the UI follows those HTML tokens and `voiceforge_ai_core/DESIGN.md`.

## Notes

- Auth, payments, and training are **mocked** (forms navigate or toast only).
- Remote images require hosts listed in `next.config.mjs` (`images.remotePatterns`).
