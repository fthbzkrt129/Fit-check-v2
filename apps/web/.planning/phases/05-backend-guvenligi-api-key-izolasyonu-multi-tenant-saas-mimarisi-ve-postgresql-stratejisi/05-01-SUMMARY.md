---
phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
plan: 01
subsystem: infra
tags: [nextjs, supabase, env, vitest, saas]
requires:
  - phase: 04-deneysel-kombin-giydir-fal-ai
    provides: mevcut fit-check AI deneyiminin korunacak urun omurgasi
provides:
  - apps/web altinda ayri Next.js SaaS uygulama siniri
  - typed env contract ve temel test harness
  - root domain landing shell ve ortak layout
affects: [auth, tenant-routing, database, ai-gateway]
tech-stack:
  added: [Next.js, React 19, @supabase/ssr, @supabase/supabase-js, zod, Vitest]
  patterns: [separate apps/web workspace, typed environment parsing, plain global CSS landing shell]
key-files:
  created: [apps/web/src/app/layout.tsx, apps/web/src/app/globals.css, apps/web/src/app/(marketing)/page.tsx, apps/web/src/app/not-found.tsx]
  modified: [apps/web/package.json, apps/web/package-lock.json, apps/web/next.config.mjs, apps/web/src/lib/env.ts]
key-decisions:
  - "Yeni SaaS omurgasi mevcut SPA'dan ayri olarak apps/web altinda yurur."
  - "Public env ve server-only secret contract tek modulde dogrulanir."
  - "Landing shell bilerek hafif tutulur; styling UI bu plana tasinmaz."
patterns-established:
  - "Pattern 1: apps/web yeni SaaS surface alani olarak phase 5 degisikliklerini izole eder."
  - "Pattern 2: env parsing getPublicEnv/getServerEnv uzerinden tek kaynaktan yapilir."
requirements-completed: [SAAS-01, SAAS-05]
duration: 8 min
completed: 2026-04-03
---

# Phase 05 Plan 01: SaaS foundation scaffold Summary

**Yeni `apps/web` Next.js workspace'i, typed secret contract'i ve root landing shell'i ile fit-check icin ayri SaaS giris siniri olusturuldu.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-03T03:27:00+03:00
- **Completed:** 2026-04-03T03:35:40+03:00
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- `apps/web` altinda build alinabilen ayri Next.js App Router uygulama siniri kuruldu.
- Supabase, root domain ve AI secret'lari icin typed env parser kalibi netlestirildi.
- Ortak landing page, root layout ve not-found shell ile SaaS giris alani kodlandi.

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold the new app workspace and env contract** - `40d3403` (feat)
2. **Task 2: Add the root landing shell and shared app layout** - `dafeb16` (feat)

**Plan metadata:** `pending`

## Files Created/Modified
- `apps/web/package.json` - Next.js workspace script ve dependency contract'i
- `apps/web/package-lock.json` - workspace dependency lockfile'i
- `apps/web/next.config.mjs` - output tracing root ile workspace build config'i
- `apps/web/src/lib/env.ts` - public/server env parser ve fail-fast validation
- `apps/web/src/app/layout.tsx` - ortak root layout ve metadata
- `apps/web/src/app/globals.css` - hafif global shell stilleri
- `apps/web/src/app/(marketing)/page.tsx` - root domain landing shell
- `apps/web/src/app/not-found.tsx` - tenant/root ayirimi icin not-found ekrani

## Decisions Made
- `apps/web` mevcut Vite SPA'dan bagimsiz tutuldu; phase 5 auth ve tenant isleri mevcut urunu kirletmeden burada ilerleyecek.
- `outputFileTracingRoot` repo kokune sabitlendi; coklu lockfile/workspace algisi build warning'e donusmeden cozuldu.
- Landing shell sadece giris yonlendirmesi ve platform mesajlasmasi verir; eski styling experience bu planda tasinmadi.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Env parser varsayilan girdisi Next.js typecheck sirasinda patladi**
- **Found during:** Task 1 (Scaffold the new app workspace and env contract)
- **Issue:** `process.env` dogrudan varsayilan parametre olarak kullanilinca Next.js build typecheck'i `ProcessEnv` ile dar env input tiplerini uyumsuz buldu.
- **Fix:** `readPublicEnv` ve `readServerEnv` helper'lari eklenerek varsayilan inputler explicit object shape ile uretildi.
- **Files modified:** `apps/web/src/lib/env.ts`
- **Verification:** `npm --prefix apps/web test -- src/lib/env.test.ts`, `npm --prefix apps/web run build`
- **Committed in:** `40d3403`

**2. [Rule 2 - Missing Critical] Next.js workspace root tracing acikca tanimlandi**
- **Found during:** Task 2 verification
- **Issue:** Next.js coklu lockfile nedeniyle yanlis workspace root secme warning'i veriyordu; ileride build tracing ve deploy davranisini belirsizlestirebilirdi.
- **Fix:** `apps/web/next.config.mjs` icine `outputFileTracingRoot` eklendi.
- **Files modified:** `apps/web/next.config.mjs`
- **Verification:** `npm --prefix apps/web run build`
- **Committed in:** `40d3403`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Iki duzeltme de buildable SaaS scaffold icin gerekliydi. Scope buyutulmedi.

## Issues Encountered
- None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `apps/web` auth, middleware ve tenant routing planlari icin hazir.
- Supabase client katmani ve subdomain handling bir sonraki planda bu scaffold uzerine eklenebilir.

## Self-Check: PASSED

---
*Phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi*
*Completed: 2026-04-03*
