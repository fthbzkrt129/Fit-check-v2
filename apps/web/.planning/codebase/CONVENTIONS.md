# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- Components: PascalCase single-word names — `Canvas.tsx`, `StartScreen.tsx`, `CategoryStepPanel.tsx`
- Utility modules: camelCase — `outfitFlow.ts`, `poseOptions.ts`, `downloadImage.ts`, `imagePersistence.ts`
- Services: camelCase descriptive — `geminiService.ts`
- Icons grouped in one file: `components/icons.tsx`
- Test files co-located with source, suffix `.test.ts` / `.test.tsx` — `Canvas.test.tsx`, `outfitFlow.test.ts`
- UI primitives: `components/ui/sparkles.tsx`, `components/ui/compare.tsx`

**Functions:**
- camelCase — `getNextCategory`, `isCategorySelectionAllowed`, `blobUrlToDataUrl`, `getFriendlyErrorMessage`
- Event handlers prefixed `handle` — `handleGarmentSelect`, `handlePoseSelect`, `handleStartOver`
- Builder/utility `build*` — `buildGarmentInstructions`, `buildScenePrompt`
- Generator `generate*` — `generateModelImage`, `generateVirtualTryOnImage`, `generatePoseVariation`

**Variables:**
- camelCase for all — `activeCategory`, `selectedScene`, `currentPoseIndex`, `poseInstruction`
- Boolean state prefixed `is` — `isLoading`, `isMobileDrawerOpen`, `isGenerating`, `isPinned`
- Constants (module-level): UPPER_CASE for static data — `POSE_OPTIONS`, `POSE_INSTRUCTIONS`, `POSE_LABELS`, `CATEGORY_ORDER`

**Types:**
- PascalCase — `GarmentCategory`, `OutfitLayer`, `WardrobeItem`, `SceneVariation`, `CanvasProps`
- Union types for fixed sets — `'top' | 'bottom' | 'footwear' | 'accessory'`
- Interface suffix: `Props` for component props — `CanvasProps`, `StartScreenProps`, `LoadingOverlayProps`

## Code Style

**Formatting:**
- No ESLint or Prettier config files detected; formatting relies on developer discipline
- 2-space indentation observed throughout
- Trailing semicolons always present
- Double quotes for strings in most files

**Linting:**
- No linter configured — add ESLint + Prettier for enforcement

## Import Organization

**Order:**
1. React / external framework imports
2. Third-party library imports (`framer-motion`, `clsx`, `tailwind-merge`, `@google/genai`)
3. Internal services — `../services/geminiService`
4. Internal lib utilities — `../lib/utils`, `../lib/outfitFlow`, `../lib/sceneVariations`
5. Internal types — `../types`
6. Sibling/child components — `./icons`, `./Spinner`, `./Canvas`
7. Asset imports (images) — `../assets/ana.png`

**Path Aliases:**
- `@/*` maps to project root (`.`) — configured in `tsconfig.json` path mapping, aliased in `vite.config.ts`
- Alias not commonly used in actual source; relative `../` and `./` paths preferred

## Error Handling

**Patterns:**
- `try/catch/finally` around all async API calls in component event handlers
- Error state stored as `useState<string | null>(null)` in `App.tsx` and child components
- Friendly error transformation via `getFriendlyErrorMessage(error, context)` in `lib/utils.ts`
  - Catches `Error` instances, strings, and unknown types
  - Special-case handling for Gemini API "Unsupported MIME type" errors
- Service layer (`geminiService.ts`): throws `new Error(...)` with descriptive messages for blocked prompts, missing images, unexpected finish reasons
- Null-guard returns: `if (!imageUrl) return;` in `downloadImage.ts`
- DOM validation in entry point: `if (!rootElement) throw new Error(...)`

**User-facing errors:**
- Red alert box with `role="alert"` in sidebar (`App.tsx`)
- Inline error text in `StartScreen.tsx`

## Logging

**Framework:** No logging framework; `console` not used for user-facing messages.

**Patterns:**
- Errors surfaced to React state, not logged to console
- No structured logging or telemetry detected

## Comments

**When to Comment:**
- Sparse comments; used for non-obvious logic (e.g., `// Fallback if current pose not in available list`)
- License header on all `.tsx` and key `.ts` files: `@license SPDX-License-Identifier: Apache-2.0`

**JSDoc/TSDoc:**
- Not used; no JSDoc annotations detected

## Function Design

**Size:** Functions generally kept small and focused. Complex handlers in `App.tsx` (e.g., `handleGarmentSelect`, `handlePoseSelect`) are 30-60 lines but well-structured with early returns.

**Parameters:** Objects destructured in component signatures. Primitive params for utility functions.

**Return Values:**
- Async functions return `Promise<string>` (data URLs)
- Utility functions return booleans or arrays
- Components: always `React.FC` with explicit props interface

## Module Design

**Exports:**
- Components use `export default ComponentName`
- Lib utilities use named exports: `export const getNextCategory = ...`
- Services use named exports: `export const generateModelImage = ...`
- Types use named exports: `export interface`, `export type`

**Barrel Files:** Not used; direct imports from source files preferred.

## Styling

**Approach:** Tailwind CSS (utility classes), no custom CSS modules.
- `clsx` + `tailwind-merge` via `cn()` helper in `lib/utils.ts`
- All styling inline via `className` strings
- Responsive: `md:`, `sm:`, `lg:` breakpoint prefixes
- Glassmorphism patterns: `backdrop-blur-md`, `bg-white/80`
- Animations: `framer-motion` for transitions (`AnimatePresence`, `motion.div`), CSS classes (`animate-spin`, `animate-fade-in`, `animate-zoom-in`, `animate-pulse`)

## Component Patterns

**Functional components only:**
```typescript
const ComponentName: React.FC<PropsInterface> = ({ prop1, prop2 }) => {
  return (/* JSX */);
};
export default ComponentName;
```

**State management:** All state in `App.tsx` via `useState`; no external state library (no Redux, Zustand, etc.)

**Memoization:** `useMemo` for derived state in `App.tsx` — `activeOutfitLayers`, `displayImageUrl`, `canDownloadImage`, etc.

**Callbacks:** `useCallback` for event handlers passed to children.

**Custom hooks:** `useMediaQuery` defined in `App.tsx` (not extracted to lib).

## Type Definitions

**Location:** Centralized in `types.ts` at project root.

**Pattern:** Interfaces for structured data, type aliases for unions:
```typescript
export type GarmentCategory = 'top' | 'bottom' | 'footwear' | 'accessory';
export interface WardrobeItem { id: string; name: string; ... }
```

---

*Convention analysis: 2026-03-30*
