---
title: Old Root App vs apps-web Gap Analysis
type: analysis
status: active
created: 2026-04-12
updated: 2026-04-12
tags:
  - project
  - migration
  - apps/web
  - parity
---

# Old Root App vs apps-web Gap Analysis

## Summary

The old root-level Vite/React app and the newer `apps/web` Next.js app are not in a clean migration-complete state. Most end-user styling capabilities appear in `apps/web`, but the most important AI flows are re-architected at the backend and not fully wired into the current UI.

## Key Findings

- The old root app exposed model generation, virtual try-on, pose variation, scene variation, model swap, undo/redo, wardrobe persistence, and experimental bundled fal.ai generation.
- `apps/web` contains counterparts for nearly all of those capabilities in code.
- The largest gap is architectural: `apps/web` still uses legacy browser-side AI service modules in the editor UI while the new tenant-protected server-side API gateway already exists.
- Routing is not fully consolidated: both `/workspace/[workspaceSlug]` and `/_tenant/[workspaceSlug]` exist.
- Some legacy prompt/config artifacts from the old root app remain unaudited, so silent feature loss is still possible.
- End-to-end parity is not yet proven by user-flow tests.

## Risk Assessment

### High Risk

- UI still depends on legacy browser-side Gemini/fal service modules.
- Tenant-aware API gateway exists but is not the only execution path.
- Old root app deletion is not yet safe.

### Medium Risk

- Docs and planning pages still reference the old Vite/App.tsx architecture.
- Wardrobe/session persistence parity exists but is not fully validated against real flows.

### Low Risk

- Backend tenant protection and Supabase wiring exist and appear directionally correct.

## Capability Status

| Capability | Status | Notes |
|---|---|---|
| Model generation | Re-architected but not wired | API route exists, UI still uses legacy service |
| Virtual try-on | Re-architected but not wired | Same pattern as model generation |
| Pose variation | Re-architected but not wired | Backend exists, UI path still legacy |
| Scene variation | Re-architected but not wired | Backend exists, UI path still legacy |
| Experimental fal.ai bundle flow | Re-architected but not wired | High migration risk |
| Model swap | Migrated | Present in editor |
| Undo/redo and outfit history | Migrated | Present in editor |
| Wardrobe upload/pin/persistence | Partially migrated | Present but needs parity validation |
| Canonical tenant routing | Partially migrated | Competing routes still exist |
| Legacy prompt/config artifacts | Missing or unverified | Requires audit |

## Deletion Decision

The old root app should be treated as **unsafe to delete** until all of the following are complete:

1. `apps/web` UI no longer imports legacy browser-side AI services.
2. A single canonical tenant route remains.
3. Legacy prompt/config artifacts are either migrated or intentionally deprecated.
4. End-to-end parity flows pass.

## Recommended Phases

1. Freeze parity baseline and inventory every old-root capability/artifact.
2. Rewire all editor AI calls through tenant-protected `/api/ai/*` routes.
3. Consolidate routing to a single canonical workspace path.
4. Audit and migrate or retire legacy prompt/config artifacts.
5. Add E2E parity checks and only then decommission the old root app.

## Related Notes

- [[overview]]
- [[log]]
- [[session-2026-04-12-workspace-routing-layout-fix-wrapup]]
