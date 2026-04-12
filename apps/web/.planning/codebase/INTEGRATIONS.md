# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Google Gemini AI (Primary and Only API):**
- Used for: All AI image generation — virtual try-on, pose variations, scene/background changes
- SDK: `@google/genai` ^1.10.0 (imported in `services/geminiService.ts`)
- Auth: `GEMINI_API_KEY` env var → exposed as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` via Vite `define`
- Models used:
  - `gemini-2.5-flash-image` — Default model for try-on, pose changes, and fast scene generation
  - `gemini-3.1-flash-image-preview` — Pro quality mode for scene variations
- All calls use `Modality.IMAGE` + `Modality.TEXT` response modalities
- Image data sent as base64 inline data (data URLs converted to `{ inlineData: { mimeType, data } }` parts)
- Error handling includes: `promptFeedback.blockReason` checks, `finishReason` checks, and fallback text response extraction

**External Image CDNs (read-only):**
- GitHub raw content — Default wardrobe images from `raw.githubusercontent.com/ammaarreshi/app-images/`
- Unsplash — Default wardrobe items (bags, sunglasses, shoes) via `images.unsplash.com`
- Google Fonts — Inter + Instrument Serif from `fonts.googleapis.com` / `fonts.gstatic.com`
- esm.sh CDN — ESM-compatible package mirrors for import map in `index.html`

## Data Storage

**Databases:**
- None — No backend, no database, no server-side persistence

**File Storage:**
- Browser `localStorage` only
  - Key: `fit-check:pinned-wardrobe` — Stores user-pinned wardrobe items (only `data:image/` URLs are persisted)
  - Implementation: `lib/pinnedWardrobe.ts` (`getPinnedWardrobeItems`, `savePinnedWardrobeItems`, `addPinnedWardrobeItem`)
- In-memory state: All generated images stored as base64 data URLs in React state (not persisted to disk)
- Browser Blob URLs used for image preview (`lib/imagePersistence.ts` handles `blobUrlToDataUrl` conversion for persistence)

**Caching:**
- None at API level — Gemini API responses are not cached
- UI-level only: Outfit layers are cached in `outfitHistory` array; re-selecting a previously applied garment restores from history without re-calling API

**Session Storage:**
- None

## Authentication & Identity

**Auth Provider:**
- None — No user accounts, no authentication, no login flow
- API key is embedded client-side via Vite's `define` (exposed to browser at build time)

## Monitoring & Observability

**Error Tracking:**
- None — No Sentry, no logging service, no error reporting

**Logs:**
- Console-only error logging (caught via try/catch in event handlers, displayed in UI error banners)

## CI/CD & Deployment

**Hosting:**
- Static hosting (pure client-side SPA)
- No deployment target detected in repo (no `vercel.json`, `netlify.toml`, `firebase.json`, etc.)

**CI Pipeline:**
- None detected — No GitHub Actions, no CI config files

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` — Google Gemini API key (the only env var)

**Secrets location:**
- `.env.local` — Present in repo root (loaded by Vite's `loadEnv()` in `vite.config.ts`)
- API key is exposed to client bundle via `process.env.API_KEY` and `process.env.GEMINI_API_KEY` — **security concern: client-side exposure**

## Webhooks & Callbacks

**Incoming:**
- None — No server endpoints

**Outgoing:**
- All API calls go directly from browser to Google Gemini API endpoint (handled by `@google/genai` SDK)

---

*Integration audit: 2026-03-30*
