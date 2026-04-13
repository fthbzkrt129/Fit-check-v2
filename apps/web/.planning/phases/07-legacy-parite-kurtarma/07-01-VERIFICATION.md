---
phase: 07-legacy-parite-kurtarma
verified: 2026-04-12T06:45:00Z
status: gaps_found
score: 3/4 must-haves verified
gaps:
  - truth: "Failed model generation surfaces the real server error text while styling actions stay hidden"
    status: partial
    reason: "Client service preserves response text, but /api/ai/model does not catch provider failures and return that text in the HTTP response. In real runtime, uncaught server throws can collapse into a generic 500 response instead of the provider message."
    artifacts:
      - path: "apps/web/src/app/api/ai/model/route.ts"
        issue: "Route returns success only and has no error serialization path for provider failures."
      - path: "apps/web/src/lib/ai/providers/geminiServer.ts"
        issue: "Provider throws plain errors, but route does not convert them into a response body the client can preserve."
    missing:
      - "Catch model/provider errors in /api/ai/model and return a stable error response body/status containing the intended message."
      - "Add a route-level test proving failed model generation returns the server error text end-to-end."
---

# Phase 07-01 Verification Report

**Phase Goal:** Recover StartScreen and model-generation parity first so the new SaaS app regains a stable entry flow before deeper styling orchestration changes.
**Verified:** 2026-04-12T06:45:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User can upload an image, enter generating state, and reach generated-model preview flow | ✓ VERIFIED | `StartScreen.tsx` sets `userImageUrl`, `isGenerating`, `generatedModelUrl`; compare view renders uploaded image against generated model. |
| 2 | Runtime model generation uses secure `/api/ai/model` instead of browser-side Gemini provider | ✓ VERIFIED | `src/lib/kombin/services/geminiService.ts:45-59` posts to `/api/ai/model`; `src/app/api/ai/model/route.ts:6-9` forwards work to server provider. |
| 3 | Standard, experimental, and modelSwap CTAs stay in parity and use the same generated model URL | ✓ VERIFIED | `StartScreen.tsx:164-180` wires all three CTAs from `generatedModelUrl`; `StartScreen.test.tsx` covers standard, experimental, and modelSwap callbacks. |
| 4 | Failed model generation surfaces the real server error text and keeps styling actions hidden | ✗ FAILED | Hidden-action behavior is covered by `StartScreen.test.tsx:99-118`, but `/api/ai/model/route.ts` has no error-handling response path, so end-to-end server message preservation is not guaranteed. |

**Score:** 3/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/src/components/kombin/StartScreen.tsx` | StartScreen parity UI | ✓ VERIFIED | Substantive implementation with upload, loading, preview, retry, and CTA wiring. |
| `apps/web/src/lib/kombin/services/geminiService.ts` | Client wrapper for secure model endpoint | ✓ VERIFIED | Posts to `/api/ai/model` and preserves non-empty response text. |
| `apps/web/src/app/api/ai/model/route.ts` | Server runtime path for model generation | ⚠️ HOLLOW | Exists and is wired, but lacks failure serialization for end-to-end error preservation. |
| `apps/web/src/lib/ai/contracts.ts` | Request/response contract | ✓ VERIFIED | `modelRequestSchema` and `aiSuccessSchema` support the client/server boundary. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `StartScreen.tsx` | `geminiService.ts` | `generateModelImage(file)` | ✓ WIRED | Upload handler awaits service result and updates state. |
| `geminiService.ts` | `/api/ai/model` | `fetch('/api/ai/model', POST)` | ✓ WIRED | Correct runtime path is used in production code and tests. |
| `/api/ai/model` route | `geminiServer.generateModelImage` | direct call | ✓ WIRED | Route parses request and invokes server provider. |
| Provider failure | UI error state | HTTP error body -> thrown Error -> `getFriendlyErrorMessage` | ✗ PARTIAL | Client preserves response text if present, but route does not guarantee a response body with provider text on failure. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `StartScreen.tsx` | `generatedModelUrl` | `generateModelImage(file)` -> `/api/ai/model` -> `geminiServer.generateModelImage` | Yes on success path | ✓ FLOWING |
| `StartScreen.tsx` | `error` | thrown client/service error | Not reliably on real server failures | ⚠️ STATIC/UNSAFE |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| gemini service tests | `npm test -- src/lib/kombin/geminiService.test.ts` | 3 tests passed | ✓ PASS |
| StartScreen parity tests | `npm test -- src/components/kombin/StartScreen.test.tsx` | 5 tests passed | ✓ PASS |
| type safety | `npm run typecheck` | passed | ✓ PASS |
| production build | `npm run build` | passed | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `PARITY-01` | `07-01-PLAN.md` | Stable first visible styling interaction with secure routing | ? NEEDS HUMAN / TRACEABILITY GAP | Plan defines it, but `.planning/REQUIREMENTS.md` does not currently contain `PARITY-01`, so central traceability is missing. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/src/app/api/ai/model/route.ts` | 6-9 | Success-only route with no failure serialization | 🛑 Blocker | Breaks end-to-end preservation of server error text. |

### Human Verification Required

### 1. Visual StartScreen parity

**Test:** Upload a valid model photo in the real UI and inspect generating, preview, retry, and the three CTAs.
**Expected:** Loading state appears, generated preview replaces the edited side, and all three actions behave consistently.
**Why human:** Visual parity and interaction polish cannot be fully confirmed from static analysis.

### 2. Real failed model-generation response

**Test:** Trigger a real `/api/ai/model` failure from the browser.
**Expected:** The UI should show the intended server/provider error text, not a generic 500 failure.
**Why human:** Current code path suggests a gap; a real runtime check is needed after fixing the route.

### Gaps Summary

Client-side parity is mostly back: upload/generate flow exists, CTA parity is wired, targeted tests pass, and the runtime path now goes through `/api/ai/model`. The remaining blocker is failure-path integrity. The client service is ready to preserve server text, but the server route does not currently serialize provider failures into an HTTP response body, so the claimed end-to-end error preservation is not actually secured by the codebase.

---

_Verified: 2026-04-12T06:45:00Z_
_Verifier: the agent (gsd-verifier)_
