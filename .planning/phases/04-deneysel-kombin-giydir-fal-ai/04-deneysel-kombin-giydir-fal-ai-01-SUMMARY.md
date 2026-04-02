---
phase: 04-deneysel-kombin-giydir-fal-ai
plan: 01
subsystem: api
tags: [fal-ai, react, vitest, prompt-composition, retry]
requires:
  - phase: 03-undo-redo
    provides: existing outfit history and rendering flow preserved for experimental extension
provides:
  - fal.ai adapter with bounded retry and normalized error messages
  - deterministic bundled prompt/input builder for one-shot outfit generation
  - unit coverage for bundle ordering and fal submission behavior
affects: [ui, experimental-styling, verification]
tech-stack:
  added: [@fal-ai/client]
  patterns: [deterministic image ordering, one-shot bundled request, bounded retry]
key-files:
  created: [lib/experimentalBundle.ts, lib/experimentalBundle.test.ts, services/falService.ts, services/falService.test.ts]
  modified: [package.json, package-lock.json, types.ts]
key-decisions:
  - "Base model image is always image 1 so prompt references stay deterministic."
  - "Retry only once for retryable fal.ai failures to avoid duplicate cost spikes."
patterns-established:
  - "Experimental services normalize third-party API failures into user-facing Turkish messages."
  - "Bundle helpers dedupe garment ids before upload to control request cost."
requirements-completed: [EXP-03, EXP-04]
duration: 5m
completed: 2026-04-02
---

# Phase 4 Plan 1: fal.ai integration surface Summary

**Deterministic fal.ai bundle helper and single-request adapter with bounded retry for experimental outfit generation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T08:20:28+03:00
- **Completed:** 2026-04-02T08:25:04+03:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Base model + garment references artık tek bundle içinde sıralı hazırlanıyor.
- fal.ai adapter tek queue request, status subscription ve normalized error mapping ile eklendi.
- Bundle ordering, dedupe ve retry davranışı test ile doğrulandı.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define experimental bundle contracts and prompt helper** - `da7ac60` (feat)
2. **Task 2: Implement fal.ai adapter with bounded retries and normalized errors** - `478eb6c` (feat)

## Files Created/Modified
- `lib/experimentalBundle.ts` - Deterministic image ordering ve prompt composition helper
- `lib/experimentalBundle.test.ts` - Bundle ordering, dedupe ve prompt assertions
- `services/falService.ts` - fal.ai upload/queue/result adapter with retry normalization
- `services/falService.test.ts` - fal adapter contract tests with mocked client
- `types.ts` - Experimental staging ve bundle types
- `package.json` - fal.ai client dependency
- `package-lock.json` - Dependency lock update

## Decisions Made
- Base model her zaman `image 1` kaldı; prompt tüm garment referanslarını buna göre numaralandırıyor.
- Retry stratejisi yalnızca retryable fal.ai hatalarında tek tekrar ile sınırlandı.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

External services require manual configuration:
- `FAL_KEY` eklenmeli.
- İstenirse `VITE_FAL_EXPERIMENTAL_MODEL` ile model override edilebilir.

## Known Stubs

None.

## Next Phase Readiness

- UI katmanı artık fal.ai adapter’ı çağırabilecek durumda.
- Wave 2 bu adapter üstüne deneysel giriş ve staged submit UX’ini güvenle bağlayabilir.

## Self-Check: PASSED

- Summary, verification artifact ve plan commit hash'leri disk ve git üzerinde doğrulandı.
