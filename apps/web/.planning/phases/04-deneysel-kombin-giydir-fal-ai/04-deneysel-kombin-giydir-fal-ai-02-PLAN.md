---
phase: 04-deneysel-kombin-giydir-fal-ai
plan: 02
type: execute
wave: 2
depends_on: [04-deneysel-kombin-giydir-fal-ai-01]
files_modified: [App.tsx, components/StartScreen.tsx, components/StartScreen.test.tsx, components/WardrobeModal.tsx, components/WardrobeModal.test.tsx]
autonomous: true
requirements: [EXP-01, EXP-02, EXP-05]
user_setup:
  - service: fal.ai
    why: "UI path depends on configured FAL_KEY before end-to-end verification"
    env_vars:
      - name: FAL_KEY
        source: "fal.ai dashboard API keys"
must_haves:
  truths:
    - "After model generation, the user sees both `Proceed to Styling` and `Deneysel kombin giydir` without breaking the standard path"
    - "Experimental mode stages garment references across categories and sends one fal.ai request only when the user explicitly submits"
    - "Loading, duplicate-submit guard, retry entry point, and error states are visible in the UI during experimental generation"
  artifacts:
    - path: "components/StartScreen.tsx"
      provides: "dual-entry styling actions"
    - path: "components/WardrobeModal.tsx"
      provides: "standard-vs-experimental selection behavior"
    - path: "App.tsx"
      provides: "mode split, staged selection state, final submit handler, and integration with falService"
  key_links:
    - from: "components/StartScreen.tsx"
      to: "App.tsx"
      via: "separate callbacks for standard and experimental entry"
      pattern: "onExperimental.*modelUrl|onModelFinalized"
    - from: "App.tsx"
      to: "services/falService.ts"
      via: "handleExperimentalGenerate"
      pattern: "generateExperimentalOutfitImage"
    - from: "components/WardrobeModal.tsx"
      to: "App.tsx"
      via: "staging callback instead of immediate Gemini render in experimental mode"
      pattern: "onStageGarment|selectionMode"
---

<objective>
Add the experimental UI path so users can enter a fal.ai-powered bundled outfit flow from the post-upload screen, stage references instead of rendering per item, and submit one final request with guarded UX.

Purpose: per D-01, D-02, D-03, D-05, D-06 the new flow must be visible and useful without regressing the existing Gemini styling experience.

Output: dual entry buttons, mode-aware wardrobe behavior, App state wiring, and UI tests.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-deneysel-kombin-giydir-fal-ai/04-deneysel-kombin-giydir-fal-ai-CONTEXT.md
@.planning/phases/04-deneysel-kombin-giydir-fal-ai/04-deneysel-kombin-giydir-fal-ai-RESEARCH.md
@.planning/phases/04-deneysel-kombin-giydir-fal-ai/04-deneysel-kombin-giydir-fal-ai-01-PLAN.md
@components/StartScreen.tsx
@components/WardrobeModal.tsx
@App.tsx

<interfaces>
From `components/StartScreen.tsx`:
```typescript
interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}
```

From `components/WardrobeModal.tsx`:
```typescript
interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
  activeCategory: GarmentCategory;
}
```

From `App.tsx`:
```typescript
const handleModelFinalized = (url: string) => { ... };
const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => { ... });
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add dual styling entry on StartScreen</name>
  <files>components/StartScreen.tsx, components/StartScreen.test.tsx</files>
  <behavior>
    - Test 1: when `generatedModelUrl` exists, both action buttons render and the experimental button text is exactly `Deneysel kombin giydir`
    - Test 2: clicking `Proceed to Styling` still calls the standard callback only
    - Test 3: clicking `Deneysel kombin giydir` calls the experimental callback with the same generated model URL
  </behavior>
  <action>Modify `StartScreen` so the post-generation action row renders two explicit entry buttons: the existing standard `Proceed to Styling` and the new `Deneysel kombin giydir` per D-01/D-02/D-03. Add a second callback prop (for example `onExperimentalStyling`) instead of overloading the existing one. Keep the current generation UX, reset behavior, and comparison UI unchanged. Add `components/StartScreen.test.tsx` to validate both entry actions and ensure the standard path remains intact.</action>
  <verify>
    <automated>npm test -- components/StartScreen.test.tsx</automated>
  </verify>
  <done>The start screen exposes a safe dual-entry split and automated tests prove the new button does not hijack the standard flow.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire experimental staging and one-shot generation into App and WardrobePanel</name>
  <files>App.tsx, components/WardrobeModal.tsx, components/WardrobeModal.test.tsx</files>
  <behavior>
    - Test 1: in standard mode, wardrobe clicks still trigger immediate `onGarmentSelect`
    - Test 2: in experimental mode, wardrobe clicks stage or replace one garment per category instead of calling Gemini immediately
    - Test 3: explicit experimental submit triggers one `generateExperimentalOutfitImage()` call, sets loading/error state, and blocks duplicate submits while pending
  </behavior>
  <action>Modify `App.tsx` to introduce a styling mode state (standard vs experimental) and a staged garment selection map keyed by category. When the experimental entry is chosen, initialize the same base model state as `handleModelFinalized`, but keep subsequent wardrobe interactions in staging mode instead of calling `generateVirtualTryOnImage()`. Extend `WardrobeModal.tsx` with a mode-aware callback path (`onStageGarment`, `selectionMode`, and staged selection highlighting) while preserving the existing standard behavior. In `App.tsx`, add an explicit final CTA in the sidebar for the experimental path (name chosen by agent discretion), require at least one staged garment before submit, call `generateExperimentalOutfitImage()` exactly once per click, show loading/progress/error text, expose a retry action after failure, and on success append a single generated result into `outfitHistory` so Canvas/download/undo continue to work. Do not remove or alter the standard Gemini single-garment flow.</action>
  <verify>
    <automated>npm test -- components/WardrobeModal.test.tsx components/StartScreen.test.tsx && npm run build</automated>
  </verify>
  <done>Experimental mode is fully wired from entry button to one-shot fal generation, with guarded staging UX and no regression in the standard path.</done>
</task>

</tasks>

<verification>
- `npm test -- components/StartScreen.test.tsx components/WardrobeModal.test.tsx services/falService.test.ts lib/experimentalBundle.test.ts`
- `npm run build`
- Browser smoke check: upload photo → generate model → verify both entry buttons → run one experimental bundled request and one standard garment request separately
</verification>

<success_criteria>
- User sees the new entry button with exact requested copy
- Standard and experimental flows are distinct and reusable from the same start screen
- Experimental flow stages garments and spends cost only on explicit final submit
- UI surfaces loading, error, retry, and duplicate-submit protection clearly
</success_criteria>

<output>
After completion, create `.planning/phases/04-deneysel-kombin-giydir-fal-ai/04-deneysel-kombin-giydir-fal-ai-02-SUMMARY.md`
</output>
