# Model Swap Workspace Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a separate `Manken Degistir` entry path that starts from the same generated model state as styling, then lets the user upload a new person photo and rebuild the current outfit on the new model.

**Architecture:** Keep the initial upload flow intact and branch only after model generation. Reuse the existing dressing workspace shell, but introduce a `modelSwap` mode with a dedicated upload panel section and rebuild the outfit history by replaying active garments on top of the newly generated model.

**Tech Stack:** React, TypeScript, Vitest, existing Gemini image services

---

## Chunk 1: Entry Flow

### Task 1: Add entry buttons after initial model generation

**Files:**
- Modify: `components/StartScreen.tsx`
- Test: `components/StartScreen.test.tsx`

- [ ] Add a failing test covering the new `Manken Degistir` CTA.
- [ ] Update `StartScreen` props so the generated-model screen can branch into styling or model-swap.
- [ ] Verify both CTAs render with the expected layout behavior.

## Chunk 2: Workspace Mode

### Task 2: Add model-swap workspace mode in app state

**Files:**
- Modify: `App.tsx`

- [ ] Introduce a workspace mode state for `styling` and `modelSwap`.
- [ ] Keep the shared canvas/layout shell and swap only the page title/panel content where needed.

## Chunk 3: Model Swap Panel

### Task 3: Add a dedicated panel section for uploading a new model

**Files:**
- Create: `components/ModelSwapPanel.tsx`
- Test: `components/ModelSwapPanel.test.tsx`
- Modify: `App.tsx`

- [ ] Add a failing component test for upload/apply interactions.
- [ ] Build a focused panel component with preview, upload input, and apply button.
- [ ] Mount it only in `modelSwap` mode.

## Chunk 4: Rebuild Outfit On New Model

### Task 4: Reapply active garments on a newly generated model image

**Files:**
- Modify: `App.tsx`

- [ ] Generate a fresh standardized model image from the uploaded photo.
- [ ] Replay the active outfit layers in order using existing try-on generation.
- [ ] Replace current outfit history with the rebuilt layers so further edits still work.
- [ ] Reset scene variations that no longer match the old model.

## Chunk 5: Verification

### Task 5: Run focused tests and production build

**Files:**
- Test: `components/StartScreen.test.tsx`
- Test: `components/ModelSwapPanel.test.tsx`

- [ ] Run the new focused tests.
- [ ] Run the full test suite.
- [ ] Run the production build.
