# Phase 06 Research - Entry Contract Hardening

**Date:** 2026-04-06
**Status:** Complete
**Scope:** Root marketing surface, auth callback handoff, tenant routing safety

## What exists now

- `apps/web/middleware.ts` root host isteklerini pass-through yapıyor; tenant host isteklerinde auth refresh + login redirect + `/_tenant/[workspaceSlug]` rewrite uyguluyor.
- `apps/web/src/app/(marketing)/page.tsx` root marketing shell olarak duruyor.
- `apps/web/src/app/login/page.tsx` `next` query param'ini okuyup login/signup/magic-link submit ediyor.
- `apps/web/src/app/auth/callback/route.ts` `code` exchange sonrası `next` veya `user_metadata.workspace_slug` ile workspace URL'e redirect ediyor.
- `apps/web/src/app/auth/finish-signup/route.ts` fallback provisioning yapıp workspace subdomain'ine redirect ediyor.

## Current risks for Phase 06

1. **Entry contract daginik** - root landing, login, callback ve finish-signup ayni handoff sozlesmesini merkezi bir helper yerine daginik param/redirect mantigi ile kullaniyor.
2. **Middleware matcher fazla genis** - mevcut matcher `api` ve metadata route'larini da yakaliyor; Phase 06 scope'u marketing/auth olsa da bu routing contract'in yan etkilerini arttiriyor.
3. **Redirect canonicalization eksik** - Supabase docs callback tarafinda `x-forwarded-host`/origin farkina dikkat cekiyor; mevcut kod root domain ve workspace domain canonicalization'ini ortak helper ile normalize etmiyor.
4. **Behavior test coverage eksik** - tenant parsing testli, ama middleware redirect/rewrite matrix'i ile callback/finish-signup handoff contract'i icin route-level unit test yok.

## Relevant existing patterns

### Pattern: hostname-derived tenant routing
- Source: Phase 05 Plan 02 summary
- Use `resolveTenantHost()` + `buildWorkspaceUrl()` as canonical contract.
- Tenant identity client param'larindan degil hostname'den cikarilmali.

### Pattern: Supabase SSR middleware refresh
- Source: `@supabase/ssr` docs
- Middleware icinde `createServerClient(...)` sonra hemen `auth.getUser()` cagrilmali.
- Response/cookie zinciri korunmali; yeni response uretilirse cookie'ler tasinmali.

### Pattern: callback code exchange
- Source: Supabase Next.js SSR docs
- `exchangeCodeForSession(code)` route handler'da yapilmali.
- Redirect target'i sanitize/canonicalize edilmeli; relative veya allowed host contract'i disina cikilmamali.

## Recommended implementation direction

### 1. Introduce a single entry-routing contract module
Create a small `src/lib/tenant/entryContract.ts`-style helper layer that:
- resolves whether request stays on root marketing surface,
- builds login URL with preserved `next` workspace intent,
- resolves callback/finish-signup final redirect target,
- normalizes localhost / production / preview behavior in one place.

Why: Phase 06 goal is behavior hardening, not UI. Centralizing this contract reduces drift between middleware, login page, callback and finish-signup.

### 2. Keep middleware focused on host/auth gate only
Middleware should:
- ignore `api`, `_next/*`, image/static, and metadata files via matcher,
- allow root domain marketing + auth routes through,
- redirect unauthenticated tenant traffic to root `/login?next={workspaceSlug}`,
- rewrite authenticated tenant traffic to `/_tenant/{workspaceSlug}`.

Avoid adding homepage UI or new auth providers here.

### 3. Preserve handoff intent across all auth modes
`next`/workspace intent must survive:
- tenant -> login redirect,
- magic-link callback,
- password login -> finish-signup,
- signup -> finish-signup,
- callback with existing `user_metadata.workspace_slug` fallback.

This should be verified with contract tests, not only manual reasoning.

## Dont-hand-roll guidance

- **Do not** replace Supabase SSR cookie/session pattern with custom cookie parsing.
- **Do not** infer tenant from query params or localStorage; hostname stays canonical.
- **Do not** broaden scope into branded login/homepage styling (Phase 7/8 concern).
- **Do not** rewrite tenant architecture or membership bootstrap schema.

## Common pitfalls

1. Using `getSession()` instead of `getUser()` in middleware/security-sensitive checks.
2. Creating a fresh `NextResponse` without preserving Supabase-updated cookies.
3. Letting callback redirect accept arbitrary `next` values or non-canonical hosts.
4. Forgetting localhost + preview host normalization when asserting redirect URLs.
5. Only testing host parsing while skipping middleware/request matrix behavior.

## Validation Architecture

Phase 06 should be considered complete only if all three layers pass:

### A. Contract tests
- `src/lib/tenant/*.test.ts` verifies root vs tenant host parsing, login URL generation, callback/final destination resolution, localhost + preview normalization.

### B. Middleware tests
- Add focused tests for unauthenticated tenant request redirect, authenticated tenant request rewrite, root host passthrough, auth route passthrough, and matcher exclusions.

### C. Build/regression verification
- `npm --prefix apps/web test -- ...` for new routing/auth tests
- `npm --prefix apps/web run build`

## Plan-shaping notes

- This is **Level 1 discovery**: no new dependency is required; only syntax/pattern verification from Next.js + Supabase SSR docs.
- Best split is likely **2 plans**:
  1. contract extraction + middleware hardening + tests
  2. auth callback / finish-signup / login handoff hardening + tests
- Keep each plan at 2 tasks max; Phase 06 is behavior stabilization, not UI expansion.

## Source references

- `apps/web/middleware.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/auth/callback/route.ts`
- `apps/web/src/app/auth/finish-signup/route.ts`
- `apps/web/src/lib/tenant/resolveTenantHost.ts`
- `apps/web/src/lib/tenant/buildWorkspaceUrl.ts`
- Context7: `/vercel/next.js` middleware matcher/rewrite docs
- Context7: `/supabase/ssr` and `/supabase/supabase` Next.js SSR auth docs
