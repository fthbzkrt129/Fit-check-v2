# Feature Research

**Domain:** SaaS marketing homepage + conversion-oriented login UX for an AI fashion product
**Researched:** 2026-04-06
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = homepage feels generic or auth feels untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear hero with one primary CTA | AI SaaS homepages now lead with a sharp promise + immediate action (`Get started`, `Try free`, `Request demo`) | LOW | `apps/web` CTA routing must be explicit: unauthenticated users go to login/signup, authenticated users go to app. |
| Visual proof of output quality | Fashion/AI buyers expect to see product-to-model or before/after proof immediately, not just copy | MEDIUM | Best version uses existing virtual try-on outputs; depends on having curated demo assets. |
| “How it works” in 3 steps | Users need quick mental model before trusting an AI workflow | LOW | Can map to current product reality: upload garment → choose model/scene → generate result. |
| Feature/value blocks tied to outcomes | Competitors sell speed, realism, consistency, brand control, cost reduction—not raw model jargon | LOW | Copy should stay outcome-first; no deep technical claims unless provable. |
| Social proof section | Logos, testimonials, case snippets, or usage examples are expected on AI SaaS homepages | MEDIUM | If customer logos are limited, use curated example outputs + quoted outcomes instead of fake enterprise theater. |
| Repeated CTA near mid-page and footer | Conversion-oriented pages do not rely on a single hero CTA | LOW | Secondary CTA can be `See demo` or `Explore examples`; avoid too many competing actions. |
| Clean, branded login surface | Modern SaaS users expect auth to feel like part of the product, not a bolted-on form | MEDIUM | Reuse homepage typography, imagery, and tone; depends on final auth layout in `apps/web`. |
| Minimal auth form + obvious mode switch | Users expect sign in vs sign up to be obvious, with low friction and clear labels | LOW | Keep one default path per page. Avoid mixed “login/signup/reset” chaos above the fold. |
| At least one low-friction sign-in method | Official auth platforms now commonly support email/password, email OTP/magic link, and OAuth | MEDIUM | Depends on product decision: custom SMTP/password-first vs passwordless/social. Do not promise methods before strategy is finalized. |
| Error/help/recovery states | Forgot password, resend link/code, and inline validation are basic trust features | MEDIUM | Depends on chosen auth method. Must be implemented before launch to avoid dead-end auth flows. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Editorial hero art direction | Makes the product feel premium/fashion-native instead of generic “AI tool” SaaS | MEDIUM | Strongest differentiator for this milestone. Depends on curated imagery and strong typography/layout decisions. |
| Interactive try-on showcase | Lets visitors preview real workflow states such as pose/background/model changes instead of static screenshots | HIGH | High leverage because core product already exists. Depends on reusing safe, fast-loading demo assets or a lightweight interactive mock. |
| Use-case segmentation on homepage | Speaking separately to brands, creators, and e-commerce teams improves message relevance | MEDIUM | Add only if copy can stay concise; otherwise it becomes homepage bloat. |
| “Why trust these outputs?” proof layer | Showing realism, consistency, controllability, and secure workflow turns AI skepticism into product confidence | MEDIUM | Can combine quality callouts, output comparisons, and mention of secure server-side AI/auth foundation. |
| Login-side value context | A split-screen login with one tight value message or sample result helps maintain momentum from homepage to auth | LOW | Good fit for this milestone; do not turn login into a second full landing page. |
| Smart post-auth continuity | Preserve intended destination (`continue to studio`) after auth so CTA-to-product feels seamless | MEDIUM | Depends on routing and redirect state handling in `apps/web`. |
| Lightweight example gallery | A small set of premium, on-brand results can outperform long feature lists | LOW | Best when examples are categorized (editorial, PDP, pose, scene). |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Generic “all-in-one AI platform” messaging | Sounds broad and ambitious | Destroys positioning; fashion-specific value gets blurred into commodity AI copy | Lead with fashion outcomes, realism, styling, and visual quality |
| Too many hero CTAs | Teams want to serve every audience at once | Splits attention and lowers conversion clarity | One primary CTA + one secondary supporting CTA max |
| Heavy autoplay video hero | Feels premium/editorial | Hurts performance, distracts from CTA, and can look like a demo reel instead of a product page | Use fast stills, short loops, or click-to-play demo moments |
| Fake enterprise social proof | Looks credible on the surface | Easy to detect, weakens trust, especially for an AI product | Use real outputs, real testimonials, or honest “built for” use cases |
| Auth method sprawl on day one | More options seem more convenient | Password + magic link + OTP + multiple socials + SSO creates UX and support complexity | Pick one primary auth strategy and one backup recovery path |
| Asking users to complete onboarding before login succeeds | Teams want to qualify users early | Creates drop-off on the highest-friction step in the funnel | Let users authenticate first, then collect optional profile/setup data |
| Long homepage feature dump | Teams want to expose everything already built | Buries the core promise and makes the product feel complicated | Curate around 3-5 strongest capabilities tied to outcomes |
| Placeholder pricing section without real pricing strategy | Feels like a standard SaaS block | Creates confusion and false expectations if pricing is not ready | CTA to get access / request demo / join waitlist until pricing is real |

## Feature Dependencies

```text
[Primary homepage CTA]
    └──requires──> [Auth routing decision]
                        └──requires──> [Chosen sign-in strategy]

[Visual proof / showcase]
    └──requires──> [Curated demo assets]
                        └──enhances──> [Hero]
                        └──enhances──> [Social proof]

[Login-side value context]
    └──requires──> [Shared brand system with homepage]

[Forgot password / resend / recovery]
    └──requires──> [Production-ready auth delivery path]

[Use-case segmentation]
    └──conflicts──> [Ultra-short homepage]

[Too many auth methods]
    └──conflicts──> [Minimal conversion-focused login]
```

### Dependency Notes

- **Primary homepage CTA requires auth routing decision:** hero copy is easy; the real dependency is where users land and what happens after click.
- **Auth routing decision requires chosen sign-in strategy:** login UX cannot be finalized before password-first vs magic-link/OTP vs social is decided.
- **Visual proof requires curated demo assets:** strongest fashion pages show results, not abstractions.
- **Curated demo assets enhance both hero and social proof:** the same assets can power hero, gallery, and testimonials.
- **Login-side value context requires shared brand system:** homepage and auth should feel like one product journey.
- **Recovery states require production-ready auth delivery path:** reset/resend flows are only trustworthy if email delivery is reliable.
- **Use-case segmentation conflicts with ultra-short homepage:** segment blocks help relevance but can easily create scroll bloat.
- **Too many auth methods conflict with minimal login:** every added auth option increases decision overhead and support surface.

## MVP Definition

### Launch With (v1)

- [ ] Clear editorial hero + single primary CTA — essential for positioning the new SaaS surface
- [ ] Visual proof section (static or lightweight interactive) — essential because this product is judged by output quality
- [ ] 3-step “how it works” section — essential to reduce AI skepticism quickly
- [ ] Focused feature/value blocks — essential to connect existing capabilities to buyer outcomes
- [ ] Honest social proof / example usage section — essential for trust
- [ ] Branded login page with minimal auth flow — essential for conversion continuity
- [ ] Recovery/help states for chosen auth method — essential to avoid dead-end login UX

### Add After Validation (v1.x)

- [ ] Interactive showcase with richer controls — add once static proof converts but deeper exploration is still needed
- [ ] Audience segmentation blocks — add if traffic splits across distinct personas and homepage clarity can be preserved
- [ ] More advanced login options (social/passkey/etc.) — add only after primary auth path is proven and support burden is understood

### Future Consideration (v2+)

- [ ] Personalized homepage variants by persona or traffic source — defer until there is enough acquisition volume to justify it
- [ ] Full case-study library / ROI calculator — valuable later, but not required for this milestone
- [ ] Enterprise SSO or multi-workspace auth messaging on public entry surfaces — defer until enterprise motion is active

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Editorial hero + CTA | HIGH | MEDIUM | P1 |
| Visual proof/examples | HIGH | MEDIUM | P1 |
| 3-step how it works | HIGH | LOW | P1 |
| Social proof / testimonials | HIGH | MEDIUM | P1 |
| Branded minimal login | HIGH | MEDIUM | P1 |
| Recovery/help states | HIGH | MEDIUM | P1 |
| Interactive showcase | HIGH | HIGH | P2 |
| Audience segmentation | MEDIUM | MEDIUM | P2 |
| Expanded auth options | MEDIUM | MEDIUM | P2 |
| Personalized homepage variants | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Hero positioning | **FASHN** leads with a direct product outcome and free CTA | **Lalaland/Browzwear** leads with business value and demo/contact motion | Lead with premium fashion outcome first, not generic AI language, and support with immediate proof |
| Visual proof | **FASHN** shows product-to-model transformations and interactive demo concepts | **Runway** uses bold product/research cards and immersive media storytelling | Use editorial stills + real try-on outputs; prefer product proof over abstract “AI future” branding |
| Trust signals | **FASHN** uses testimonials and customer stories | **Vue.ai** uses enterprise logos, partner claims, ROI/time-to-value framing | Use only trust signals that are real for this stage: outputs, testimonials, examples, maybe a few credible logos |
| Auth entry motion | **FASHN** drives a free start motion | **Lalaland/Browzwear** drives demo/contact for enterprise sales | Keep self-serve login/signup prominent, but preserve room for future demo/contact path if enterprise motion grows |

## Recommendation

For this milestone, the homepage should behave like a **premium editorial product story that converts into one clear app action**. The biggest mistake would be making it look like a generic AI SaaS shell. The product already has strong visual capabilities, so the page should sell with output proof, not feature inflation.

For login UX, optimize for **continuity and low friction**, not novelty. A branded, minimal surface with one primary sign-in path, one fallback/recovery path, and clear post-auth continuation is the right default. Do not overbuild auth options until the production auth strategy is finalized.

## Sources

- HIGH — Official product homepage: FASHN AI — https://fashn.ai/
- HIGH — Official product homepage: Lalaland / Browzwear AI Models — https://www.lalaland.ai/
- HIGH — Official product homepage: Vue.ai — https://vue.ai/
- HIGH — Official product homepage: Runway — https://www.runwayml.com/
- HIGH — Official Supabase Auth docs overview — https://supabase.com/docs/guides/auth
- HIGH — Official Supabase email/password docs — https://supabase.com/docs/guides/auth/passwords
- HIGH — Official Supabase passwordless email docs — https://supabase.com/docs/guides/auth/auth-email-passwordless
- HIGH — Official Clerk sign-in customization example — https://clerk.com/docs/guides/customizing-clerk/elements/examples/sign-in
- HIGH — Official Clerk passkeys docs — https://clerk.com/docs/guides/development/custom-flows/authentication/passkeys

---
*Feature research for: landing page + login UX milestone*
*Researched: 2026-04-06*
