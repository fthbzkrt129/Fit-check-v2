# Pitfalls Research

**Domain:** Existing Next.js + Supabase SaaS app adding a marketing homepage and improved login UX with tenant routing
**Researched:** 2026-04-06
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Public route and tenant rewrite collisions

**What goes wrong:**
Homepage, login, callback, or future marketing routes accidentally pass through tenant rewrite logic, or tenant traffic accidentally falls through to the root marketing experience. Result: wrong page on the wrong host, broken auth handoff, or impossible-to-debug 404/redirect behavior.

**Why it happens:**
In this codebase, middleware decides root-vs-tenant behavior from the host header, then rewrites tenant traffic to `/_tenant/[workspaceSlug]`. When teams add a polished homepage/login, they often focus on visuals and forget that route ownership is now host-aware, not path-only.

**How to avoid:**
- Treat routing as the first deliverable, not a cleanup task.
- Keep an explicit route matrix: `root domain -> marketing/login/auth`, `tenant subdomain -> app shell`.
- Add tests for root host, tenant host, localhost subdomains, reserved subdomains, and preview URLs.
- Keep marketing pages in a distinct route group/layout, but do **not** change host-based ownership rules casually.

**Warning signs:**
- `/login` works on root but not after tenant redirect.
- Tenant subdomain sometimes shows marketing UI.
- Preview deployments behave differently from localhost/prod.
- Reserved subdomains (`www`, `app`, `admin`) start acting like tenants.

**Phase to address:**
Phase 1 — routing and guardrail hardening before UI polish.

---

### Pitfall 2: Redirect loops from over-broad middleware

**What goes wrong:**
Marketing pages, login, auth callback, images, or metadata routes get caught by middleware and redirect/rewrite repeatedly. Users see loops, broken images, missing OG cards, or login that never completes.

**Why it happens:**
Next.js middleware is easy to overmatch. Official docs explicitly recommend excluding static assets and metadata files, and Supabase SSR docs warn that auth middleware must be carefully scoped. In the current repo, the matcher only excludes `_next/static`, `_next/image`, and `favicon.ico`; a richer marketing site usually adds more public assets and metadata endpoints.

**How to avoid:**
- Expand matcher rules before shipping the homepage: exclude metadata files, public media, and prefetch-only requests where appropriate.
- Keep a small allowlist for public auth routes (`/login`, `/auth/callback`, `/auth/finish-signup`, `/`).
- Add end-to-end checks for callback completion, OG image access, robots/sitemap, and marketing asset delivery.

**Warning signs:**
- Callback route returns to `/login` unexpectedly.
- `robots.txt`, `sitemap.xml`, OG images, or hero assets fail in prod.
- Network log shows repeated 307/308 responses.
- Login works only with hard refresh.

**Phase to address:**
Phase 1 — middleware scope review and route contract tests.

---

### Pitfall 3: Losing tenant intent during login and signup handoff

**What goes wrong:**
User starts from `workspace.rootdomain.com`, gets sent to root-domain login, authenticates successfully, then lands in the wrong workspace or a generic post-auth page.

**Why it happens:**
This app currently depends on a `next` workspace slug moving through `/login -> /auth/callback -> /auth/finish-signup`. Marketing/login redesigns often rewrite links and forms but forget to preserve this tenant intent across all auth modes.

**How to avoid:**
- Define `nextWorkspace` preservation as a non-negotiable auth contract.
- Verify every path: password login, signup, magic link, callback, finish-signup, and error recovery.
- Sanitize `next` as a workspace slug or relative path only; never trust arbitrary absolute URLs.
- Show the destination workspace in the UI when the user came from a tenant subdomain.

**Warning signs:**
- Login succeeds but user lands on root homepage.
- Magic link returns to a generic screen while password login works.
- Support reports: “I logged in but not into my workspace.”
- Query param handling differs between root domain and preview domains.

**Phase to address:**
Phase 1 — auth flow invariants and redirect contract.

---

### Pitfall 4: Session desync from incorrect Supabase SSR handling

**What goes wrong:**
Users appear logged in on one request and logged out on the next, especially around login completion, tenant redirects, or middleware rewrites.

**Why it happens:**
Supabase’s SSR guidance is explicit: middleware must refresh auth state correctly, cookies must be copied onto the returned response, and server protection should not trust raw cookie session state. Teams often refactor middleware while styling login and accidentally break cookie propagation.

**How to avoid:**
- Treat middleware auth code as sensitive infrastructure; UI work should not casually refactor it.
- Keep `updateSession()` behavior covered with regression tests.
- If middleware response objects change, verify cookies are preserved on the final response.
- Use server-side auth checks consistently (`getClaims()`/validated checks for protection, `getUser()` when you truly need server validation semantics).

**Warning signs:**
- “Random logout” reports after successful login.
- Tenant redirect works once, then bounces back to `/login`.
- Session appears valid client-side but not server-side.
- Bug only reproduces in middleware paths, not in local component state.

**Phase to address:**
Phase 1 — auth infrastructure freeze plus regression coverage.

---

### Pitfall 5: Mixing marketing shell and app shell into one heavy layout

**What goes wrong:**
The homepage becomes visually impressive but drags app-only chrome, fonts, client JS, or tenant assumptions into public pages and login. Result: slower first paint, hydration issues, or auth pages that feel like dashboard pages wearing a costume.

**Why it happens:**
Brownfield Next.js teams often reuse the existing root layout for speed. But a SaaS marketing homepage and login page have very different needs than a tenant workspace shell. Next.js route groups/layouts exist precisely to isolate these concerns.

**How to avoid:**
- Split marketing/auth from tenant app UI with route groups and nested layouts.
- Prefer Server Components for marketing sections; keep client JS off the homepage unless interaction genuinely requires it.
- Audit global CSS, fonts, and providers so the public site does not inherit app-only weight.
- Avoid multiple root layouts unless full page reloads between sections are acceptable.

**Warning signs:**
- Login page loads dashboard styles/providers it does not use.
- Lighthouse drops sharply after homepage launch.
- Hydration warnings appear only on marketing routes.
- Visual polish requires increasing amounts of global CSS overrides.

**Phase to address:**
Phase 2 — layout separation and public-shell implementation.

---

### Pitfall 6: Shipping a pretty homepage without production SEO/share basics

**What goes wrong:**
The homepage looks premium in-browser but shares poorly, ranks poorly, or serves generic metadata like “fit-check SaaS”. Social cards, title hierarchy, canonical assumptions, and localization signals stay placeholder-level.

**Why it happens:**
Teams coming from app-first development often treat marketing pages like internal product screens. Next.js expects metadata to be defined with the Metadata API, and public landing pages need a stronger content contract than dashboard routes.

**How to avoid:**
- Define metadata, OG, title hierarchy, and image strategy as part of the milestone scope.
- Use the Metadata API instead of ad-hoc `<head>` tags.
- Create route-specific copy for homepage vs login.
- Verify root-domain metadata separately from tenant-domain behavior.

**Warning signs:**
- Shared link preview shows generic title/description.
- Homepage and login use the same metadata.
- Footer/header hierarchy is visually polished but semantically weak.
- Search engines index tenant hosts instead of the canonical marketing domain.

**Phase to address:**
Phase 3 — marketing SEO, metadata, and semantic QA.

---

### Pitfall 7: Improving login visuals without choosing a real auth strategy

**What goes wrong:**
Login looks polished, but the underlying product decision is still unresolved: password-first, magic link, or confirmation-heavy signup. Users get mixed signals, support burden rises, and onboarding metrics become noisy.

**Why it happens:**
`PROJECT.md` already flags production auth delivery as an open decision. The current login page exposes password login, signup, and magic link together. If the milestone focuses on presentation before policy, the UX becomes prettier but less trustworthy.

**How to avoid:**
- Pick the primary auth mode before final UI copy and CTA structure.
- Demote secondary auth methods instead of giving all three equal prominence.
- Write explicit states for unconfirmed email, wrong password, expired magic link, and existing-account signup.
- Align homepage CTA text with the actual auth path users will hit.

**Warning signs:**
- Users ask whether they should sign up, log in, or wait for email.
- Different auth modes land in different post-auth states.
- Error messages are technically correct but product-wise confusing.
- Designers keep revising copy because the auth policy is still unsettled.

**Phase to address:**
Phase 2 — auth product decision and UX copy system.

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reuse the tenant/app shell for marketing and login | Faster milestone delivery | Public pages inherit app complexity, CSS drift, perf regressions | Only for throwaway internal previews, not release |
| Keep adding exceptions inside middleware instead of documenting route ownership | Quick fixes for edge cases | Middleware becomes the real router and grows fragile | Only as a temporary patch with follow-up cleanup ticket |
| Offer password, signup, and magic link equally by default | Avoids choosing auth policy now | Confusing onboarding, inconsistent support, weak trust signals | Only during short validation windows with analytics |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Next.js middleware | Matching every request, including static assets and metadata | Scope matcher deliberately and verify public assets, callback routes, and prefetch behavior |
| Supabase SSR auth | Returning a fresh `NextResponse` without preserving cookie mutations | Preserve the auth-updated response/cookies end-to-end |
| Tenant routing + auth redirects | Passing raw `next` destinations through login/callback | Restrict `next` to safe relative/slug values and test every auth mode |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Image-heavy editorial homepage in the same global shell as app routes | Slow TTFB/FCP, login feels sluggish | Separate public layout, optimize media, keep homepage mostly server-rendered | Usually visible immediately on mobile; painful by normal launch traffic |
| Middleware running on unnecessary public requests | Increased latency on simple page loads | Narrow matcher and skip assets/metadata/prefetch requests | Breaks UX at low traffic; cost grows with every request |
| Global fonts/providers added for marketing polish | Dashboard bundle and login route both get heavier | Load brand assets only where needed | Noticeable as soon as multiple public sections launch |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting server-side session from unvalidated cookies alone | Unauthorized access or false auth state | Use validated server-side auth checks per Supabase guidance |
| Allowing arbitrary redirect targets in `next` | Open redirect or tenant confusion | Accept only known-safe workspace slugs / relative destinations |
| Letting tenant hosts inherit marketing-domain assumptions | Cross-tenant leaks in canonical URLs, redirects, or copy | Make host awareness explicit in metadata, redirects, and page guards |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Homepage CTA promises one path but login presents three equal auth modes | Trust drops at the first conversion step | Make homepage CTA and login flow tell the same story |
| Login page forgets which workspace the user came from | Users think auth failed | Show destination context and preserve tenant intent throughout |
| Premium editorial homepage overwhelms the actual product promise | Visitors admire the page but do not understand the workflow | Keep hero and “how it works” anchored to the AI try-on value proposition |

## "Looks Done But Isn't" Checklist

- [ ] **Homepage:** Metadata, OG image, canonical behavior, and semantic headings verified on the root domain.
- [ ] **Login UX:** Password, signup, magic link, expired-link, and unconfirmed-email states all tested.
- [ ] **Tenant handoff:** Root login returns users to the correct workspace slug for every auth mode.
- [ ] **Middleware:** Static assets, callback routes, robots/sitemap, and preview hosts do not redirect unexpectedly.
- [ ] **Layout separation:** Marketing/login routes do not load tenant-only shell concerns unless intentionally shared.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Public route and tenant rewrite collisions | MEDIUM | Freeze UI changes, document route ownership, add host-based test matrix, then simplify middleware rules |
| Session desync from SSR auth changes | HIGH | Revert middleware/auth refactor, compare cookie behavior against known-good flow, add regression coverage before restyling again |
| Losing tenant intent during login | MEDIUM | Trace `next` from entry to callback to final redirect, normalize allowed values, then test all auth modes |
| Mixed marketing/app shell | MEDIUM | Introduce route-group layouts, move public-only styles/providers out of the root path, then re-measure performance |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Public route and tenant rewrite collisions | Phase 1 — Routing & middleware hardening | Root host, tenant host, preview host, and reserved subdomain tests pass |
| Redirect loops from over-broad middleware | Phase 1 — Routing & middleware hardening | Callback, robots, sitemap, OG/media, and login routes load without loops |
| Losing tenant intent during login and signup handoff | Phase 1 — Auth redirect contract | All auth modes return to the expected workspace |
| Session desync from incorrect Supabase SSR handling | Phase 1 — Auth infrastructure regression pass | No random logout/bounce-to-login after redirect flows |
| Mixing marketing shell and app shell into one heavy layout | Phase 2 — Public shell implementation | Marketing/login routes avoid tenant-only providers and bundle weight |
| Improving login visuals without choosing a real auth strategy | Phase 2 — Auth UX/product decision | CTA hierarchy, copy, and error states align with the chosen auth model |
| Shipping a pretty homepage without production SEO/share basics | Phase 3 — Marketing QA & launch readiness | Metadata, OG, title hierarchy, and canonical checks pass on root domain |

## Sources

- `PROJECT.md` milestone context and open auth decision — HIGH confidence
- Current app middleware and auth flow files:
  - `apps/web/middleware.ts` — HIGH confidence
  - `apps/web/src/lib/supabase/middleware.ts` — HIGH confidence
  - `apps/web/src/app/login/page.tsx` — HIGH confidence
  - `apps/web/src/app/auth/callback/route.ts` — HIGH confidence
  - `apps/web/src/app/auth/finish-signup/route.ts` — HIGH confidence
- Next.js docs via Context7:
  - Middleware matcher examples and exclusions — HIGH confidence
  - Route groups/layout docs — HIGH confidence
  - Multiple root layout full-page-load caveat — HIGH confidence
  - Metadata API guidance — HIGH confidence
- Supabase docs via Context7:
  - Next.js SSR auth / proxy setup — HIGH confidence
  - Cookie preservation warnings in middleware — HIGH confidence
  - `getClaims()` / `getUser()` server-side auth guidance — HIGH confidence
  - PKCE callback / safe `next` redirect examples — HIGH confidence

---
*Pitfalls research for: landing page + polished login milestone on fit-check SaaS*
*Researched: 2026-04-06*
