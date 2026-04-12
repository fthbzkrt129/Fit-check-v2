# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- TypeScript 5.8.2 — All application code (`.ts` / `.tsx`)

**Secondary:**
- HTML — Single-page shell in `index.html`
- CSS — Minimal styling via `index.css`; Tailwind classes handle most styling

## Runtime

**Environment:**
- Browser-only (no server runtime)
- Node.js used only for dev tooling (Vite, Vitest)

**Package Manager:**
- npm (inferred from `package.json` + lockfile convention)
- Lockfile: present (`.local` in `.gitignore` suggests npm lockfile)
- Module system: ESM (`"type": "module"` in `package.json`)

## Frameworks

**Core:**
- React 19.1.0 — UI rendering
- Vite 6.2.0 — Dev server + build tooling (`@vitejs/plugin-react 5.0.0`)
- Tailwind CSS — Utility-first styling (loaded via **CDN** `<script src="https://cdn.tailwindcss.com">` in `index.html`, NOT via npm)
- Framer Motion 11.2.12 — Page transitions, loading overlays, `AnimatePresence`

**Testing:**
- Vitest — Test runner (configured in `vite.config.ts` under `test` key)
- @testing-library/jest-dom — DOM matchers (loaded in `vitest.setup.ts`)
- jsdom — Browser environment simulation

**Build/Dev:**
- Vite 6.2.0 with `@vitejs/plugin-react`
- Dev server: port `3000`, host `0.0.0.0`
- Path alias: `@` → project root (`@/*`)

## Key Dependencies

**Critical:**
- `@google/genai` ^1.10.0 — Google Gemini AI SDK; powers ALL AI image generation (virtual try-on, scene variations, pose changes). This is the app's core dependency.

**UI & UX:**
- `react-image-crop` ^11.0.6 — Garment image cropping before upload
- `framer-motion` ^11.2.12 — Animations and page transitions
- `@tsparticles/react` ^3.0.0 + `@tsparticles/engine` ^3.5.0 + `@tsparticles/slim` ^3.5.0 — Particle effects (likely on start/loading screens)
- `clsx` ^2.1.1 + `tailwind-merge` ^2.4.0 — Conditional class merging via `cn()` utility in `lib/utils.ts`

**Dev Dependencies:**
- `@types/node` ^22.14.0 — Node type definitions
- `@vitejs/plugin-react` ^5.0.0 — React JSX transform + Fast Refresh
- `typescript` ~5.8.2 — Type checking
- `vite` ^6.2.0 — Build tool

## Configuration

**Environment:**
- Single env var: `GEMINI_API_KEY` — Google Gemini API key
- Loaded via Vite's `loadEnv()` in `vite.config.ts`
- Exposed as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time (client-side Vite `define`)
- `.env.local` file present (contains the actual key — not committed)

**Build:**
- `vite.config.ts` — Build config, env loading, path aliases, test config
- `tsconfig.json` — Target ES2022, bundler module resolution, `react-jsx` transform, `noEmit: true`
- `experimentalDecorators: true` enabled in tsconfig
- Import map in `index.html` mirrors npm dependencies for ESM CDN loading

## Platform Requirements

**Development:**
- Node.js (version not pinned, no `.nvmrc` or `.node-version`)
- Browser with ES2022 support
- Local Gemini API key in `.env.local`

**Production:**
- Static hosting (no server needed — pure client-side SPA)
- All dependencies loaded either via npm build (Vite) or CDN import map
- Google Fonts (Inter + Instrument Serif) loaded from Google Fonts CDN

---

*Stack analysis: 2026-03-30*
