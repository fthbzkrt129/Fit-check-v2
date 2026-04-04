# Phase 5 Discovery

## Discovery Level

Level 3 — yeni proje kurulumu, auth, subdomain tenant resolution, Supabase Postgres/RLS ve server-side AI gateway kararları içeriyor.

## Inputs

- `.planning/phases/05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi/...-CONTEXT.md`
- `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/codebase/ARCHITECTURE.md`, `STACK.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`
- Phase 4 summary files
- Research:
  - Vercel Platforms Starter Kit
  - Next.js middleware / App Router docs
  - Supabase SSR / Auth / RLS / custom claims docs

## Locked Decisions Honored

- **D-01** Yeni proje kurulacak → mevcut SPA patchlenmeyecek, `apps/web` altında yeni app açılacak.
- **D-02 / D-03 / D-04** Supabase-first + Supabase Auth + Supabase Postgres temel alınacak.
- **D-05** Tenant hiyerarşisi `organization -> workspace` olacak.
- **D-06** Tenant resolution subdomain tabanlı olacak.
- **D-07** Root domain landing olarak kalacak; auth sonrası kullanıcı workspace subdomain’ine yönlenecek.
- **D-08** v1’de kullanıcı tek workspace üyeliğine sahip olacak.
- **D-09** Deploy hedefi Vercel olacak.
- **D-10** Faz, exposed API key riskini kapatıp backend + tenant foundation kuracak.

## Research Conclusions

1. **Next.js App Router + middleware** Vercel üzerinde landing-domain + tenant-subdomain ayrımı için en uygun seçenek.
2. **`@supabase/ssr` + `createServerClient`** middleware/cookie tabanlı auth refresh ve server-side route protection için resmi pattern.
3. **Supabase anon key frontend’de kalabilir; service role kalamaz.** Güvenlik modeli RLS + server-only secrets üzerine kurulmalı.
4. **RLS çekirdek güvenlik katmanı olmalı.** `organizations`, `workspaces`, `workspace_memberships`, `profiles` için başlangıçtan policy yazılmalı.
5. **JWT custom claims** ileride optimizasyon için uygun; ancak ilk foundation’da membership tablosu + RLS ile başlanabilir.
6. **Vercel route handlers** AI gateway için ilk sürümde daha uygun; Edge Functions görev paylaşımı deferred bırakılmalı.

## Planning Decisions Closed Here

### 1) Subdomain formatı

`<workspace>.<root-domain>` seçildi.

Neden:
- D-06 ile birebir uyumlu.
- D-08 nedeniyle ilk sürümde workspace tekilliği yeterli.
- URL karmaşıklığını düşürür; `organization` veride kalır, URL’de zorunlu olmaz.

### 2) İlk signup sonrası tenant bootstrap

İlk login / signup sonrası otomatik `organization + workspace + owner membership` bootstrap seçildi.

Neden:
- D-08 ile uyumlu en düşük sürtünmeli onboarding.
- Invite/admin-created tenant detayları context’te deferred.

### 3) AI backend sunucu katmanı

İlk sürümde **Vercel route handlers** seçildi.

Neden:
- D-09 ile uyumlu.
- Next.js app içindeki auth cookie ve workspace context ile aynı request boundary’de çalışır.
- Edge Functions dağılımı deferred bırakılabilir.

## Explicit Deferrals Preserved

Planlar şunları YAPMAYACAK:
- Tam ürün şeması, billing, invites, multi-workspace future model
- Supabase Edge Functions vs Vercel hibrit dağılımının detaylı ayrıştırması
- Exhaustive tablo/sütun/index matrisi beyond minimal tenant foundation

## Execution Shape

Phase 5 dört execute plan’a bölündü:

1. `apps/web` foundation scaffold + env/test contract
2. Supabase SSR auth + subdomain routing shell
3. Supabase schema + RLS + automatic workspace bootstrap
4. Server-only AI gateway + tenant-aware API surface

Wave yapısı:
- **Wave 1:** Plan 01
- **Wave 2:** Plan 02, Plan 03
- **Wave 3:** Plan 04
