# Phase 5: Supabase-First Multi-Tenant SaaS Foundation - Context

**Phase:** 05-supabase-multi-tenant-foundation
**Requirements:** TBD (Phase 5 planning will derive implementation requirements)
**Date:** 2026-04-03

## Phase Summary

Bu faz mevcut `fit-check` SPA'ini küçük bir güvenlik iyileştirmesi olarak değil, yeni bir proje kurularak tam SaaS dönüşümü olarak ele alır. Ana hedef sadece exposed API key riskini kapatmak değil; backend, auth, tenant izolasyonu, veritabanı tasarımı ve RLS temeli olan yeni bir ürün omurgası kurmaktır.

## Locked Decisions

- **D-01:** Kapsam `tam donusum` olacak; mevcut repo içinde incremental patch yerine yeni proje kurulacak.
- **D-02:** Mimari `Supabase-first` olacak.
- **D-03:** Authentication sağlayıcısı `Supabase Auth` olacak.
- **D-04:** Veritabanı `Supabase Postgres` olacak.
- **D-05:** Tenant modeli `hybrid hierarchy`: `organization -> workspace` olacak.
- **D-06:** Tenant resolution `subdomain-based` olacak.
- **D-07:** Ortak bir landing page olacak; auth sonrası kullanıcı kendi tenant alanına yönlenecek.
- **D-08:** İlk sürümde bir kullanıcı yalnızca tek bir workspace üyeliğine sahip olacak.
- **D-09:** Deploy hedefi `Vercel` olacak.
- **D-10:** Faz hedefi: exposed API key riskini ortadan kaldırmak, backend kurmak, multi-tenant SaaS temeli kurmak, db tasarımı ve RLS düşünmek.

## Product Direction

- Mevcut ürünün çekirdek değeri korunur: kullanıcı görsel upload edip AI destekli styling / try-on deneyimi yaşar.
- Ancak uygulama artık browser-only SPA olarak kalmaz; istemci, backend ve veri katmanları ayrılır.
- AI servis anahtarları istemci bundle'ında bulunmaz; çağrılar güvenilen sunucu katmanı üzerinden yürütülür.

## Architecture Context

**Current state:**
- Mevcut uygulama saf client-side React + Vite SPA.
- `GEMINI_API_KEY` ve `FAL_KEY` istemci bundle'ına expose ediliyor.
- Backend, auth, tenant, database ve RLS henüz yok.

**Target state:**
- Vercel üzerinde deploy edilen yeni bir web uygulaması.
- Supabase Auth ile kullanıcı kimlik doğrulama.
- Supabase Postgres üzerinde organization/workspace hiyerarşisi.
- Subdomain çözümlemesi ile tenant-aware routing.
- Yetkili backend katmanında AI provider entegrasyonları.
- RLS ve membership tabanlı erişim modeli.

## Tenant Model Interpretation

`organization -> workspace` hiyerarşisi şu şekilde yorumlanır:

- `organization`: En üst sahiplik ve faturalama / yönetim sınırı.
- `workspace`: Kullanıcının günlük çalışma alanı ve uygulama içi aktif tenant bağlamı.
- İlk sürümde kullanıcı tek workspace'e üyedir; bu, membership ve RLS modelini basitleştirir.
- Buna rağmen şema gelecekte çoklu workspace üyeliğine genişleyebilecek şekilde kurulmalıdır.

## Routing Interpretation

- Tek bir ortak landing page anonim kullanıcılar için erişilebilir kalır.
- Auth sonrası kullanıcı kendi tenant alanına yönlendirilir.
- Tenant bağlamı subdomain üzerinden çözülür.
- Uygulama, landing domain ile tenant domain davranışlarını net biçimde ayırmalıdır.

## Security Goals

- AI provider API key'leri browser'a çıkmamalı.
- İstemci ile veri erişimi tenant-aware ve policy-backed olmalı.
- Organization/workspace üyeliği dışında veri görünürlüğü olmamalı.
- Auth, session, invite ve onboarding akışları future-proof olacak şekilde düşünülmeli.

## Database And RLS Direction

- Şema Supabase Postgres üstünde kurulacak.
- Tenant ilişkileri organization/workspace/membership ekseninde modellenmeli.
- RLS, uygulama güvenliğinin ana parçası olarak ele alınmalı; sonradan eklenecek opsiyonel katman gibi düşünülmemeli.
- İlk sürüm basit tutulsa da auditability ve tenant isolation sonraki fazlarda yeniden yazım gerektirmeyecek şekilde planlanmalı.

## Deferred From This Discussion

- Kesin tablo listesi, sütun seviyesinde şema ve indeksler
- Supabase Edge Functions / Vercel server functions görev dağılımı
- Invite flow, billing ve çoklu-workspace desteğinin detayları

## Open Decisions For Planning

1. Subdomain formatı tam olarak nasıl olacak: `<workspace>.<domain>` mi, yoksa `organization` bilgisini de URL yapısına taşıyan farklı bir desen mi?
2. İlk signup sonrası tenant bootstrap nasıl olacak: kullanıcıya otomatik organization+workspace mi açılacak, yoksa invite / admin-created tenant akışı mı olacak?
3. AI backend çağrıları için birincil sunucu katmanı hangisi olacak: Supabase Edge Functions mı, Vercel server-side endpoints mi, yoksa hibrit model mi?

## Planning Readiness

Bu context, `/gsd-plan-phase 5` için yeterli seviyede ürün ve mimari yön sağlar. Açık kalan maddeler implementation-level kararlardır; plan-phase içinde ilk planlara bölünerek netleştirilebilir.

---

*Context created: 2026-04-03*
