---
phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
plan: 02
subsystem: auth
tags: [supabase, middleware, subdomain, auth, nextjs]
requires:
  - phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
    provides: apps/web foundation scaffold and env contract
provides:
  - hostname tabanli tenant parsing ve canonical workspace URL contract'i
  - Supabase SSR browser/server/middleware client kalibi
  - root login flow, auth callback ve tenant shell routing
affects: [database, onboarding, ai-gateway]
tech-stack:
  added: [@supabase/ssr middleware pattern]
  patterns: [hostname-derived tenant context, root-domain login surface, tenant rewrite shell]
key-files:
  created: [apps/web/src/lib/tenant/resolveTenantHost.ts, apps/web/src/lib/tenant/buildWorkspaceUrl.ts, apps/web/src/lib/tenant/tenantRouting.test.ts, apps/web/middleware.ts, apps/web/src/app/login/page.tsx, apps/web/src/app/auth/callback/route.ts, apps/web/src/app/_tenant/[workspaceSlug]/layout.tsx, apps/web/src/app/_tenant/[workspaceSlug]/page.tsx, apps/web/src/lib/supabase/browser.ts, apps/web/src/lib/supabase/server.ts, apps/web/src/lib/supabase/middleware.ts]
  modified: [apps/web/src/lib/env.ts, apps/web/src/lib/env.test.ts, apps/web/src/app/globals.css]
key-decisions:
  - "Tenant context yalnizca hostname uzerinden cozulur; client-supplied tenant id kullanilmaz."
  - "Root domain login yuzeyi olarak kalir; tenant subdomain istekleri internal tenant shell'e rewrite edilir."
  - "Auth callback workspace slug yoksa finish-signup akisini bekler."
patterns-established:
  - "Pattern 1: resolveTenantHost + buildWorkspaceUrl birlikte canonical routing sozlesmesini tasir."
  - "Pattern 2: middleware auth refresh icin getUser() cagirir; getSession'e guvenmez."
requirements-completed: [SAAS-02]
duration: 9 min
completed: 2026-04-03
---

# Phase 05 Plan 02: Auth and tenant routing Summary

**Supabase SSR auth, hostname tabanli tenant cozumleme ve root-domain login akisi ile workspace subdomain shell routing'i kuruldu.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-03T03:38:00+03:00
- **Completed:** 2026-04-03T03:47:00+03:00
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- `<workspace>.<root-domain>` contract'i icin deterministic tenant parser ve URL builder yazildi.
- Supabase SSR browser/server/middleware client kalibi eklendi ve middleware `getUser()` ile tenant request guard kurdu.
- Root login, auth callback ve internal tenant shell route'lari yeni SaaS uygulamasina eklendi.

## Task Commits

1. **Task 1: Define tenant host parsing and workspace URL contracts** - `9fc2c77` (feat)
2. **Task 2: Wire Supabase SSR auth, middleware, and the tenant app shell** - `0e35530` (feat)

**Plan metadata:** `pending`

## Files Created/Modified
- `apps/web/src/lib/tenant/resolveTenantHost.ts` - root vs tenant host parsing
- `apps/web/src/lib/tenant/buildWorkspaceUrl.ts` - canonical workspace URL builder
- `apps/web/src/lib/tenant/tenantRouting.test.ts` - routing contract tests
- `apps/web/src/lib/supabase/browser.ts` - browser client factory
- `apps/web/src/lib/supabase/server.ts` - server client factory
- `apps/web/src/lib/supabase/middleware.ts` - auth refresh helper using `getUser()`
- `apps/web/middleware.ts` - root/tenant host ayrimi ve tenant rewrite/redirect logic'i
- `apps/web/src/app/login/page.tsx` - root login page shell
- `apps/web/src/app/auth/callback/route.ts` - auth code exchange and redirect
- `apps/web/src/app/_tenant/[workspaceSlug]/layout.tsx` - tenant layout shell
- `apps/web/src/app/_tenant/[workspaceSlug]/page.tsx` - tenant page shell

## Decisions Made
- `getPublicEnv()` ve `getServerEnv()` plan 02 ihtiyacina uygun normalize field isimleri doner.
- Vercel preview hostleri tenant testinde desteklenir ama canonical redirect her zaman root domain formatina normalize edilir.
- Workspace slug bulunamazsa callback flow `auth/finish-signup` route'una devreder; provisioning logic plan 03'e birakilir.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Login route prerender sirasinda search param hook ile build'i bozdu**
- **Found during:** Task 2 verification
- **Issue:** `useSearchParams()` suspense boundary gerektirdigi icin `/login` prerender edilirken Next.js build fail oldu.
- **Fix:** Query string okuma `window.location.search` uzerinden client-side effect'e alindi.
- **Files modified:** `apps/web/src/app/login/page.tsx`
- **Verification:** `npm --prefix apps/web run build`
- **Committed in:** `0e35530`

**2. [Rule 3 - Blocking] Login render'i env contract'i prerender sirasinda erken calistirdi**
- **Found during:** Task 2 verification
- **Issue:** Browser client render asamasinda olusturulunca public env validation build sirasinda fail etti.
- **Fix:** Supabase browser client yalnizca submit aninda olusturuldu.
- **Files modified:** `apps/web/src/app/login/page.tsx`
- **Verification:** `npm --prefix apps/web run build`
- **Committed in:** `0e35530`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Duzeltmeler buildability ve SSR uyumu icin gerekliydi. Routing scope'u degismedi.

## Issues Encountered
- None

## User Setup Required

Supabase ve Vercel domain ayarlari plan dosyasinda belirtildigi gibi hala gerekli, ancak bu planda ek bir USER-SETUP dosyasi uretilmedi.

## Next Phase Readiness
- Tenant hostname contract'i artik schema ve membership bootstrap planina baglanmaya hazir.
- `auth/finish-signup` route'u plan 03'te workspace provisioning ile doldurulabilir.

## Self-Check: PASSED

---
*Phase: 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi*
*Completed: 2026-04-03*
