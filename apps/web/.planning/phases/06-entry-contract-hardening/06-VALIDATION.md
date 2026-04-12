---
phase: 06
slug: entry-contract-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Next.js build |
| **Config file** | `apps/web/package.json` scripts + existing Vitest setup |
| **Quick run command** | `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/lib/auth/messages.test.ts` |
| **Full suite command** | `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/lib/auth/messages.test.ts src/lib/tenant/bootstrapWorkspace.test.ts && npm --prefix apps/web run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/lib/auth/messages.test.ts`
- **After every plan wave:** Run `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/lib/auth/messages.test.ts src/lib/tenant/bootstrapWorkspace.test.ts && npm --prefix apps/web run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | FLOW-02 | unit | `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/lib/tenant/entryContract.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | FLOW-02 | build/regression | `npm --prefix apps/web run build` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | FLOW-03 | unit | `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/app/auth/auth-flow.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | FLOW-02, FLOW-03 | integration/build | `npm --prefix apps/web test -- src/lib/tenant/tenantRouting.test.ts src/app/auth/auth-flow.test.ts && npm --prefix apps/web run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/lib/tenant/entryContract.test.ts` — contract tests for login redirect and final destination resolution
- [ ] `apps/web/src/app/auth/auth-flow.test.ts` — callback / finish-signup handoff behavior tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Root domain marketing surface opens without tenant redirect collision in local preview | FLOW-02 | Host-header/browser-level behavior is easier to confirm interactively after automated tests pass | Run `npm --prefix apps/web dev`, open root host and a tenant-style local host, confirm root stays on marketing page and tenant host lands on login/workspace as expected |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
