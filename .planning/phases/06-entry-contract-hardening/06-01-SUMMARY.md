---
phase: 06-entry-contract-hardening
plan: 01
subsystem: auth
tags: [nextjs, middleware, vitest, supabase, tenant-routing]
requires:
  - phase: 05-auth-bootstrap
    provides: Supabase SSR auth middleware, tenant host parsing, and workspace URL helpers
provides:
  - Shared entry contract helpers for root pass, login redirect, and tenant rewrite intents
  - Middleware coverage for root, tenant, localhost, and preview host entry behavior
  - Narrower middleware matcher excluding api, static, and metadata routes
affects: [06-02 auth handoff, phase-07 branded-login-experience, root marketing routing]
tech-stack:
  added: []
  patterns: [pure entry-routing contract helper, host-aware middleware gate, cookie-preserving custom responses]
key-files:
  created: [apps/web/src/lib/tenant/entryContract.ts, apps/web/src/lib/tenant/entryContract.test.ts]
  modified: [apps/web/middleware.ts]
key-decisions:
  - "Root pass, login redirect, and tenant rewrite decisions are derived from one pure helper module."
  - "Middleware copies Supabase-mutated cookies onto redirect and rewrite responses to preserve SSR auth state."
patterns-established:
  - "Entry contract: hostname classification feeds redirect and rewrite intents instead of open-coded middleware branches."
  - "Tenant middleware: exclude static and metadata paths at matcher level and keep a bypass helper as a defensive guard."
requirements-completed: [FLOW-02]
duration: 9 min
completed: 2026-04-05
---

# Phase 6 Plan 1: Entry Contract Hardening Summary

**Shared root-vs-tenant entry contract with canonical login redirects, tenant shell rewrites, and narrowed Next.js middleware matching.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-05T23:25:46Z
- **Completed:** 2026-04-05T23:35:19Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Root and tenant entry behavior now flows through one pure helper instead of scattered middleware logic.
- Tenant host traffic preserves workspace intent via canonical root login redirects and deterministic tenant rewrite paths.
- Middleware scope is reduced to app entry traffic by excluding api, static asset, and metadata paths.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract the root-versus-tenant entry contract into a pure helper** - `5439856`, `de5c0a9` (test, feat)
2. **Task 2: Refit middleware to the shared contract and narrow the matcher** - `1245026`, `98d4ab4` (test, feat)

**Plan metadata:** pending

_Note: TDD tasks produced RED and GREEN commits per task._

## Files Created/Modified
- `apps/web/src/lib/tenant/entryContract.ts` - Pure host-aware helper for bypass checks, login redirect intent, and tenant rewrite path generation
- `apps/web/src/lib/tenant/entryContract.test.ts` - Contract and middleware tests covering root, tenant, localhost, preview, and matcher exclusions
- `apps/web/middleware.ts` - Shared-contract driven middleware with cookie-preserving redirect and rewrite responses

## Decisions Made
- Used `getEntryRedirectIntent()` as the single source of truth for root pass, login redirect, and tenant rewrite decisions so later auth handoff work can reuse the same contract.
- Preserved cookies from `updateSession(request)` when returning custom redirects or rewrites so Supabase SSR state is not dropped outside plain `NextResponse.next()`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Preserved Supabase cookie mutations on custom middleware responses**
- **Found during:** Task 2 (Refit middleware to the shared contract and narrow the matcher)
- **Issue:** Redirect and rewrite branches could drop cookies written by `updateSession(request)`, weakening SSR auth consistency.
- **Fix:** Added cookie copy logic before returning redirect and rewrite responses.
- **Files modified:** `apps/web/middleware.ts`
- **Verification:** `npm --prefix apps/web test -- src/lib/tenant/entryContract.test.ts src/lib/tenant/tenantRouting.test.ts && npm --prefix apps/web run build`
- **Committed in:** `98d4ab4`

**2. [Rule 3 - Blocking] Bridged middleware tests to the new helper alias inside Vitest**
- **Found during:** Task 2 (Refit middleware to the shared contract and narrow the matcher)
- **Issue:** Middleware unit coverage failed because Vitest could not resolve the new `@/lib/tenant/entryContract` import from `middleware.ts` directly in the test environment.
- **Fix:** Added a targeted test-side alias mock that resolves the middleware import to the real local helper module.
- **Files modified:** `apps/web/src/lib/tenant/entryContract.test.ts`
- **Verification:** `npm --prefix apps/web test -- src/lib/tenant/entryContract.test.ts src/lib/tenant/tenantRouting.test.ts && npm --prefix apps/web run build`
- **Committed in:** `98d4ab4`

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both fixes stayed inside Phase 06 scope and were necessary to keep routing verification and Supabase SSR behavior reliable.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 06 auth handoff hardening can now reuse the shared entry contract instead of duplicating root/tenant branching.
- Root marketing routing and tenant middleware behavior are verified for root, localhost, and preview-style hosts.

## Self-Check: PASSED

- Verified files exist: `apps/web/src/lib/tenant/entryContract.ts`, `apps/web/src/lib/tenant/entryContract.test.ts`, `apps/web/middleware.ts`, `.planning/phases/06-entry-contract-hardening/06-01-SUMMARY.md`
- Verified commits exist: `5439856`, `de5c0a9`, `1245026`, `98d4ab4`

---
*Phase: 06-entry-contract-hardening*
*Completed: 2026-04-05*
