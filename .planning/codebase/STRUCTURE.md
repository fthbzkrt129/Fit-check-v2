# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
fit-check/
├── App.tsx                    # Root component — all state + orchestration
├── index.tsx                  # React DOM entry point
├── index.html                 # Vite HTML shell
├── index.css                  # Global Tailwind CSS imports
├── types.ts                   # Shared TypeScript types/interfaces
├── wardrobe.ts                # Default system wardrobe items (remote image URLs)
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config (ES2022, bundler resolution)
├── vite.config.ts             # Vite + React plugin + Vitest config
├── vitest.setup.ts            # Vitest test setup
├── pipeline-prompts.json      # Static prompt pipeline reference data
├── generate.js                # Standalone generation script (outside main app)
├── metadata.json              # App metadata
├── .env.local                 # Environment variables (GEMINI_API_KEY)
├── AGENTS.md                  # Agent configuration & rules
├── README.md                  # Project readme
├── assets/                    # Static image assets
│   ├── ana.png                # Hero "before" image
│   └── düzenlenmiş.png        # Hero "after" image
├── components/                # All React UI components
│   ├── StartScreen.tsx        # Upload & model generation screen
│   ├── Canvas.tsx             # Main image display + pose selector
│   ├── WardrobeModal.tsx      # Wardrobe grid + upload button
│   ├── CategoryStepPanel.tsx  # Category step selector + top-length selector
│   ├── ScenePanel.tsx         # Scene/lighting/quality configuration
│   ├── SceneVariationList.tsx # Scene variation thumbnails list
│   ├── OutfitStack.tsx        # Outfit layer stack display
│   ├── Footer.tsx             # App footer with rotating suggestions
│   ├── Header.tsx             # App header
│   ├── Spinner.tsx            # Loading spinner SVG
│   ├── LoadingOverlay.tsx     # Full-screen loading overlay
│   ├── icons.tsx              # All SVG icon components
│   ├── AdjustmentPanel.tsx    # STUB — returns null
│   ├── CropPanel.tsx          # STUB — returns null
│   ├── EditorCanvas.tsx       # EMPTY — only license comment
│   ├── ImageUploader.tsx      # EMPTY — only license comment
│   ├── DebugModal.tsx         # Debug modal component
│   ├── CurrentOutfitPanel.tsx # Current outfit display panel
│   ├── AddProductModal.tsx    # Add product modal
│   ├── ProductSelector.tsx    # Product selector component
│   ├── PosePanel.tsx          # Pose selection panel
│   ├── ObjectCard.tsx         # Object card component
│   ├── ToolOptions.tsx        # Tool options component
│   ├── Toolbar.tsx            # Toolbar component
│   ├── TopLengthSelector.tsx  # Top length selection
│   ├── FilterPanel.tsx        # Filter panel
│   ├── WardrobeSheet.tsx      # Wardrobe sheet component
│   └── ui/                    # Reusable UI primitives
│       ├── compare.tsx        # Image comparison slider (drag/hover modes)
│       └── sparkles.tsx       # Particle sparkle effect (tsparticles)
├── lib/                       # Utility functions & helpers
│   ├── utils.ts               # cn() class merger + error message formatter
│   ├── outfitFlow.ts          # Category progression logic + labels
│   ├── sceneVariations.ts     # Scene base image resolution + variation limit
│   ├── poseOptions.ts         # Pose instruction data (7 poses)
│   ├── imagePersistence.ts    # Blob URL → data URL conversion
│   ├── pinnedWardrobe.ts      # localStorage CRUD for pinned wardrobe items
│   ├── downloadImage.ts       # Image download via blob URL
│   ├── outfitFlow.test.ts     # Tests for outfit flow
│   ├── sceneVariations.test.ts# Tests for scene variations
│   ├── poseOptions.test.ts    # Tests for pose options
│   ├── imagePersistence.test.ts# Tests for image persistence
│   ├── pinnedWardrobe.test.ts # Tests for pinned wardrobe
│   ├── downloadImage.test.ts  # Tests for download image
│   └── sceneGenerationBase.test.ts # Tests for scene generation base
├── services/                  # External API integration
│   ├── geminiService.ts       # Google Gemini API calls + prompt engineering
│   ├── geminiService.test.ts  # Tests for gemini service
│   └── geminiService.scene.test.ts # Tests for scene generation
└── dist/                      # Vite build output (generated)
```

## Directory Purposes

**Root Files:**
- Purpose: Application entry, configuration, and core type/data definitions
- Contains: `App.tsx` (main orchestrator), `index.tsx` (DOM mount), `types.ts` (shared types), `wardrobe.ts` (default data)
- Key files: `App.tsx` (511 lines — the largest source file), `types.ts` (42 lines), `wardrobe.ts` (45 lines)

**`components/`:**
- Purpose: All React UI components, from full screens to atomic icons
- Contains: Functional components using `React.FC`, props interfaces defined per-component
- Key files: `StartScreen.tsx` (191 lines), `Canvas.tsx` (200 lines), `WardrobeModal.tsx` (162 lines), `icons.tsx` (253 lines)

**`components/ui/`:**
- Purpose: Reusable, animated UI primitives that are not specific to the app domain
- Contains: `compare.tsx` (image comparison slider with sparkle effects), `sparkles.tsx` (tsparticles wrapper)

**`lib/`:**
- Purpose: Pure utility functions, data definitions, and localStorage persistence helpers
- Contains: No React dependencies (except `types.ts` imports). All modules export named functions.
- Key files: `utils.ts` (cn + error formatter), `outfitFlow.ts` (category logic), `poseOptions.ts` (7 pose definitions), `pinnedWardrobe.ts` (localStorage)

**`services/`:**
- Purpose: Single external API gateway — all Gemini AI calls
- Contains: `geminiService.ts` (215 lines) with 4 exported generation functions + prompt builders + response handler
- Key exports: `generateModelImage`, `generateVirtualTryOnImage`, `generatePoseVariation`, `generateSceneVariation`

**`assets/`:**
- Purpose: Static image assets bundled at build time
- Contains: `ana.png` and `düzenlenmiş.png` (hero comparison images for StartScreen)

## Key File Locations

**Entry Points:**
- `index.tsx`: DOM mount point, renders `<App />` in `StrictMode`
- `App.tsx`: Application root, owns all state, routes between StartScreen and main dressing view

**Configuration:**
- `vite.config.ts`: Vite config (port 3000, `@` path alias to root, Vitest with jsdom)
- `tsconfig.json`: TypeScript config (ES2022 target, `@/*` path alias)
- `.env.local`: Contains `GEMINI_API_KEY` (mapped to `process.env.API_KEY` via Vite `define`)

**Core Logic:**
- `App.tsx`: All business logic — garment application, pose switching, scene generation, outfit history management
- `services/geminiService.ts`: AI prompt engineering and API call execution
- `lib/outfitFlow.ts`: Category ordering and progression rules
- `lib/sceneVariations.ts`: Scene base image resolution and variation limit enforcement

**Testing:**
- Test files are co-located with their source in `lib/` and `services/` (e.g., `outfitFlow.test.ts` next to `outfitFlow.ts`)
- Component tests exist in `components/` (e.g., `Canvas.test.tsx`, `CategoryStepPanel.test.tsx`)
- Config: Vitest with jsdom environment, globals enabled, setup file at `vitest.setup.ts`

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `StartScreen.tsx`, `WardrobeModal.tsx`)
- Utilities/Services: `camelCase.ts` (e.g., `geminiService.ts`, `outfitFlow.ts`, `poseOptions.ts`)
- Types: `types.ts` (singular file at root)
- Tests: `*.test.ts` / `*.test.tsx` (co-located with source)

**Directories:**
- `components/` — flat structure, no nested feature folders
- `components/ui/` — only for generic, reusable UI primitives
- `lib/` — flat structure, one concern per file
- `services/` — single file, flat

**Exports:**
- Components: `export default ComponentName` at bottom of file
- Utilities/Services: Named exports (`export const functionName`)

## Where to Add New Code

**New Feature:**
- Primary code: `App.tsx` (if it affects state/routing) or new component in `components/`
- AI integration: Add function to `services/geminiService.ts`, import in `App.tsx`
- Tests: Co-locate as `FeatureName.test.tsx` in `components/` or `featureName.test.ts` in `lib/`

**New Component:**
- Implementation: `components/ComponentName.tsx` (PascalCase, default export)
- Props: Define `interface ComponentNameProps` at top of file
- Icons: Add SVG to `components/icons.tsx`

**New Utility:**
- Pure function: `lib/functionName.ts` (camelCase, named export)
- If related to outfit flow: extend `lib/outfitFlow.ts`
- If related to scene logic: extend `lib/sceneVariations.ts`

**New Type:**
- Add to `types.ts` at root level

**New Wardrobe Item:**
- Add to `defaultWardrobe` array in `wardrobe.ts`

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (via `npm run build`)
- Committed: No (should be in `.gitignore`)

**`assets/`:**
- Purpose: Static images imported at build time via Vite
- Generated: No — manually placed
- Committed: Yes

**`components/ui/`:**
- Purpose: Shadcn/aceternity-style reusable UI primitives
- Generated: No
- Committed: Yes
- Note: Only contains `compare.tsx` and `sparkles.tsx` currently

**Stub/Empty Components:**
- `AdjustmentPanel.tsx` — returns `null`, marked as unused
- `CropPanel.tsx` — returns `null`, marked as unused
- `EditorCanvas.tsx` — empty (license comment only)
- `ImageUploader.tsx` — empty (license comment only)

---

*Structure analysis: 2026-03-30*
