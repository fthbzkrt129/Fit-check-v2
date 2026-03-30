# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Single-Page React Application with centralized state management in root component and a thin service layer for AI integration.

**Key Characteristics:**
- All application state lives in `App.tsx` via `useState` hooks — no external state management library (no Redux, Zustand, or Context API)
- AI image generation is the core concern; the entire UI is a funnel around calling Google Gemini image APIs
- Components are "dumb/presentational" — they receive props and emit callbacks, no component owns its own server state
- `lib/` functions are pure utilities — they transform data, manage localStorage, or resolve image references
- `services/` has a single file (`geminiService.ts`) as the sole external API gateway

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI, capture user input, emit callbacks to `App.tsx`
- Location: `components/`
- Contains: React functional components, SVG icon components, UI primitives (`components/ui/`)
- Depends on: `types.ts`, `lib/utils.ts` (for `cn()`), asset imports
- Used by: `App.tsx` (composition), parent components

**State & Orchestration Layer (App.tsx):**
- Purpose: Owns ALL application state, handles all business logic, wires components to services
- Location: `App.tsx`
- Contains: 17 `useState` hooks, `useMemo` derived state, `useCallback` event handlers, `useMediaQuery` custom hook
- Depends on: `services/geminiService.ts`, `lib/*` utilities, `wardrobe.ts`, `types.ts`
- Used by: `index.tsx` (entry point)

**Service Layer:**
- Purpose: Encapsulate all Google Gemini API calls with prompt engineering
- Location: `services/geminiService.ts`
- Contains: `generateModelImage`, `generateVirtualTryOnImage`, `generatePoseVariation`, `generateSceneVariation`, prompt builder helpers
- Depends on: `@google/genai` SDK, `types.ts`
- Used by: `App.tsx` only

**Utility / Library Layer:**
- Purpose: Pure functions for image handling, outfit flow logic, pose data, scene variations, localStorage persistence
- Location: `lib/`
- Contains: 8 modules (`utils.ts`, `outfitFlow.ts`, `sceneVariations.ts`, `poseOptions.ts`, `imagePersistence.ts`, `pinnedWardrobe.ts`, `downloadImage.ts`)
- Depends on: `types.ts` (some modules), browser APIs (`localStorage`, `FileReader`, `fetch`)
- Used by: `App.tsx`, components (`lib/utils.ts` for `cn()`)

**Type Definitions:**
- Purpose: Shared TypeScript interfaces and union types for the entire app
- Location: `types.ts`
- Contains: `GarmentCategory`, `TopLengthOption`, `WardrobeItem`, `OutfitLayer`, `SceneOption`, `LightingOption`, `SceneQualityMode`, `SceneVariation`

## Data Flow

**1. Model Upload Flow:**

1. User uploads photo in `StartScreen` → calls `generateModelImage()` in `geminiService.ts`
2. Gemini returns a studio model photo as a data URL
3. `StartScreen` calls `onModelFinalized(url)` → `App.tsx` sets `modelImageUrl` and initializes `outfitHistory` with a `base` layer
4. UI transitions from `StartScreen` to main dressing view via `AnimatePresence`

**2. Virtual Try-On Flow (Garment Application):**

1. User selects garment in `WardrobePanel` → converts URL to `File` via canvas (`urlToFile`)
2. `WardrobePanel` calls `onGarmentSelect(file, item)` → `App.tsx.handleGarmentSelect()`
3. `handleGarmentSelect()` calls `generateVirtualTryOnImage(displayImageUrl, file, activeCategory, selectedTopLength)`
4. Gemini returns modified image as data URL
5. New `OutfitLayer` is appended to `outfitHistory`, `currentOutfitIndex` increments
6. `activeCategory` advances to next category via `getNextCategory()`
7. `displayImageUrl` (derived via `useMemo`) reflects the latest layer

**3. Pose Variation Flow:**

1. User picks pose from `Canvas` pose selector → calls `onSelectPose(newIndex)`
2. `App.tsx.handlePoseSelect()` checks if pose image already cached in `currentLayer.poseImages[poseInstruction]`
3. If not cached, calls `generatePoseVariation(baseImageForPoseChange, poseInstruction)`
4. Result stored in `outfitHistory[currentOutfitIndex].poseImages[poseInstruction]`
5. `displayImageUrl` updates to show new pose

**4. Scene Generation Flow:**

1. User configures scene + lighting in `ScenePanel` → clicks "Sahne Oluştur"
2. `App.tsx.handleGenerateScene()` calls `generateSceneVariation(baseImage, scene, lighting, qualityMode)`
3. Result stored as `SceneVariation` in `sceneVariations` state (max 3 per outfit index)
4. User selects variation from `SceneVariationList` → `selectedSceneVariationId` set → `displayImageUrl` shows scene variation

**State Management:**
- All state in `App.tsx` via individual `useState` hooks
- Derived state via `useMemo`: `activeOutfitLayers`, `activeGarmentIds`, `completedCategories`, `currentSceneVariations`, `selectedSceneVariation`, `displayImageUrl`, `availablePoseKeys`, `canDownloadImage`
- No shared context or global store — props flow down, callbacks flow up

## Key Abstractions

**OutfitLayer:**
- Purpose: Represents one layer in the outfit stack (base model OR a garment applied)
- Example: `{ garment: WardrobeItem | null, poseImages: Record<string, string>, category: GarmentCategory | 'base' }`
- Pattern: Each layer caches generated pose images keyed by pose instruction string

**WardrobeItem:**
- Purpose: Represents a garment available for try-on
- Example: `{ id: string, name: string, url: string, category: GarmentCategory, source: 'system' | 'user' }`
- Pattern: `source` distinguishes built-in items from user uploads; `isPinned` flag for localStorage persistence

**SceneVariation:**
- Purpose: Represents a scene/lighting transformation result
- Pattern: Tied to `outfitIndex` so variations are scoped per outfit combination

**GarmentCategory Flow:**
- Purpose: Sequential category progression (`top` → `bottom` → `footwear` → `accessory`)
- Implementation: `getNextCategory()` in `lib/outfitFlow.ts`
- Constraint: `activeCategory` state controls which wardrobe items are visible and what AI instructions are sent

## Entry Points

**Application Entry:**
- Location: `index.tsx`
- Triggers: Browser loads `index.html` → Vite serves `index.tsx` → renders `<App />` inside `React.StrictMode`
- Responsibilities: Mount React root

**Model Upload Entry:**
- Location: `components/StartScreen.tsx`
- Triggers: User clicks "Upload Photo" → file input change → `generateModelImage()`
- Responsibilities: Handle first user interaction, show before/after comparison with `Compare` slider

**Main Application View:**
- Location: `App.tsx` (the `modelImageUrl ? (...) : (...)` ternary)
- Triggers: User clicks "Proceed to Styling" in `StartScreen`
- Responsibilities: Orchestrates Canvas, sidebar panels, all try-on/pose/scene workflows

## Error Handling

**Strategy:** Catches errors at handler level in `App.tsx`, displays user-friendly messages in a red alert banner.

**Patterns:**
- Each `useCallback` handler wraps `geminiService` calls in `try/catch/finally`
- `getFriendlyErrorMessage(err, context)` in `lib/utils.ts` normalizes error messages (handles MIME type errors, Gemini safety blocks)
- `geminiService.ts` has `handleApiResponse()` that checks `promptFeedback.blockReason` and `finishReason` before extracting image data
- Loading state is always toggled in `finally` block to prevent stuck UI
- On pose generation failure, pose index reverts to previous value (`setCurrentPoseIndex(prevPoseIndex)`)

## Cross-Cutting Concerns

**Responsive Design:** Custom `useMediaQuery` hook in `App.tsx` detects mobile viewport. Mobile gets a slide-out drawer for the sidebar; desktop shows a persistent side panel.

**Animations:** `framer-motion` used throughout for view transitions (`AnimatePresence` + `motion.div`), pose menu, loading overlays, scene variation list, footer suggestion rotation.

**Image Handling:** All AI-generated images stored as data URLs in component state. `lib/imagePersistence.ts` converts blob URLs to data URLs for localStorage pinning. `lib/downloadImage.ts` handles image download via blob URL + temporary anchor element.

**Localization:** Mixed Turkish/English labels. Category labels, top-length labels, and some UI strings are in Turkish (e.g., "Üst Giyim", "Bel", "Kalça", "Tunik", "Sahne Oluştur"). English used for prompts, scene descriptions, and error messages.

---

*Architecture analysis: 2026-03-30*
