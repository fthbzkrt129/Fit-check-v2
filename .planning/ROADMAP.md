# Yol Haritası: fit-check

**Milat:** v1.0 — Temel İyileştirmeler
**Gereksinimler:** 10
**Aşamalar:** 3

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
- [ ] 02-oturum-kalıcılığı-01-PLAN.md — Implement session persistence with localStorage

---

## Phase 3: Undo/Redo

**Hedef:** Değişiklik geçmişi ile geri al/yinele

**Gereksinimler:** UNDO-01, UNDO-02, UNDO-03

**Başarı Kriterleri:**
1. Kullanıcı son eklenen kombin parçasını tek tıkla geri alabilir
2. Geri alınan parçayı yineleyebilir
3. Geri al/yinele butonları bağlam bazlı duruma göre görünür/gizli olur (geri alınacak bir şey yoksa buton pasif)

---

## Kapsama

| Requirement | Phase | Status |
|-------------|-------|--------|
| RATIO-01 | Phase 1 | Tamamlandı |
| RATIO-02 | Phase 1 | Tamamlandı |
| RATIO-03 | Phase 1 | Tamamlandı |
| SESS-01 | Phase 2 | Beklemede |
| SESS-02 | Phase 2 | Beklemede |
| SESS-03 | Phase 2 | Beklemede |
| SESS-04 | Phase 2 | Beklemede |
| UNDO-01 | Phase 3 | Beklemede |
| UNDO-02 | Phase 3 | Beklemede |
| UNDO-03 | Phase 3 | Beklemede |

**Coverage:** 10/10 gereksinim haritalandırıldı ✓

---
*Yol haritası oluşturuldu: 2026-03-30*
