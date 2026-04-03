---
phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
plan: 04
subsystem: api
tags: [ai, gemini, fal, api, server-only]
requires:
  - phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
    provides: tenant routing shell and workspace bootstrap foundation
provides:
  - typed AI request contracts
  - server-only Gemini and fal adapters
  - workspace-guarded AI route handlers
affects: [ui-migration, secure-generation, provider-integration]
tech-stack:
  added: [server-side fetch adapters for Gemini and fal]
  patterns: [server-only env access, workspace membership gate, typed JSON route contracts]
key-files:
  created: [apps/web/src/lib/ai/contracts.ts, apps/web/src/lib/ai/contracts.test.ts, apps/web/src/lib/ai/providers/geminiServer.ts, apps/web/src/lib/ai/providers/falServer.ts, apps/web/src/lib/ai/providers.test.ts, apps/web/src/lib/ai/requireWorkspaceAccess.ts, apps/web/src/app/api/ai/model/route.ts, apps/web/src/app/api/ai/try-on/route.ts, apps/web/src/app/api/ai/pose/route.ts, apps/web/src/app/api/ai/scene/route.ts, apps/web/src/app/api/ai/experimental/route.ts]
  modified: []
key-decisions:
  - "Provider key'leri sadece `getServerEnv()` yolundan okunur; browser tarafinda kullanılmaz."
  - "AI endpoint'leri workspace membership guard gecmeden provider cagrisi yapmaz."
  - "Yeni app icin provider adapter'lari fetch tabanli ve package-light tutuldu."
patterns-established:
  - "Pattern 1: Route handler -> zod contract -> workspace guard -> provider adapter zinciri."
  - "Pattern 2: Standard Gemini ve experimental fal akislari ayni backend guvenlik sinirinda toplanir."
requirements-completed: [SAAS-04, SAAS-05]
duration: 8 min
completed: 2026-04-03
---

# Phase 05 Plan 04: Secure AI gateway Summary

**Gemini ve fal.ai yuzeyi server-only adapter'lar ve workspace-guarded API route'lari arkasina tasinarak browser key exposure riski kapatildi.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-03T03:53:00+03:00
- **Completed:** 2026-04-03T04:01:00+03:00
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- AI request shape'lari zod contract'leriyle tiplenip validate edildi.
- Server-only Gemini ve fal adapter'lari browser env bagimliligindan ayrildi.
- `model`, `try-on`, `pose`, `scene`, `experimental` endpoint'leri workspace guard ile backend surface olarak eklendi.

## Task Commits

1. **Task 1: Define server-side AI contracts and provider adapters** - `405fdd6` (feat)
2. **Task 2: Expose tenant-aware AI route handlers** - `689dbbf` (feat)

**Plan metadata:** `pending`

## Files Created/Modified
- `apps/web/src/lib/ai/contracts.ts` - typed request/response schemas
- `apps/web/src/lib/ai/contracts.test.ts` - contract validation tests
- `apps/web/src/lib/ai/providers/geminiServer.ts` - server-only Gemini adapter
- `apps/web/src/lib/ai/providers/falServer.ts` - server-only fal adapter with bounded retry
- `apps/web/src/lib/ai/providers.test.ts` - provider behavior tests
- `apps/web/src/lib/ai/requireWorkspaceAccess.ts` - workspace membership guard
- `apps/web/src/app/api/ai/model/route.ts` - model endpoint
- `apps/web/src/app/api/ai/try-on/route.ts` - try-on endpoint
- `apps/web/src/app/api/ai/pose/route.ts` - pose endpoint
- `apps/web/src/app/api/ai/scene/route.ts` - scene endpoint
- `apps/web/src/app/api/ai/experimental/route.ts` - experimental endpoint

## Decisions Made
- Yeni provider adapter'lari package eklemeden fetch tabanli tutuldu; bu, apps/web dependency yuzeyini kucuk tuttu.
- `workspaceSlug` route payload'larinda acik geliyor ama yetki son karari `requireWorkspaceAccess()` veriyor.
- Browser-facing `apps/web/src/app` altinda `GEMINI_API_KEY`, `API_KEY`, `FAL_KEY` referansi birakilmadi.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Provider testinde Vitest hoist nedeniyle env mock'u erken patladi**
- **Found during:** Task 1 verification
- **Issue:** `vi.mock` factory icinde tanimlanan degisken hoist edildigi icin test import sirasinda `getServerEnv` initialize olmadan erisildi.
- **Fix:** Mock factory inline tanimlandi ve `getServerEnv` dogrudan mock modulu icinden import edilip `vi.mocked` ile kullanildi.
- **Files modified:** `apps/web/src/lib/ai/providers.test.ts`
- **Verification:** `npm --prefix apps/web test -- src/lib/ai/contracts.test.ts src/lib/ai/providers.test.ts`
- **Committed in:** `405fdd6`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Sadece test harness duzeltildi. Runtime tasarim degismedi.

## Issues Encountered
- None

## User Setup Required

- `GEMINI_API_KEY` ve `FAL_KEY` server env olarak Vercel/Supabase deployment ortaminda tanimlanmali.

## Next Phase Readiness
- Yeni SaaS app shell'i artik auth, tenant ve secure AI backend temeline sahip.
- Eksik kalan ana operasyonel dogrulama local Supabase db testlerinin Docker ile yeniden kosulmasi.

## Self-Check: PASSED

---
*Phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi*
*Completed: 2026-04-03*
