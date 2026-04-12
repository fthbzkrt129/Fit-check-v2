# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**App.tsx - Monolithic Component:**
- Issue: 511 lines with 20+ useState hooks managing all application state
- Files: `App.tsx`
- Impact: Unmaintainable - any change requires understanding the entire file. Business logic (garment selection, pose handling, scene generation) embedded directly in component.
- Fix approach: Extract state management to custom hooks (e.g., `useOutfitHistory`, `useWardrobe`) and extract UI panels to separate components with their own isolated concerns.

**Missing Custom Hooks:**
- Issue: All workflow logic (handleGarmentSelect, handlePoseSelect, handleGenerateScene) directly in App.tsx
- Files: `App.tsx` lines 168-350
- Impact: Business logic mixed with presentation - impossible to test independently or reuse
- Fix approach: Create `hooks/useVirtualTryOn.ts` that encapsulates the garment selection and API calls, `hooks/useSceneGeneration.ts` for scene logic

**No TypeScript Strict Mode:**
- Issue: No visible TypeScript config for strict mode
- Files: Not found in project root
- Impact: Missing null checks, any types may slip through
- Fix approach: Add `tsconfig.json` with `"strict": true` or verify existing config has strict mode enabled

**No React Error Boundary:**
- Issue: App-level error state exists but no Error Boundary to catch render-time crashes
- Files: `App.tsx`
- Impact: A single component crash (e.g., from library bug) takes down entire app with no recovery
- Fix approach: Wrap main content in `<ErrorBoundary fallback={<ErrorFallback />}>` component

**Storage Type Safety:**
- Issue: localStorage data parsed without validation
- Files: `lib/pinnedWardrobe.ts` line 14
- Impact: Corrupted or tampered localStorage data could cause runtime crashes
- Fix approach: Add Zod schemas or manual validation for stored WardrobeItem[] data

---

## Known Bugs

**API Key Missing at Import Time:**
- Symptoms: App crashes immediately on load with "Cannot read properties of undefined" if GEMINI_API_KEY not set
- Files: `services/geminiService.ts` line 59
- Trigger: Running app without .env.local or with invalid API_KEY
- Workaround: Always ensure GEMINI_API_KEY is set before running

**Memory Leak - Blob URLs:**
- Symptoms: Memory usage grows over time as user uploads images
- Files: `components/WardrobeModal.tsx` line 89, `lib/imagePersistence.ts`
- Trigger: Creating object URLs with URL.createObjectURL() without cleanup
- Workaround: Store blob URLs in ref and call URL.revokeObjectURL() when component unmounts or items removed

**Deprecated Media Query API:**
- Symptoms: Console warnings about deprecated API in older browser versions
- Files: `App.tsx` lines 42, 51
- Trigger: App runs in browser that fires deprecation warnings
- Workaround: Already fixed in current code (uses addEventListener('change')), comments about deprecated code should be removed

---

## Security Considerations

**LocalStorage XSS Risk:**
- Risk: Data in localStorage could be tampered with by XSS on other domains
- Files: `lib/pinnedWardrobe.ts` lines 7-18
- Current mitigation: Only stores data URLs (already base64 encoded)
- Recommendations: Add schema validation before using stored data, don't trust URL字段

**API Key Exposure:**
- Risk: Key exposed in client-side bundle
- Files: `vite.config.ts` lines 18-20, `services/geminiService.ts` line 59
- Current mitigation: Key is client-side only (Gemini API accepts client-side keys), but could be rate-limited or quota-stolen
- Recommendations: Consider proxying through backend if quota abuse is a concern, add VITE_ prefix to env vars for explicit client exposure

**.gitignore Coverage:**
- Current: `.env.local` excluded via `*.local` pattern (good)
- Additional: None needed - .gitignore appropriately excludes build artifacts

---

## Performance Bottlenecks

**Large Re-render on State Change:**
- Problem: Any state change in 20+ useState hooks causes full App.tsx re-render
- Files: `App.tsx` lines 61-76
- Cause: No React.memo on child components, all state lives in single component
- Improvement path: Wrap Canvas, OutfitStack, and panels in React.memo, consider useReducer to batch state updates

**No Virtualization in Wardrobe Grid:**
- Problem: Large wardrobe could cause slow rendering
- Files: `components/WardrobeModal.tsx` line 101
- Cause: Renders all wardrobe items in grid
- Improvement path: Use react-window or react-virtualized for large wardrobe lists

---

## Fragile Areas

**wardrobe.ts Hardcoded URLs:**
- Why fragile: Depends on external GitHub/Unsplash URLs that may change or become unavailable
- Files: `wardrobe.ts` lines 13, 21, 27, 34, 41
- Safe modification: Add fallback placeholder images or error handling for broken URLs

**geminiService API Response Parsing:**
- Why fragile: Tightly coupled to GoogleGenAI response structure
- Files: `services/geminiService.ts` lines 33-57
- Safe modification: Create abstraction layer with interface so API client can be swapped

**Data URL Conversion:**
- Why fragile: Complex file-to-part and dataUrl conversion logic repeated
- Files: `services/geminiService.ts` lines 9-31
- Safe extraction: Move to `lib/apiHelpers.ts` with tests

---

## Scaling Limits

**State in Single Component:**
- Current capacity: Manageable for current feature set
- Limit: Adding more features (e.g., undo/redo, save outfits) requires understanding 500+ line component
- Scaling path: Refactor to custom hooks now, before more features added

**API Rate Limiting:**
- Current capacity: Depends on Gemini API quota
- Limit: No retry logic visible - single failed API call shows error, user must retry
- Scaling path: Add exponential backoff retry logic for failed API calls

---

## Missing Critical Features

**No Undo/Redo for Outfit History:**
- Problem: User cannot undo last garment selection
- Blocks: Users make mistakes and must restart flow

**No Retry on Network Failure:**
- Problem: API calls fail silently after timeout
- Blocks: Network flakiness causes poor UX

**No Loading State Caching:**
- Problem: Refreshing page loses entire outfit flow
- Blocks: Persistence of in-progress sessions

---

## Test Coverage Gaps

**Unit Tests for Service Layer:**
- What's not tested: API response parsing, error handling paths
- Files: `services/geminiService.ts`
- Risk: Changes to API client library could break image generation silently
- Priority: High

**Integration Tests for User Flows:**
- What's not tested: Full garment selection > pose variation > scene generation flow
- Files: None found
- Risk: Breaking changes in hook dependencies could fail entire workflow
- Priority: High

**Utilities Not Tested:**
- What's not tested: sceneVariations.ts, pinnedWardrobe.ts, outfitFlow.ts
- Files: `lib/*.ts`
- Risk: Utility logic bugs cause incorrect image selection
- Priority: Medium

---

*Concerns audit: 2026-03-30*