---
phase: 04-deneysel-kombin-giydir-fal-ai
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, package-lock.json, types.ts, lib/experimentalBundle.ts, lib/experimentalBundle.test.ts, services/falService.ts, services/falService.test.ts]
autonomous: true
requirements: [EXP-03, EXP-04]
user_setup:
  - service: fal.ai
    why: "Experimental bundled outfit generation"
    env_vars:
      - name: FAL_KEY
        source: "fal.ai dashboard API keys"
      - name: VITE_FAL_EXPERIMENTAL_MODEL
        source: ".env.local optional override; default wan/v2.6/image-to-image"
must_haves:
  truths:
    - "Experimental flow can transform one base model image plus multiple garment references into a single fal.ai request"
    - "Prompt text references image ordering deterministically so image 1 is always the scene/model anchor"
    - "Retry-safe fal.ai adapter prevents accidental duplicate cost spikes from repeated transient failures"
  artifacts:
    - path: "lib/experimentalBundle.ts"
      provides: "prompt composition and ordered image bundle helpers"
      exports: ["buildExperimentalBundlePrompt", "buildExperimentalBundleInput"]
    - path: "services/falService.ts"
      provides: "fal.ai request adapter with upload, status subscription, bounded retry, and normalized errors"
      exports: ["generateExperimentalOutfitImage", "getExperimentalFalModel"]
    - path: "services/falService.test.ts"
      provides: "adapter contract tests"
  key_links:
    - from: "services/falService.ts"
      to: "@fal-ai/client"
      via: "fal.config + queue/ storage APIs"
      pattern: "fal\\.(config|queue|storage)"
    - from: "services/falService.ts"
      to: "lib/experimentalBundle.ts"
      via: "input preparation before submit"
      pattern: "buildExperimentalBundle"
---

<objective>
Create the experimental fal.ai integration surface that can bundle the model image plus selected garment references into one request, with deterministic prompt composition and bounded retry behavior.

Purpose: per D-04, D-05, D-06, D-07 the expensive part must move from many Gemini calls to one fal.ai call.

Output: fal adapter service, bundle/prompt helper, tests, and dependency wiring.
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
@services/geminiService.ts
@types.ts

<interfaces>
From `types.ts`:
```typescript
export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category?: GarmentCategory;
  source: 'system' | 'user';
  isPinned?: boolean;
}
```

From `services/geminiService.ts`:
```typescript
const dataUrlToParts = (dataUrl: string) => { ... };
export const buildVirtualTryOnPrompt = (...) => string;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Define experimental bundle contracts and prompt helper</name>
  <files>types.ts, lib/experimentalBundle.ts, lib/experimentalBundle.test.ts</files>
  <behavior>
    - Test 1: base model image is always emitted as image 1 and garment refs begin at image 2
    - Test 2: duplicate garment ids are collapsed so one request does not upload the same item twice per D-06
    - Test 3: prompt text explicitly references image ordering and includes the user-provided final scene description per D-07
  </behavior>
  <action>Create `lib/experimentalBundle.ts` and add any missing shared types in `types.ts` for experimental staging (for example `StylingMode`, `ExperimentalGarmentSelection`, `ExperimentalBundleInput`). Implement `buildExperimentalBundleInput()` and `buildExperimentalBundlePrompt()` so they accept the base model image URL, ordered garment selections, and an optional final scene description. The helper must emit a deterministic ordered array where base image is first per D-05/D-07, refuse empty garment selections, dedupe repeated ids for cost control per D-06, and generate prompt text in the pattern "Take the element from image 2... and place it on image 1". Add focused unit tests in `lib/experimentalBundle.test.ts`; do not call fal.ai here.</action>
  <verify>
    <automated>npm test -- lib/experimentalBundle.test.ts</automated>
  </verify>
  <done>Experimental bundle helpers exist, exported types are stable, and tests prove ordered prompt + image bundling behavior.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement fal.ai adapter with bounded retries and normalized errors</name>
  <files>package.json, package-lock.json, services/falService.ts, services/falService.test.ts</files>
  <behavior>
    - Test 1: adapter resolves the fal model endpoint from env with `wan/v2.6/image-to-image` default
    - Test 2: adapter transforms File/Blob inputs for fal upload and submits one queue request with all bundle images
    - Test 3: retryable fal errors are retried once; validation/non-retryable errors fail fast with friendly messages
  </behavior>
  <action>Add `@fal-ai/client` to dependencies and implement `services/falService.ts`. Configure fal with `FAL_KEY`/Vite-exposed env following existing client-side env pattern, but annotate the security caveat in code comments and summary. Export `getExperimentalFalModel()` with default `wan/v2.6/image-to-image`, and `generateExperimentalOutfitImage(input)` which uses the bundle helper, uploads File objects via fal storage helpers, submits a queue request, subscribes to status updates for progress text, retrieves the final image URL/data, and maps fal `ApiError`/`ValidationError`/unknown errors through project-friendly messages. Add a single bounded retry only when `isRetryableError(error)` is true; never loop indefinitely and never silently double-submit. Write isolated tests by mocking `@fal-ai/client` rather than hitting the network.</action>
  <verify>
    <automated>npm test -- services/falService.test.ts lib/experimentalBundle.test.ts</automated>
  </verify>
  <done>fal.ai adapter is installed, test-covered, uses one-request bundle submission, and enforces retry/error behavior suitable for cost-controlled experimental generation.</done>
</task>

</tasks>

<verification>
- `npm test -- services/falService.test.ts lib/experimentalBundle.test.ts`
- `npm run build`
- Confirm no existing Gemini exports were removed from `services/geminiService.ts`
</verification>

<success_criteria>
- fal.ai dependency and adapter compile cleanly
- Prompt/image bundling is deterministic and test-covered
- One transient failure causes at most one retry; permanent failures surface a friendly error
</success_criteria>

<output>
After completion, create `.planning/phases/04-deneysel-kombin-giydir-fal-ai/04-deneysel-kombin-giydir-fal-ai-01-SUMMARY.md`
</output>
