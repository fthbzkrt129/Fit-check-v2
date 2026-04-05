# Project Research Summary

**Project:** fit-check v1.1 landing page milestone
**Domain:** Next.js multi-tenant AI fashion SaaS with public marketing homepage and conversion-focused login
**Researched:** 2026-04-06
**Confidence:** HIGH

## Executive Summary

This project is not a net-new product build; it is a public-entry redesign for an existing multi-tenant AI fashion SaaS. The research is consistent: experts would keep the current Next.js 15 + React 19 + Supabase SSR foundation, add a premium editorial marketing surface on the root domain, and improve login UX without disturbing tenant routing, middleware authority, or the existing auth callback chain.

The recommended approach is opinionated: treat routing and auth invariants as phase-zero constraints, then build a server-rendered editorial homepage and a branded login shell around a small client auth island. Launch with proof-driven messaging, a single clear CTA path, a minimal auth strategy, and honest trust signals. Do not add a new UI framework, replace Supabase auth, or overbuild interactivity before the conversion path is stable.

The main risks are architectural, not visual: tenant intent can be lost during auth handoff, middleware can overmatch and create loops, and public pages can accidentally inherit app-shell weight. Mitigation is equally clear: freeze core tenant/auth infrastructure, validate `next` as workspace-only intent, keep public routes isolated in `(marketing)` and `login`, and add regression coverage for host-based routing before polish work expands.

## Key Findings

### Recommended Stack

The stack research strongly supports staying inside the current app architecture. Next.js App Router, React 19, Supabase SSR, CSS Modules, and built-in `next/font`/`next/image` already match the milestone. The right move is to refine composition, styling, and auth presentation rather than introduce Tailwind, a component kit, or a new auth platform.

**Core technologies:**
- **Next.js App Router 15.2.x**: public marketing routes, metadata, image/font optimization — fits the existing app and keeps homepage/login in one deployment.
- **React 19**: server/client split — enables a mostly server-rendered homepage with a small client auth island.
- **`@supabase/ssr` + `@supabase/supabase-js`**: auth, callback, session continuity — already the correct auth foundation and should not be replaced.
- **CSS Modules + `globals.css` tokens**: page-scoped editorial styling — lowest-risk path to premium visuals.
- **`next/font` + `next/image`**: typography and media performance — important for fashion/editorial quality without extra libraries.
- **Optional `motion`**: restrained micro-interactions only — use sparingly and only in client islands.

**Critical version requirements:**
- Keep `next@15.2.x` with `react@19.x`.
- Keep `@supabase/ssr@0.5.2` aligned with `@supabase/supabase-js@2.49.4`.
- If used, keep `motion@12.38.0` client-only.

### Expected Features

Feature research is clear that launch success depends more on clarity and proof than on breadth. The homepage should sell fashion outcomes with real output evidence, while login should feel branded, minimal, and consistent with the CTA promise. The biggest feature mistake would be trying to look like a generic “all-in-one AI platform” or exposing too many auth choices before product policy is settled.

**Must have (table stakes):**
- Editorial hero with one primary CTA and explicit routing.
- Visual proof of output quality using curated demo assets.
- 3-step “how it works” section.
- Outcome-first feature/value blocks.
- Honest social proof or example usage section.
- Branded login page with minimal auth flow.
- Recovery/help states for the chosen auth method.

**Should have (competitive):**
- Editorial art direction that feels fashion-native.
- Login-side value context that continues homepage momentum.
- Smart post-auth continuity (`continue to studio` / workspace-aware continuation).
- Lightweight example gallery.
- Interactive showcase and audience segmentation only after core conversion path proves out.

**Defer (v2+):**
- Personalized homepage variants by persona/source.
- Full case-study library or ROI calculator.
- Enterprise SSO or public enterprise-auth messaging.

### Architecture Approach

Architecture research strongly favors a clean boundary: root-domain public routes for homepage/login/auth, host-aware middleware for tenant detection and rewrites, and a private `/_tenant/[workspaceSlug]` surface behind that control plane. The homepage belongs in `app/(marketing)`, the login page should become a server shell plus client auth form island, and callback/finish-signup routes remain the only places that decide final tenant destination.

**Major components:**
1. **`src/app/(marketing)/page.tsx` + local section components** — public homepage composition and brand storytelling.
2. **`src/app/login/page.tsx` + client auth components** — branded auth entry while preserving existing Supabase browser flows.
3. **`middleware.ts`** — authoritative host-based routing, session refresh, redirect, and rewrite logic.
4. **`src/app/auth/callback/route.ts` + `finish-signup/route.ts`** — session completion and safe workspace continuation.
5. **`src/app/_tenant/[workspaceSlug]/*`** — isolated private tenant shell reachable only through middleware rewrite.

### Critical Pitfalls

The pitfall research is unusually actionable: most launch failures will come from routing, redirect, session, and shell-boundary mistakes rather than from UI implementation quality.

1. **Public route / tenant rewrite collisions** — keep a strict root-vs-tenant route matrix and test host-based ownership first.
2. **Redirect loops from over-broad middleware** — narrow matcher scope and explicitly protect public auth/asset/metadata paths.
3. **Losing tenant intent during auth handoff** — preserve and validate `next` as a workspace slug across every auth mode.
4. **Session desync from SSR auth changes** — treat middleware cookie/session handling as sensitive infrastructure and regression-test it.
5. **Mixing marketing shell with app shell** — isolate public layouts and keep marketing mostly server-rendered.

## Implications for Roadmap

Based on the research, suggested phase structure:

### Phase 1: Routing & Auth Contract Hardening
**Rationale:** Every other deliverable depends on stable host-based routing, safe redirects, and session continuity.
**Delivers:** Documented route ownership, middleware scope review, `next` validation, and regression coverage for root/tenant/auth flows.
**Addresses:** Primary CTA routing, post-auth continuity, recovery path reliability.
**Avoids:** Route collisions, redirect loops, lost workspace intent, session desync.

### Phase 2: Auth Strategy & Branded Login Surface
**Rationale:** Login UX cannot be finalized until one primary auth path is chosen and expressed clearly.
**Delivers:** Server-shell login page, client auth island, branded split layout/value context, clear mode hierarchy, recovery/error states.
**Uses:** Existing Supabase SSR/browser clients, React server/client split, CSS Modules.
**Implements:** `app/login/page.tsx` shell + `app/login/_components/*` extraction.

### Phase 3: Editorial Homepage Foundation
**Rationale:** Once auth entry is stable, the homepage can confidently drive a single action into that flow.
**Delivers:** Hero, proof section, 3-step workflow, feature/value blocks, social proof, repeated CTA, shared visual language.
**Addresses:** Core launch features from FEATURES.md P1 set.
**Avoids:** Generic AI positioning, feature dump bloat, fake trust signals, app-shell leakage.

### Phase 4: Launch Polish, Metadata & Conversion Enhancements
**Rationale:** SEO/share quality and optional premium touches should follow structural stability, not precede it.
**Delivers:** Metadata API pass, OG/canonical checks, media optimization, subtle motion, optional lightweight example gallery or constrained showcase.
**Uses:** `next/font`, `next/image`, optional `motion`, route-scoped styles.
**Implements:** `layout.tsx` metadata updates, public asset QA, performance pass.

### Phase Ordering Rationale

- Phase 1 comes first because middleware, callback, and tenant intent are the hard dependencies behind both CTA and login success.
- Phase 2 precedes the homepage because the homepage’s primary CTA and copy must reflect the real auth strategy, not an unresolved policy.
- Phase 3 groups all public marketing sections under `(marketing)` because the architecture already supports a clean public/private split.
- Phase 4 is intentionally last because SEO, OG, motion, and richer proof are polish multipliers, not safe foundations.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** needs focused validation of middleware matcher coverage, preview-host behavior, and redirect edge cases.
- **Phase 2:** needs a product decision on primary auth mode (password-first vs magic link emphasis) before UX is locked.
- **Phase 4:** only if the team wants an interactive showcase beyond static proof; that path has higher implementation and asset complexity.

Phases with standard patterns (skip research-phase):
- **Phase 3:** well-documented Next.js App Router marketing-page composition with CSS Modules and server components.
- **Most of Phase 4 SEO basics:** standard Metadata API, OG, canonical, and public asset QA patterns are already well established.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Backed by official Next.js, Supabase SSR, Motion docs, plus alignment with the current codebase. |
| Features | MEDIUM | Strong competitor and official-auth references, but final auth strategy and asset quality still require product decisions. |
| Architecture | HIGH | Grounded in direct codebase inspection plus official Next.js and Supabase SSR patterns. |
| Pitfalls | HIGH | Derived from current middleware/auth structure and official framework guidance; risks are concrete and testable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Primary auth strategy is not fully settled:** choose one dominant login path before finalizing CTA copy, mode hierarchy, and recovery UX.
- **Curated demo assets are a dependency, not a detail:** homepage quality and trust will underperform without real, fast-loading fashion outputs.
- **Preview/localhost/subdomain behavior needs explicit validation:** route logic may differ across environments even if local happy paths work.
- **Scope of interactive showcase is unresolved:** keep launch on static/lightweight proof unless there is clear evidence a richer demo is worth the complexity.
- **Public SEO/canonical policy across root vs tenant hosts needs confirmation:** especially to avoid indexing tenant domains incorrectly.

## Sources

### Primary (HIGH confidence)
- Local research files: `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`.
- Local codebase inspection cited by `ARCHITECTURE.md` and `PITFALLS.md` (`apps/web/middleware.ts`, auth routes, tenant utilities, marketing/login routes).
- Context7 `/vercel/next.js/v15.1.8` and `/vercel/next.js/v15.1.11` — App Router, route groups, middleware, styling, metadata, media handling.
- Context7 `/supabase/ssr` — SSR auth, middleware session refresh, cookie propagation, callback patterns.
- Official Supabase Auth docs — passwords, passwordless email, auth overview.

### Secondary (MEDIUM confidence)
- Official product sites: FASHN AI, Lalaland/Browzwear, Vue.ai, Runway — positioning, proof, trust, and homepage pattern benchmarks.
- Context7 `/websites/motion_dev` — bounded motion guidance for premium UI polish.
- NPM registry checks for package/version compatibility.

### Tertiary (LOW confidence)
- None material; remaining uncertainty is product-policy and asset-readiness related, not source-quality related.

---
*Research completed: 2026-04-06*
*Ready for roadmap: yes*
