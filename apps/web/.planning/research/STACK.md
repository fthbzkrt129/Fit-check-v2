# Stack Research

**Domain:** Next.js içinde fashion-oriented editorial SaaS homepage + improved login page
**Researched:** 2026-04-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js App Router | 15.2.x (mevcut: 15.2.4) | Marketing route group, metadata, image/font optimization | Bu milestone icin yeni framework degil, mevcut `apps/web` omurgasini kullanmak dogru. Landing + login tamamen App Router ile cozulur. |
| React | 19.0.x (mevcut) | Server/Client component ayrimi | Homepage’i buyuk oranda Server Component, auth formunu kucuk Client island olarak tutmak JS maliyetini dusurur. |
| `@supabase/ssr` + `@supabase/supabase-js` | 0.5.2 + 2.49.4 (mevcut) | Login/signup/magic link akisi | Auth stack zaten dogru kurulmus. Bu milestone’da degistirmeyin; sadece sunumu ve bilgi mimarisini iyilestirin. |
| CSS Modules + mevcut `globals.css` token katmani | Next.js built-in | Editorial layout, section-scoped styling, login shell | 2 sayfa icin en az maliyetli ve en kontrollu secim. Global utility sistemi eklemeden premium gorunum verilebilir. |
| `next/font` + `next/image` | Next.js built-in | Typography ve image performance | Moda/editorial hissi icin font ve gorsel kalitesi kritik. Ek font loader veya image library gerektirmez. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion` | 12.38.0 | Subtle reveal, hover, section entrance, premium auth transitions | Sadece micro-interaction gerekiyorsa ekleyin. `LazyMotion` ve `useReducedMotion` ile kullanin. |
| `clsx` | 2.1.1 | Variant class composition | Login mode switch, CTA varyantlari ve marketing section modifier class’lari okunaksiz hale gelirse ekleyin. |
| `zod` | 3.24.2 (mevcut) | Basit login/signup input normalization | Yeni form kutuphanesi eklemek yerine, gerekirse email/redirect param validation icin mevcut paketi kullanin. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript 5.8 | Type-safe page/component props | Yeni UI modeli icin yeterli; upgrade gerekmez. |
| Vitest 3 | Login state ve marketing helper testleri | Sadece kritik UI logic/testable helper’lar icin kullanin; tasarim milestone’u icin test stack buyutmeyin. |

## Installation

```bash
# Core
# Yeni core package gerekmez

# Supporting (yalnizca gerekirse)
npm install --workspace apps/web motion clsx

# Dev dependencies
# Yeni dev dependency onerilmiyor
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| CSS Modules + design tokens | Tailwind CSS v4 | Eger sonraki milestone’larda hizli cok-sayfali marketing sistemi veya buyuk component matrix kurulacaksa mantikli olur. Bu milestone icin fazla buyuk degisim. |
| `motion` | GSAP | Ancak cok agir scroll choreography veya timeline tabanli sinematik animasyon gerekiyorsa. Landing + login icin gereksiz agir. |
| Custom lightweight primitives | shadcn/ui / MUI / Chakra | Uygulama genelinde genis CRUD/dashboard UI standardizasyonu hedeflenirse dusunulebilir; editorial homepage diline zayif uyuyor. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind + shadcn/ui’yi birlikte eklemek | Iki sayfa icin gereksiz tasarim sistemi maliyeti yaratir; mevcut CSS’i cope atma baskisi dogurur | Route-scoped CSS Modules + az sayida custom primitive |
| GSAP / locomotive-scroll / Lenis stack | Scroll showpiece ihtiyaci yok; bundle ve maintenance maliyeti yuksek | CSS transitions veya gerekirse `motion` |
| React Hook Form / Formik | Login formu cok basit; yeni form abstraction’i milestone’u yavaslatir | Mevcut controlled inputs + gerekirse `zod` |
| Yeni auth provider (Clerk/Auth0 vb.) | Supabase SSR auth zaten mevcut ve tenant akisiyla uyumlu | Mevcut Supabase auth stack |

## Stack Patterns by Variant

**If homepage mostly static/editorial olacaksa:**
- `src/app/(marketing)` altinda Server Component section’lari kullan
- Stil icin `page.module.css` + `globals.css` token’lari kullan
- Cunku en dusuk JS ile premium gorunum verir

**If belirgin motion gerekiyorsa:**
- Motion’u sadece client island’larda kullan
- Hero, feature reveal ve CTA hover ile sinirli tut
- Cunku landing sayfasi performansini korurken premium hissi guclendirir

**If login page iyilestirilecekse:**
- Auth shell’i presentational component olarak ayir, formu client component birak
- `createSupabaseBrowserClient()` akisini koru
- Cunku Supabase browser auth mevcut entegrasyonla uyumlu kalir

## Integration Points

- `apps/web/src/app/(marketing)/page.tsx`: yeni homepage burada kalmali; tenant/workspace routelarindan ayri tutulmali
- `apps/web/src/app/login/page.tsx`: auth form mantigi korunmali, yalnizca layout/typography/status presentation iyilestirilmeli
- `apps/web/src/app/layout.tsx`: `next/font` ile brand typography ve metadata burada tanimlanmali
- `apps/web/src/app/globals.css`: renk, spacing, radius, shadow gibi token’lar burada; sayfa-ozel stiller module dosyalarina tasinmali
- `apps/web/src/components/marketing/*`: hero, feature grid, proof strip, footer gibi reusable ama milestone-scope primitive’ler burada toplanmali

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.2.x` | `react@19.x` | Mevcut uygulama zaten bu kombinasyonda. Bu milestone icin upgrade zorunlu degil. |
| `@supabase/ssr@0.5.2` | `@supabase/supabase-js@2.49.4` | Mevcut cookie/SSR auth modelini koruyun; login UI degisirken auth altyapisi degismemeli. |
| `motion@12.38.0` | `react@^18 || ^19` | NPM peer deps React 19’u destekliyor; yine de yalnizca client bileşenlerde kullanin. |

## Sources

- Context7 `/vercel/next.js/v15.1.11` — App Router styling, CSS Modules, `next/font`, `next/image`, metadata patterns
- Context7 `/supabase/ssr` — Next.js App Router icin browser/server client ve cookie-based auth pattern’i
- Context7 `/websites/motion_dev` — `motion` kurulumu, Next.js App Router kullanimi, `LazyMotion`, `useReducedMotion`
- NPM registry check (2026-04-06) — `next`, `@supabase/ssr`, `@supabase/supabase-js`, `motion`, `clsx` guncel surumleri

---
*Stack research for: fit-check v1.1 landing page milestone*
*Researched: 2026-04-06*
