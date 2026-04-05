# fit-check

## What This Is

fit-check, kullanicilarin fotoğraf yukleyerek kiyafetleri sanal olarak denemesini saglayan bir urun. v1.0 sonunda proje iki yuzlu hale geldi: mevcut React + Vite deneyimi korunurken `apps/web` altinda Supabase-first auth, tenant routing ve server-side AI gateway iceren yeni SaaS omurgasi kuruldu.

## Core Value

Kullanıcı gerçek kıyafetlerini fotoğraftaki modele koyup farklı kombinasyonları hızlıca görselleştirebilmeli.

## Requirements

### Validated

- ✓ Kullanıcı fotoğraf yükleyebilir ve AI stüdyo kalitesinde model görseli oluşturur — mevcut
- ✓ Kullanıcı üst giyim parçası deneyebilir — mevcut
- ✓ Kullanıcı alt giyim parçası deneyebilir — mevcut
- ✓ Kullanıcı ayakkabı deneyebilir — mevcut
- ✓ Kullanıcı aksesuar deneyebilir — mevcut
- ✓ Kullanıcı poz değiştirebilir (4 poz) — mevcut
- ✓ Kullanıcı sahne ve ışık varyasyonu oluşturabilir — mevcut
- ✓ Kullanıcı dolabına parça sabitleyebilir — mevcut
- ✓ Kullanıcı model üretiminden sonra `Deneysel kombin giydir` girişini görebilir — Phase 04
- ✓ Kullanıcı deneysel akışta parçaları stage edip tek fal.ai isteğiyle kombin üretebilir — Phase 04
- ✓ fal.ai bundle prompt/service contract deterministic ve retry-safe çalışır — Phase 04
- ✓ Deneysel akış loading, retry ve duplicate-submit guard içerir — Phase 04
- ✓ Deneysel prompt/service/UI davranışı testlerle doğrulandı — Phase 04
- ✓ Session persistence ile outfit history, wardrobe ve scene state yenilemede korunur — Phase 02
- ✓ En-boy oranı koruma akışı virtual try-on render'larinda uygulanır — Phase 01
- ✓ Undo/redo temel arayüzü ve gezinme akışı eklendi — Phase 03
- ✓ Supabase auth, tenant bootstrap, secure AI gateway ve local DB verification tamamlandı — Phase 05

### Active

- [ ] Yeni milestone kapsamını tanımla (`/gsd-new-milestone`)
- [ ] Legacy Vite deneyimi ile yeni `apps/web` SaaS omurgasi arasindaki urun stratejisini netlestir
- [ ] Production auth teslimati icin custom SMTP veya password-first onboarding stratejisini sec

### Out of Scope

- Çoklu kullanıcı paylaşımı — Tek kullanıcı odaklı, sosyal özellikler ileride
- Mobil native uygulama — Web-first yaklaşım, PWA ileride değerlendirilir

## Context

- Legacy app: React 19 + Vite 6 + TypeScript 5.8
- New app: Next.js 15 + Supabase SSR + Postgres tenant foundation
- Ortam degiskenleri artik iki yuzde ayrisiyor: legacy tarafta Gemini/fal akislar, `apps/web` tarafinda Supabase + server-side AI keys
- Local Supabase gelistirme portlari Windows rezerv araliklarini asmak icin `55431-55436` bandina tasindi

## Constraints

- **Teknoloji**: React 19 + Vite 6 + TypeScript 5.8 — mevcut stack korunur
- **API**: Google Gemini AI — tüm görsel işleme bu API üzerinden
- **Ortam**: İstemci tarafı SPA — sunucu yok, static hosting yeterli
- **Tarayıcı**: ES2022 destekleyen modern tarayıcılar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Oturum için sessionStorage/localStorage | Sunucu yok, auth yok — yerel depolama tek seçenek | ✓ Session persistence uygulandi |
| Undo/redo için zustand veya useState | Mevcut yapı useState ile — ekleme mi, refactor mü? | ✓ useState tabanli ilk surum uygulandi |
| En-boy oranı için canvas resize mi, padding mi? | Kalite kaybı vs boyut tutarlılığı | ✓ Virtual try-on akisi icin koruma uygulandi |
| Deneysel kombin provider'ı | Kullanıcı bütçe tasarrufu için fal.ai istedi | ✓ fal.ai bundled styling eklendi |
| AI key izolasyonu ve tenant auth | Browser key exposure riski vardi | ✓ Supabase-first SaaS omurgasi ile server-side gateway'e tasindi |

## Evolution

Bu belge aşama geçişleri ve milat sınırlarında güncellenir.

## Current State

v1.0 shipped. Legacy styling deneyimi calisiyor; buna ek olarak `apps/web` altinda login/signup, tenant bootstrap, secure AI routes ve local db verification'dan gecmis yeni SaaS foundation hazir.

## Current Milestone: v1.1 landing page

**Goal:** SaaS urununu guven olusturarak anlatan, cok bolumlu bir homepage ve onunla uyumlu giris sayfasi olusturmak.

**Target features:**
- Moda odakli, editorial tarza yakin premium homepage
- Hero + ozellikler + nasil calisir + sosyal kanit/ornek kullanim + footer
- Homepage ile uyumlu, daha iyi sunulmus giris sayfasi
- Footerlar ve baslik hiyerarsisinin netlestirilmesi

## Next Milestone Goals

- Legacy urunu ve yeni SaaS omurgasini ayni urun stratejisinde birlestirmek
- Auth teslimatinda production-ready email/sifre stratejisini netlestirmek
- Sonraki milestone icin fresh requirements tanimlamak

**Her aşama geçişinden sonra** (via `/gsd-transition`):
1. Gereksinimler geçersizleşti mi? → Out of Scope'a taşı (sebebiyle)
2. Gereksinimler doğrulandı mı? → Validated'a taşı (aşama referansıyla)
3. Yeni gereksinim çıktı mı? → Active'e ekle
4. Kaydedilecek karar var mı? → Key Decisions'a ekle
5. "What This Is" hâlâ doğru mu? → Sapma varsa güncelle

**Her milat sonunda** (via `/gsd-complete-milestone`):
1. Tüm bölümlerin tam gözden geçirilmesi
2. Core Value kontrolü — hâlâ doğru öncelik mi?
3. Out of Scope denetimi — sebepler hâlâ geçerli mi?
4. Context'i mevcut duruma göre güncelle

---
*Last updated: 2026-04-05 after starting v1.1 milestone*
