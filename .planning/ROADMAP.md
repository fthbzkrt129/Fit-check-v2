# Roadmap: fit-check

## Milestones

- ✅ **v1.0 Temel Iyilestirmeler** - Phases 1-5 (shipped 2026-04-05)
- 🚧 **v1.1 Landing Page** - Phases 6-9 (planned)

## Overview

v1.1 milestone'i, mevcut tenant/auth omurgasini bozmadan root domain uzerinde premium bir marketing homepage ve onunla uyumlu bir login girisi sunar. Fazlar once routing ve auth handoff guvencesini saglar, sonra branded login deneyimini kurar, ardindan homepage anlatisini tamamlar ve son olarak trust/pricing/footer katmanini bitirir.

## Phases

- [ ] **Phase 6: Entry Contract Hardening** - Root marketing girisi ile tenant/auth handoff davranisini sabitler.
- [ ] **Phase 7: Branded Login Experience** - Homepage ile uyumlu, daha net ve guven veren auth girisini sunar.
- [ ] **Phase 8: Editorial Homepage Core** - Premium homepage'in ana anlati, hero ve CTA akislarini tamamlar.
- [ ] **Phase 9: Trust, Pricing & Footer Finish** - Guven, fiyatlandirma ve footer gezinmesini karar vermeyi kolaylastiracak hale getirir.

## Phase Details

### Phase 6: Entry Contract Hardening
**Goal**: Ziyaretci root domain marketing yuzeyini ve auth gecisini mevcut tenant routing davranisini bozmadan kullanabilir.
**Depends on**: Phase 5
**Requirements**: FLOW-02, FLOW-03
**Success Criteria** (what must be TRUE):
  1. Ziyaretci root domain marketing yuzeyine geldiginde tenant rewrite veya redirect carpismasi yasamaz.
  2. Kullanici auth sonrasinda mevcut `next` / workspace handoff davranisiyla dogru yere devam eder.
  3. Public auth callback ve tenant routing birlikte calisir; kullanici auth akisi sirasinda loop veya kayip yonlendirme gormez.
**Plans**: TBD

### Phase 7: Branded Login Experience
**Goal**: Kullanici homepage ile gorsel olarak uyumlu, net ve yonlendirici bir login/kayit girisi gorur.
**Depends on**: Phase 6
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. Kullanici markali ve homepage ile uyumlu bir login sayfasi gorur.
  2. Kullanici hangi auth secenegini neden kullanacagini kafa karisikligi olmadan anlayabilir.
  3. Kullanici login ve kayit modlarinda net baslik, aciklama ve CTA metinleri gorur.
  4. Kullanici yardim veya recovery alanlarindan dogru auth aksiyonuna yonlenebilir.
**Plans**: TBD
**UI hint**: yes

### Phase 8: Editorial Homepage Core
**Goal**: Ziyaretci urunun degerini hizla anlayip tutarli CTA'lar ile auth girisine ilerleyebildigi premium bir homepage deneyimi gorur.
**Depends on**: Phase 7
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, FLOW-01, CONT-01, CONT-03
**Success Criteria** (what must be TRUE):
  1. Ziyaretci premium gorsel dile sahip hero bolumunde urunun ne sundugunu ve ana CTA'yi hemen anlayabilir.
  2. Ziyaretci temel ozellikleri ve urunun nasil calistigini section bazli akista takip edebilir.
  3. Ziyaretci homepage uzerindeki CTA'lar ile tutarli sekilde login/kayit sayfasina yonlenebilir.
  4. Ziyaretci homepage ve login yuzeylerini yan yana deneyimlediginde ayni marka tonu ve baslik hiyerarsisini hisseder.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Trust, Pricing & Footer Finish
**Goal**: Ziyaretci karar vermeyi kolaylastiran guven, fiyatlandirma ve tamamlayici gezinme katmanlarini homepage icinde gorebilir.
**Depends on**: Phase 8
**Requirements**: HOME-05, HOME-06, HOME-07, CONT-02
**Success Criteria** (what must be TRUE):
  1. Ziyaretci sosyal kanit veya ornek kullanim icerigiyle urune dair guven olusturucu sinyaller gorur.
  2. Ziyaretci homepage icindeki pricing bolumunden teklif mantigini ve karar icin gerekli ana bilgileri anlayabilir.
  3. Ziyaretci footer icinde temel gezinme ve tamamlayici baglantilari kolayca bulabilir.
  4. Ziyaretci pricing ve trust bolumlerini homepage anlatisindan kopuk hissetmeden ayni karar akisi icinde deneyimler.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 6. Entry Contract Hardening | v1.1 | 0/TBD | Not started | - |
| 7. Branded Login Experience | v1.1 | 0/TBD | Not started | - |
| 8. Editorial Homepage Core | v1.1 | 0/TBD | Not started | - |
| 9. Trust, Pricing & Footer Finish | v1.1 | 0/TBD | Not started | - |
