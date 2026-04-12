# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Vitest (configured in `vite.config.ts` under `test` key)
- Config: `vite.config.ts` (inline `test` block)
- Environment: `jsdom`
- Globals: `true` (no need to import `describe`/`it`/`expect` in every file, but imports are still used)

**Assertion Library:**
- Vitest built-in `expect` (same API as Jest)
- `@testing-library/jest-dom` for DOM matchers (`toBeInTheDocument`, `toBeDisabled`, etc.)

**Setup:**
- `vitest.setup.ts` — single import: `import '@testing-library/jest-dom'`

**Run Commands:**
```bash
npm test              # vitest run (single run, no watch)
```

## Test File Organization

**Location:** Co-located with source files — same directory as the module being tested.

**Naming:** `{ModuleName}.test.ts` or `{ModuleName}.test.tsx`

**Structure:**
```
components/
  Canvas.test.tsx
  CategoryStepPanel.test.tsx
  ScenePanel.test.tsx
  SceneVariationList.test.tsx
  WardrobeModal.test.tsx
lib/
  downloadImage.test.ts
  imagePersistence.test.ts
  outfitFlow.test.ts
  pinnedWardrobe.test.ts
  poseOptions.test.ts
  sceneGenerationBase.test.ts
  sceneVariations.test.ts
services/
  geminiService.test.ts
  geminiService.scene.test.ts
```

**Current test count:** 14 test files across 3 directories.

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest';

describe('ModuleName', () => {
  it('describes expected behavior', () => {
    // arrange
    const input = ...;
    // act
    const result = functionUnderTest(input);
    // assert
    expect(result).toBe(expected);
  });
});
```

**Patterns:**
- `describe` blocks named after the function/component being tested
- `it` blocks describe behavior, not implementation — `'keeps full-body framing stable for footwear replacements'`
- Flat structure: no nested `describe` blocks observed
- Component tests use `@testing-library/react` with `render`, `screen`, `fireEvent`

## Mocking

**Framework:** Vitest built-in — `vi.fn()`, `vi.spyOn()`, `vi.stubGlobal()`

**Patterns:**
```typescript
// Callback spies in component tests
const onSelectScene = vi.fn();
render(<ScenePanel onSelectScene={onSelectScene} ... />);
fireEvent.click(screen.getByRole('button', { name: 'Studio' }));
expect(onSelectScene).toHaveBeenCalledWith('studio');

// API spies in unit tests
vi.spyOn(globalThis, 'fetch').mockResolvedValue({
  blob: async () => new Blob(['image'], { type: 'image/png' }),
} as Response);

// Global stubs
vi.stubGlobal('FileReader', MockFileReader);

// Restore between tests
beforeEach(() => {
  vi.restoreAllMocks();
});
```

**What to Mock:**
- Browser APIs: `fetch`, `FileReader`, `URL.createObjectURL`, `document.createElement`, `setTimeout`
- `localStorage` (via jsdom built-in: `localStorage.clear()`, `localStorage.setItem()`, `localStorage.getItem()`)
- Component callbacks passed as props: always `vi.fn()`

**What NOT to Mock:**
- Pure utility functions (tested directly)
- Type definitions and constants (tested via their consumers)
- React rendering itself (using real `@testing-library/react` render)

## Fixtures and Factories

**Test Data:**
```typescript
// Inline factory functions for test data
const createVariation = (id: string, outfitIndex: number, createdAt: number): SceneVariation => ({
  id,
  outfitIndex,
  scene: 'studio',
  lighting: 'soft daylight',
  imageUrl: `https://example.com/${id}.jpg`,
  sourcePose: 'Full frontal view, hands on hips',
  createdAt,
});

const createPinnedItem = (overrides: Partial<WardrobeItem> = {}): WardrobeItem => ({
  id: 'user-item-1',
  name: 'Pinned Bag',
  url: 'data:image/png;base64,abc123',
  category: 'accessory',
  source: 'user',
  isPinned: true,
  ...overrides,
});
```

**Location:** Inline within test files; no shared fixtures directory.

**Pattern:** Factory functions with optional overrides using `Partial<T>` spread.

## Coverage

**Requirements:** None enforced — no coverage config in `vite.config.ts`.

**View Coverage:**
```bash
npx vitest run --coverage    # Requires @vitest/coverage-v8 or @vitest/coverage-istanbul
```

## Test Types

**Unit Tests (lib/):**
- Pure function logic: `getNextCategory`, `isCategorySelectionAllowed`, `blobUrlToDataUrl`, `addSceneVariationWithLimit`, `downloadImage`
- Data validation: `POSE_OPTIONS` structure, localStorage round-trips
- Browser API interaction: fetch mocks, FileReader stubs

**Unit Tests (services/):**
- Prompt building: `buildGarmentInstructions`, `buildScenePrompt`, `getSceneModelName`
- Not tested: actual Gemini API calls (requires real API key)

**Component Tests (components/):**
- Render verification: checking elements appear in DOM
- Interaction: `fireEvent.click`, verifying callback invocation
- State-driven re-render via `rerender()`
- DOM order assertions: `compareDocumentPosition` for layout order
- Accessibility: `screen.getByRole('button', { name: /.../i })`

**E2E Tests:** Not present — no Playwright or Cypress config detected.

## Common Patterns

**Async Testing:**
```typescript
it('converts a blob url into a data url', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ... } as Response);
  await expect(blobUrlToDataUrl('blob:http://localhost/example'))
    .resolves.toBe('data:image/png;base64,converted-image');
});
```

**Error Testing:**
```typescript
it('returns an empty array when localStorage data is invalid', () => {
  localStorage.setItem(STORAGE_KEY, '{not-valid-json');
  expect(getPinnedWardrobeItems()).toEqual([]);
});
```

**Component Re-render Pattern:**
```typescript
const { rerender } = render(<Component prop={initialValue} />);
// ... interact ...
rerender(<Component prop={updatedValue} />);
expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeEnabled();
```

**Null/Edge Case Testing:**
```typescript
it('does nothing when image url is missing', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  downloadImage(null, 'look.png');
  expect(fetchSpy).not.toHaveBeenCalled();
});
```

## Coverage Gaps

**Areas without tests:**
- `App.tsx` — main orchestrator with all state logic (511 lines, no tests)
- `StartScreen.tsx` — file upload + generation flow
- Most panel components: `AdjustmentPanel`, `CropPanel`, `EditorCanvas`, `FilterPanel`, `PosePanel`, `ProductSelector`, `Toolbar`, `ToolOptions`
- `wardrobe.ts` — static data
- Actual Gemini API integration (not testable without mocking the SDK)

**Risk:** High — `App.tsx` contains critical state management, async flows, and error handling with zero test coverage.

---

*Testing analysis: 2026-03-30*
