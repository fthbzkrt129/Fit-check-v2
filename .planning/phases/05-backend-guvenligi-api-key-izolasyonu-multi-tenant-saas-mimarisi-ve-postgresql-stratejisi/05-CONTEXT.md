# Phase 5: Backend guvenligi, API key izolasyonu, multi-tenant SaaS mimarisi ve PostgreSQL stratejisi - Context

**Phase:** 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi
**Requirements:** TBD (Phase 5 planning will derive implementation requirements)
**Date:** 2026-04-03

## Phase Summary

Bu faz mevcut `fit-check` SPA'ini kucuk bir guvenlik iyilestirmesi olarak degil, yeni bir proje kurularak tam SaaS donusumu olarak ele alir. Ana hedef sadece exposed API key riskini kapatmak degil; backend, auth, tenant izolasyonu, veritabani tasarimi ve RLS temeli olan yeni bir urun omurgasi kurmaktir.

## Locked Decisions

- **D-01:** Kapsam `tam donusum` olacak; mevcut repo icinde incremental patch yerine yeni proje kurulacak.
- **D-02:** Mimari `Supabase-first` olacak.
- **D-03:** Authentication saglayicisi `Supabase Auth` olacak.
- **D-04:** Veritabani `Supabase Postgres` olacak.
- **D-05:** Tenant modeli `hybrid hierarchy`: `organization -> workspace` olacak.
- **D-06:** Tenant resolution `subdomain-based` olacak.
- **D-07:** Ortak bir landing page olacak; auth sonrasi kullanici kendi tenant alanina yonlendirilecek.
- **D-08:** Ilk surumde bir kullanici yalnizca tek bir workspace uyeligine sahip olacak.
- **D-09:** Deploy hedefi `Vercel` olacak.
- **D-10:** Faz hedefi: exposed API key riskini ortadan kaldirmak, backend kurmak, multi-tenant SaaS temeli kurmak, db tasarimi ve RLS dusunmek.

## Product Direction

- Mevcut urunun cekirdek degeri korunur: kullanici gorsel upload edip AI destekli styling / try-on deneyimi yasar.
- Ancak uygulama artik browser-only SPA olarak kalmaz; istemci, backend ve veri katmanlari ayrilir.
- AI servis anahtarlari istemci bundle'inda bulunmaz; cagrilar guvenilen sunucu katmani uzerinden yurutulur.

## Architecture Context

**Current state:**
- Mevcut uygulama saf client-side React + Vite SPA.
- `GEMINI_API_KEY` ve `FAL_KEY` istemci bundle'ina expose ediliyor.
- Backend, auth, tenant, database ve RLS henuz yok.

**Target state:**
- Vercel uzerinde deploy edilen yeni bir web uygulamasi.
- Supabase Auth ile kullanici kimlik dogrulama.
- Supabase Postgres uzerinde organization/workspace hiyerarsisi.
- Subdomain cozumlemesi ile tenant-aware routing.
- Yetkili backend katmaninda AI provider entegrasyonlari.
- RLS ve membership tabanli erisim modeli.

## Tenant Model Interpretation

`organization -> workspace` hiyerarsisi su sekilde yorumlanir:

- `organization`: En ust sahiplik ve faturalama / yonetim siniri.
- `workspace`: Kullanicinin gunluk calisma alani ve uygulama ici aktif tenant baglami.
- Ilk surumde kullanici tek workspace'e uyedir; bu, membership ve RLS modelini basitlestirir.
- Buna ragmen sema gelecekte coklu workspace uyeligine genisleyebilecek sekilde kurulmalidir.

## Routing Interpretation

- Tek bir ortak landing page anonim kullanicilar icin erisilebilir kalir.
- Auth sonrasi kullanici kendi tenant alanina yonlendirilir.
- Tenant baglami subdomain uzerinden cozulur.
- Uygulama, landing domain ile tenant domain davranislarini net bicimde ayirmalidir.

## Security Goals

- AI provider API key'leri browser'a cikmamali.
- Istemci ile veri erisimi tenant-aware ve policy-backed olmali.
- Organization/workspace uyeligi disinda veri gorunurlugu olmamali.
- Auth, session, invite ve onboarding akislari future-proof olacak sekilde dusunulmeli.

## Database And RLS Direction

- Sema Supabase Postgres ustunde kurulacak.
- Tenant iliskileri organization/workspace/membership ekseninde modellenmeli.
- RLS, uygulama guvenliginin ana parcasi olarak ele alinmali; sonradan eklenecek opsiyonel katman gibi dusunulmemeli.
- Ilk surum basit tutulsa da auditability ve tenant isolation sonraki fazlarda yeniden yazim gerektirmeyecek sekilde planlanmali.

## Deferred From This Discussion

- Kesin tablo listesi, sutun seviyesinde sema ve indeksler
- Supabase Edge Functions / Vercel server functions gorev dagilimi
- Invite flow, billing ve coklu-workspace desteginin detaylari

## Open Decisions For Planning

1. Subdomain formati tam olarak nasil olacak: `<workspace>.<domain>` mi, yoksa `organization` bilgisini de URL yapisina tasiyan farkli bir desen mi?
2. Ilk signup sonrasi tenant bootstrap nasil olacak: kullaniciya otomatik organization+workspace mi acilacak, yoksa invite / admin-created tenant akisi mi olacak?
3. AI backend cagrilari icin birincil sunucu katmani hangisi olacak: Supabase Edge Functions mi, Vercel server-side endpoints mi, yoksa hibrit model mi?

## Planning Readiness

Bu context, `/gsd-plan-phase 5` icin yeterli seviyede urun ve mimari yon saglar. Acik kalan maddeler implementation-level kararlardir; plan-phase icinde ilk planlara bolunerek netlestirilebilir.

---

*Context created: 2026-04-03*
