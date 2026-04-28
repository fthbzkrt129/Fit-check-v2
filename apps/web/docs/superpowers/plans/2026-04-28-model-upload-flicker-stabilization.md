# Model Upload Flicker Stabilization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visible flicker during first model generation by keeping the compare card visually stable and reducing action-area layout shift.

**Architecture:** Keep the existing StartScreen flow, but remove the loading-state pulse animation from the preview card and reserve stable space for the post-generation action row. This avoids changing generation logic or compare behavior while targeting the two UI sources of flicker directly.

**Tech Stack:** React, Next.js App Router, Vitest, Testing Library, Tailwind/CSS utilities

---

## Chunk 1: StartScreen Stabilization

### Task 1: Lock the desired loading-shell behavior with tests

**Files:**
- Modify: `apps/web/src/components/kombin/StartScreen.test.tsx`
- Modify: `apps/web/src/components/kombin/StartScreen.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions that during generation:
- the compare card wrapper does not include `animate-pulse`
- the action area container exists with a stable test id even before buttons appear

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/kombin/StartScreen.test.tsx`
Expected: FAIL because the current loading wrapper still uses `animate-pulse` and no stable action area test hook exists.

- [ ] **Step 3: Write minimal implementation**

Update `StartScreen.tsx` to:
- remove `animate-pulse` from the compare card loading state
- keep a persistent actions container mounted with reserved spacing/min-height
- render buttons inside that container only when generation completes successfully

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/kombin/StartScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/kombin/StartScreen.tsx apps/web/src/components/kombin/StartScreen.test.tsx
git commit -m "fix: stabilize model generation preview"
```

### Task 2: Verify no regressions in related flows

**Files:**
- Test: `apps/web/src/components/kombin/KombinEditor.test.tsx`

- [ ] **Step 1: Run related tests**

Run: `npm run test -- src/components/kombin/StartScreen.test.tsx src/components/kombin/KombinEditor.test.tsx`
Expected: PASS

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 3: Browser verification**

Verify in browser:
- upload first image
- compare card stays visually stable while generating
- action/download area no longer jumps noticeably when buttons appear
