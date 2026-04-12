# Architecture Research

**Domain:** Next.js 15 SaaS marketing homepage + login integration into existing multi-tenant app
**Researched:** 2026-04-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                                Root Domain                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  /(marketing) homepage   /login improved auth UI   /auth/* callback routes  │
│  public content only     public entry point        server auth completion    │
├──────────────────────────────────────────────────────────────────────────────┤
│                            Next.js Middleware                               │
├──────────────────────────────────────────────────────────────────────────────┤
│  resolveTenantHost() → root request? pass through                           │
│                     → tenant request? refresh Supabase session              │
│                     → no user? redirect to root /login?next={slug}          │
│                     → user? rewrite to /_tenant/[workspaceSlug]/*           │
├──────────────────────────────────────────────────────────────────────────────┤
│                             Tenant App Shell                                │
│   /_tenant/[workspaceSlug]/layout.tsx + page.tsx (private routed surface)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/app/(marketing)/page.tsx` | Public homepage at `/`; brand, CTA, feature sections | Server Component composed from presentational section components |
| `src/app/login/page.tsx` | Root-domain auth entry that preserves `next` workspace intent | Thin page shell + client auth form island |
| `middleware.ts` | Keep tenant detection, redirect, and rewrite rules authoritative | Single middleware using `resolveTenantHost()` + `updateSession()` |
| `src/app/auth/callback/route.ts` | Exchange Supabase auth code, then continue to workspace bootstrap or tenant redirect | Route Handler with server Supabase client |
| `src/app/auth/finish-signup/route.ts` | Ensure user gets/keeps workspace before tenant redirect | Route Handler calling `bootstrapWorkspaceForUser()` |
| `src/app/_tenant/[workspaceSlug]/*` | Private tenant shell after hostname-based routing | Internal route tree only reachable via middleware rewrite |

## Recommended Project Structure

```text
apps/web/src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                     # homepage route at /
│   │   ├── _components/                # NEW homepage-only sections
│   │   │   ├── home-hero.tsx
│   │   │   ├── home-features.tsx
│   │   │   ├── home-how-it-works.tsx
│   │   │   ├── home-social-proof.tsx
│   │   │   └── home-footer.tsx
│   │   └── _data/                      # optional static copy/section data
│   ├── login/
│   │   ├── page.tsx                    # MODIFIED route shell for improved login page
│   │   └── _components/                # NEW login-only client components
│   │       ├── auth-form.tsx
│   │       ├── auth-mode-switch.tsx
│   │       └── auth-benefits.tsx
│   ├── auth/
│   │   ├── callback/route.ts           # unchanged behavior, maybe copy-safe redirects only
│   │   └── finish-signup/route.ts      # unchanged behavior
│   ├── _tenant/[workspaceSlug]/        # unchanged private tenant surface
│   ├── layout.tsx                      # small metadata/global wrapper updates only
│   └── globals.css                     # preferably slimmed or split if page styles grow
├── components/                         # optional shared primitives only if reused by both pages
├── lib/
│   ├── auth/                           # existing auth messages/browser helpers
│   ├── supabase/                       # existing SSR/browser clients
│   └── tenant/                         # existing routing + workspace URL logic
└── middleware.ts                       # unchanged control plane for tenant isolation
```

### Structure Rationale

- **`app/(marketing)/_components`:** Homepage sections stay co-located with the marketing route group; they do not leak into tenant code.
- **`app/login/_components`:** Keep the auth logic reusable inside the login route without turning the whole page tree client-side.
- **`components/`:** Only promote primitives here if both homepage and login truly share them; otherwise local ownership is cleaner.
- **`middleware.ts` + `lib/tenant/*`:** Treat as protected infrastructure. Marketing work should integrate around it, not modify its core behavior.

## Architectural Patterns

### Pattern 1: Public Route Group, Private Rewrite Surface

**What:** Keep homepage and login on the root domain in public App Router routes, while tenant pages stay in the private `/_tenant` tree behind middleware rewrites.
**When to use:** Whenever public marketing pages and private tenant pages must coexist in one Next.js app.
**Trade-offs:** Clean separation and no URL pollution; requires discipline not to link public UI directly to `/_tenant/*` paths.

**Example:**
```typescript
// middleware.ts
if (!tenantHost.isTenant) {
  return NextResponse.next();
}

if (!user) {
  return NextResponse.redirect(new URL(`/login?next=${tenantHost.workspaceSlug}`, request.url));
}

rewrittenUrl.pathname = `/_tenant/${tenantHost.workspaceSlug}${request.nextUrl.pathname}`;
return NextResponse.rewrite(rewrittenUrl, response);
```

### Pattern 2: Server Shell + Client Auth Island

**What:** Render login page layout/copy on the server, but isolate Supabase browser auth interactions in a client component.
**When to use:** Forms need `window`, `URLSearchParams`, and `createSupabaseBrowserClient()` but the surrounding page is mostly static.
**Trade-offs:** Better bundle control and maintainability; requires prop boundaries between shell and form.

**Example:**
```tsx
// app/login/page.tsx
import { AuthForm } from "./_components/auth-form";

export default function LoginPage() {
  return <AuthForm />;
}
```

### Pattern 3: Intent-Preserving Auth Redirects

**What:** Preserve workspace intent via `?next=<workspaceSlug>` from tenant redirect → login → callback/finish-signup.
**When to use:** Tenant hostname decides destination, but auth begins on the root domain.
**Trade-offs:** Simple and already aligned with current app; requires strict validation that `next` stays a workspace slug, not an arbitrary URL.

**Example:**
```typescript
const redirectTo = new URL("/auth/callback", window.location.origin);
redirectTo.searchParams.set("next", nextWorkspace);

await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: redirectTo.toString() }
});
```

## Data Flow

### Request Flow

```text
[Visitor lands on /]
    ↓
[Marketing homepage sections]
    ↓ CTA to /login or tenant URL

[Visitor hits tenant subdomain]
    ↓
[middleware.ts] → [resolveTenantHost] → [updateSession]
    ↓                    ↓                    ↓
 redirect /login?next    root vs tenant       Supabase cookie refresh
    ↓
[login page auth form] → [Supabase browser auth] → [/auth/callback]
    ↓                                                 ↓
  success UI/status                          exchangeCodeForSession
                                                        ↓
                                           [/auth/finish-signup if needed]
                                                        ↓
                                           buildWorkspaceUrl(workspaceSlug)
                                                        ↓
                                             tenant subdomain request
                                                        ↓
                                          middleware rewrite to /_tenant/*
```

### State Management

```text
Homepage: static section data → server render

Login page:
URL search params (`next`)
    ↓
client auth form state (`email`, `password`, `mode`, `status`, `isSubmitting`)
    ↓
Supabase browser client actions
    ↓
server auth routes + cookie session
```

### Key Data Flows

1. **Homepage CTA flow:** Homepage buttons should send users either to `/login` or to a workspace-aware entry path; no tenant-sensitive data is required.
2. **Tenant recovery flow:** Unauthenticated tenant request becomes `/login?next=workspaceSlug`, and that slug must survive password, signup, and magic-link flows.
3. **Post-auth routing flow:** `auth/callback` and `finish-signup` remain the only places that decide final tenant destination.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Keep homepage and login in same app. Static marketing sections + current middleware are sufficient. |
| 1k-100k users | Split global CSS into route-scoped styles/components, tighten caching on marketing assets, and keep auth routes uncached/private. |
| 100k+ users | Consider separate marketing deployment only if deploy velocity or cache strategy becomes a bottleneck; do **not** split earlier. |

### Scaling Priorities

1. **First bottleneck:** Global styling and page-level component sprawl, not routing. Fix by co-locating section components and avoiding a monolithic `globals.css` blob.
2. **Second bottleneck:** Auth UX branching inside one large client page. Fix by extracting auth form/mode logic into focused client components.

## Anti-Patterns

### Anti-Pattern 1: Letting Marketing Pages Touch Tenant Routing Logic

**What people do:** Add homepage-specific conditions inside middleware or tenant utilities.
**Why it's wrong:** Public content becomes coupled to tenant isolation, increasing rewrite/redirect regression risk.
**Do this instead:** Leave middleware rules mostly unchanged; integrate homepage/login as root-domain routes that simply consume existing redirect behavior.

### Anti-Pattern 2: Making the Entire Login Experience a Large Client Page

**What people do:** Keep layout, copy, testimonials, FAQ, and auth logic in one `"use client"` page.
**Why it's wrong:** Bigger bundle, weaker separation of concerns, harder future SSR improvements.
**Do this instead:** Use a server-rendered page shell and a focused client auth form island.

### Anti-Pattern 3: Redirecting Directly to Arbitrary URLs After Login

**What people do:** Treat `next` as a free-form redirect target.
**Why it's wrong:** Open-redirect risk and broken tenant guarantees.
**Do this instead:** Keep `next` as workspace slug only, then derive full URL through `buildWorkspaceUrl()`.

## Integration Points

### New vs Modified

| Type | Path | Change | Why |
|------|------|--------|-----|
| Modified | `apps/web/src/app/(marketing)/page.tsx` | Replace placeholder hero/cards with multi-section homepage composition | Main milestone deliverable |
| New | `apps/web/src/app/(marketing)/_components/*` | Add section-level marketing components | Keeps homepage maintainable without affecting routing |
| Optional New | `apps/web/src/app/(marketing)/_data/*` | Store static section content/constants | Avoids overlong page component |
| Modified | `apps/web/src/app/login/page.tsx` | Convert into server shell or thinner orchestrator for improved login page | Preserve existing auth flow while improving presentation |
| New | `apps/web/src/app/login/_components/*` | Extract auth form, mode switch, supporting content | Separates auth logic from layout/content |
| Modified | `apps/web/src/app/layout.tsx` | Metadata/title/description updates only | Align public brand with new homepage |
| Modified | `apps/web/src/app/globals.css` or new route-local styles | Extend styling system for homepage/login | Needed for new visual design |
| Unchanged unless bug found | `apps/web/middleware.ts` | Keep tenant redirect/rewrite logic stable | Control plane must remain authoritative |
| Unchanged unless validation added | `apps/web/src/app/auth/callback/route.ts` | Keep code exchange and tenant resolution | Existing auth continuation flow already correct |
| Unchanged unless validation added | `apps/web/src/app/auth/finish-signup/route.ts` | Keep workspace bootstrap redirect | Existing post-auth bootstrap point |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | Browser client on login page, server client in callback/middleware | Existing pattern is correct; homepage should not call Supabase directly |
| Tenant DNS / root domain config | Derived through `NEXT_PUBLIC_ROOT_DOMAIN`, `resolveTenantHost()`, `buildWorkspaceUrl()` | Homepage/login must respect root-domain vs tenant-domain split |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `(marketing)` ↔ `middleware.ts` | Indirect via public root routing | Marketing pages should rely on pass-through behavior only |
| `login` ↔ `lib/supabase/browser` | Direct client API calls | Keep only the form component client-side |
| `login` ↔ `auth/callback` | Query-string redirect (`next`) | Preserve workspace intent across all auth modes |
| `auth/*` ↔ `lib/tenant/*` | Direct server utility calls | Final workspace URL generation must stay centralized |
| tenant host request ↔ `/_tenant/[workspaceSlug]` | Middleware rewrite | Never expose `/_tenant` in user-facing navigation |

## Suggested Build Order

1. **Refactor login into shell + auth island first**
   - Lowest routing risk.
   - Validates that improved UI can reuse existing Supabase flows unchanged.
2. **Build homepage sections under `(marketing)` next**
   - Pure public route work.
   - Can share visual primitives with login only after patterns are clear.
3. **Update metadata and shared styling system**
   - Do this after section/form structure is stable, otherwise global styles thrash.
4. **Add small hardening pass to auth redirects if needed**
   - Validate `next` slug shape, confirm no open redirect edge cases.
5. **Regression-check tenant entry flows last**
   - `tenant subdomain → /login?next=slug → auth → workspace` must remain intact.

## Sources

- Local codebase: `apps/web/src/app/(marketing)/page.tsx`, `apps/web/src/app/login/page.tsx`, `apps/web/middleware.ts`, `apps/web/src/app/auth/callback/route.ts`, `apps/web/src/app/auth/finish-signup/route.ts`, `apps/web/src/lib/tenant/*` — HIGH confidence
- Next.js docs via Context7 (`/vercel/next.js/v15.1.8`): route groups do not affect URL paths; `_folder` private folders are excluded from routing; middleware rewrite/redirect is a standard pattern — HIGH confidence
- Supabase SSR docs via Context7 (`/supabase/ssr`): middleware-based session refresh with `createServerClient` + `getUser()` is the recommended SSR auth pattern — HIGH confidence

---
*Architecture research for: landing page milestone integration into existing SaaS shell*
*Researched: 2026-04-06*
