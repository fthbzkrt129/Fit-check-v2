# Yol Haritası: fit-check

**Milat:** v1.0 — Temel İyileştirmeler
**Gereksinimler:** 15
**Aşamalar:** 5

---

## Phase 1: En-Boy Oranı Koruma

**Hedef:** Görsel en-boy oranı koruma ve kilitleme

**Gereksinimler:** RATIO-01, RATIO-02, RATIO-03

**Başarı Kriterleri:**
1. Kare formatlı parça (ör. ayakkabı 800×800) eklenince base görselin orijinal en-boy oranı (1200×1800) korunur
2. Parça görseli base görselin boyutlarına orantılı olarak ölçeklenir (stretch/squash olmadan)
3. Sonuç görseli her zaman base görselin orijinal boyutlarında döner

**Plans:** 1 plan

**Plans:**
- [x] 01-en-boy-oran-koruma-PLAN.md — Implement aspect ratio preservation for virtual try-on

---

## Phase 2: Oturum Kalıcılığı

**Hedef:** Otomatik kaydetme, geri yükleme ve oturum yönetimi

**Gereksinimler:** SESS-01, SESS-02, SESS-03, SESS-04

**Başarı Kriterleri:**
1. Sayfa yenilenince kombin geçmişi (outfitHistory, currentOutfitIndex) otomatik geri yüklenir
2. Kullanıcının yüklediği dolap verisi kaybolmaz
3. Poz indeksi ve sahne varyasyonları korunur
4. "Baştan Başla" tüm kayıtlı oturum verisini temizler

**Plans:** 1 plan

**Plans:**
- [x] 02-oturum-kalıcılığı-01-PLAN.md — Implement session persistence with localStorage ✅

---

## Phase 3: Undo/Redo

**Hedef:** Değişiklik geçmişi ile geri al/yinele

**Gereksinimler:** UNDO-01, UNDO-02, UNDO-03

**Başarı Kriterleri:**
1. Kullanıcı son eklenen kombin parçasını tek tıkla geri alabilir
2. Geri alınan parçayı yineleyebilir
3. Geri al/yinele butonları bağlam bazlı duruma göre görünür/gizli olur (geri alınacak bir şey yoksa buton pasif)

**Plans:** 1 plan

**Plans:**
- [ ] 03-undo-redo-01-PLAN.md — Add Undo/Redo buttons with index-based navigation

---

## Phase 4: Deneysel Kombin Giydirme

**Hedef:** fal.ai ile tek istekte toplu kombin üretimi için alternatif deneysel akış

**Gereksinimler:** EXP-01, EXP-02, EXP-03, EXP-04, EXP-05

**Başarı Kriterleri:**
1. Görsel upload + model üretimi tamamlandıktan sonra kullanıcı `Deneysel kombin giydir` butonunu görür ve standart `Proceed to Styling` akışı bozulmaz
2. Kullanıcı aktif kombin parçalarını + model görselini tek final istekte fal.ai'ye gönderebilir
3. Deneysel akış mevcut Gemini step-by-step deneyimini bozmaz
4. fal.ai entegrasyonu gerekli env setup ile planlanmış olur

**Plans:** 2 plans

**Plans:**
- [x] 04-deneysel-kombin-giydir-fal-ai-01-PLAN.md — Add fal.ai service foundation, prompt builder, and env contract ✅
- [x] 04-deneysel-kombin-giydir-fal-ai-02-PLAN.md — Add experimental entry CTA and final batch generation flow ✅

---

## Phase 5: Backend guvenligi, API key izolasyonu, multi-tenant SaaS mimarisi ve PostgreSQL stratejisi

**Goal:** Exposed AI key riskini kapatan, Supabase-first auth + tenant izolasyonu + server-side AI gateway temelli yeni SaaS omurgasi
**Requirements**: SAAS-01, SAAS-02, SAAS-03, SAAS-04, SAAS-05
**Depends on:** Phase 4
**Plans:** 4 plans

Plans:
- [x] 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi-01-PLAN.md — Scaffold the new `apps/web` SaaS app foundation and env contract
- [ ] 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi-02-PLAN.md — Add Supabase SSR auth and subdomain tenant routing shell
- [ ] 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi-03-PLAN.md — Create tenant schema, RLS, and first-login workspace bootstrap
- [ ] 05-backend-guvenligi-api-key-izolasyonu-multi-tenant-saas-mimarisi-ve-postgresql-stratejisi-04-PLAN.md — Move AI providers behind tenant-aware server routes

---

## Kapsama

| Requirement | Phase | Status |
|-------------|-------|--------|
| RATIO-01 | Phase 1 | Tamamlandı |
| RATIO-02 | Phase 1 | Tamamlandı |
| RATIO-03 | Phase 1 | Tamamlandı |
| SESS-01 | Phase 2 | Tamamlandı |
| SESS-02 | Phase 2 | Tamamlandı |
| SESS-03 | Phase 2 | Tamamlandı |
| SESS-04 | Phase 2 | Tamamlandı |
| UNDO-01 | Phase 3 | Beklemede |
| UNDO-02 | Phase 3 | Beklemede |
| UNDO-03 | Phase 3 | Beklemede |
| EXP-01 | Phase 4 | Tamamlandı |
| EXP-02 | Phase 4 | Tamamlandı |
| EXP-03 | Phase 4 | Tamamlandı |
| EXP-04 | Phase 4 | Tamamlandı |
| EXP-05 | Phase 4 | Tamamlandı |
**Coverage:** 15/15 gereksinim haritalandırıldı ✓

*Yol haritası güncellendi: 2026-04-02*
