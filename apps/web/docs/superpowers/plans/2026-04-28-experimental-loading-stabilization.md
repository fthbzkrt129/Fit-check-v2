# Experimental Loading Stabilization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent visible flicker during the first product image upload and experimental outfit generation loading flow.

**Architecture:** Keep the existing `KombinEditor` flow, but stabilize experimental loading status updates so rapid provider callbacks do not force unnecessary full editor re-renders. Use a small hook-local throttle/de-dupe layer instead of adding global state or changing API behavior.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Next.js.

---

## Chunk 1: Stabilize Experimental Loading Messages

### Task 1: Add a regression test

**Files:**
- Modify: `src/components/kombin/KombinEditor.test.tsx`
- Modify: `src/components/kombin/KombinEditor.tsx`

- [ ] **Step 1: Write the failing test**
  Add a test that starts experimental mode, stages garments, triggers generation, fires multiple rapid `onStatusUpdate` calls with duplicate/intermediate messages, and asserts only the latest stabilized message appears while generation still completes.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test -- src/components/kombin/KombinEditor.test.tsx`
  Expected: FAIL because `KombinEditor` currently applies every status update immediately.

- [ ] **Step 3: Write minimal implementation**
  Add refs in `KombinEditor` for last status, pending status, and timeout. Replace direct `setLoadingMessage` inside experimental `onStatusUpdate` with a stable helper that ignores duplicate messages and batches rapid updates. Clear timeout in `finally` and on unmount.

- [ ] **Step 4: Run focused tests**
  Run: `npm run test -- src/components/kombin/KombinEditor.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Run quality checks**
  Run: `npm run typecheck`
  Expected: PASS.
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 6: Browser verify**
  Use Playwright MCP against `http://lvh.me:3000/workspace/fatih-912e1e` and confirm no console errors while the page loads.
