---
phase: 04-deneysel-kombin-giydir-fal-ai
plan: 02
subsystem: ui
tags: [react, fal-ai, vitest, experimental-staging, testing-library]
requires:
  - phase: 04-deneysel-kombin-giydir-fal-ai
    provides: fal.ai adapter and experimental bundle helpers from plan 01
provides:
  - dual styling entry from the generated model screen
  - staged experimental wardrobe mode with one-shot fal submission
  - retry and duplicate-submit guard in the experimental sidebar UX
affects: [verification, user-setup, experimental-styling]
tech-stack:
  added: [@testing-library/react, @testing-library/jest-dom]
  patterns: [dual entry CTA, staged category selections, inline retry UX]
key-files:
  created: [components/StartScreen.test.tsx]
  modified: [App.tsx, components/StartScreen.tsx, components/WardrobeModal.tsx, components/WardrobeModal.test.tsx, package.json, package-lock.json]
key-decisions:
  - "Experimental flow stages garments by category and submits only on explicit CTA."
  - "Experimental errors stay visible in the sidebar with a dedicated retry action."
patterns-established:
  - "Component tests use local Testing Library deps to avoid cross-workspace React resolution issues."
  - "Experimental mode reuses existing outfit history/canvas stack by appending a synthetic bundle layer."
requirements-completed: [EXP-01, EXP-02, EXP-05]
duration: 10m
completed: 2026-04-02
---

# Phase 4 Plan 2: experimental UI flow Summary

**Dual start-screen entry and staged experimental styling flow that submits one guarded fal.ai bundle request**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-02T08:37:01+03:00
- **Completed:** 2026-04-02T08:47:25+03:00
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Start screen artık standart ve deneysel styling girişlerini ayrı callback’lerle sunuyor.
- Wardrobe panel standart ve deneysel mod arasında ayrıştı; deneysel mod parça stage ediyor.
- App içinde tek-shot fal request, loading/progress, retry ve duplicate-submit guard eklendi.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add dual styling entry on StartScreen** - `e974e5b` (test), `bd29740` (feat)
2. **Task 2: Wire experimental staging and one-shot generation into App and WardrobePanel** - `7c6bd17` (test), `25ba8fd` (feat)

## Files Created/Modified
- `components/StartScreen.tsx` - Experimental CTA ile dual entry action row
- `components/StartScreen.test.tsx` - Start screen entry split tests
- `components/WardrobeModal.tsx` - Mode-aware garment selection and staging callbacks
- `components/WardrobeModal.test.tsx` - WardrobePanel ve App experimental flow tests
- `App.tsx` - Styling mode state, staged selections, fal submit/retry handling
- `package.json` - Local Testing Library dev dependencies
- `package-lock.json` - Lockfile update for test tooling

## Decisions Made
- Deneysel modda staged selection map kategori anahtarlı tutuldu; aynı kategoride son seçim eskisini değiştiriyor.
- Başarılı deneysel üretim mevcut canvas/download/undo akışını bozmamak için `outfitHistory` içine tek synthetic layer olarak eklendi.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed local Testing Library packages**
- **Found during:** Task 1 (Add dual styling entry on StartScreen)
- **Issue:** Test runner üst dizindeki `@testing-library/react` kopyasını çözümlüyordu ve iki React instance yüzünden component tests `Invalid hook call` ile kırılıyordu.
- **Fix:** `@testing-library/react` ve `@testing-library/jest-dom` lokal dev dependency olarak eklendi.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm test -- components/StartScreen.test.tsx components/WardrobeModal.test.tsx`
- **Committed in:** `bd29740`

**2. [Rule 1 - Bug] Added safe `matchMedia` fallback in `App.tsx`**
- **Found during:** Task 2 (Wire experimental staging and one-shot generation into App and WardrobePanel)
- **Issue:** Test/jsdom ortamında `window.matchMedia` olmayınca App render aşamasında crash oluyordu.
- **Fix:** `useMediaQuery` içinde `matchMedia` availability guard eklendi.
- **Files modified:** `App.tsx`
- **Verification:** `npm test -- components/WardrobeModal.test.tsx components/StartScreen.test.tsx`
- **Committed in:** `25ba8fd`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Her iki düzeltme de plan kapsamındaki UI davranışını güvenilir biçimde doğrulamak için gerekliydi. Scope creep oluşmadı.

## Issues Encountered

- Experimental App integration testinde `matchMedia` eksikliği ortaya çıktı; güvenli fallback ile çözüldü.

## User Setup Required

External services require manual configuration:
- `FAL_KEY` olmadan deneysel submit çalışmaz.
- Browser smoke test için fal.ai key’in yerel env’de tanımlı olması gerekir.

## Known Stubs

None.

## Next Phase Readiness

- Faz hedefi için gerekli UI ve service wiring tamamlandı.
- Human/browser smoke test ile deneysel ve standart akış birlikte doğrulanabilir.

## Self-Check: PASSED

- Summary, verification artifact ve plan commit hash'leri disk ve git üzerinde doğrulandı.
