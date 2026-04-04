# Requirements: fit-check

**Defined:** 2026-03-30
**Core Value:** Kullanıcı gerçek kıyafetlerini fotoğraftaki modele koyup farklı kombinasyonları hızlıca görselleştirebilmeli

## v1 Requirements

Milat v1.0 — Temel İyileştirmeler.

### Undo/Redo

- [ ] **UNDO-01**: Kullanıcı son eklenen kombin parçasını tek tıkla geri alabilir (undo)
- [ ] **UNDO-02**: Kullanıcı geri alınan parçayı yineleyebilir (redo)
- [ ] **UNDO-03**: Geri al/yinele butonları bağlam bazlı duruma göre görünür/gizli olur (geri alınacak bir şey yoksa buton pasif)

### Oturum Kalıcılığı

- [ ] **SESS-01**: Sayfa yenilenince kombin geçmişi (outfitHistory, currentOutfitIndex) kaybolmaz
- [ ] **SESS-02**: Sayfa yenilenince dolap verisi (kullanıcının yüklediği parçalar) kaybolmaz
- [ ] **SESS-03**: Sayfa yenilenince mevcut poz indeksi ve sahne varyasyonları korunur
- [ ] **SESS-04**: "Baştan Başla" seçeneği tüm kayıtlı oturum verisini temizler

### En-Boy Oranı Koruma

- [ ] **RATIO-01**: Kare formatlı parça (ör. ayakkabı 800×800) eklenince base görselin orijinal en-boy oranı korunur
- [ ] **RATIO-02**: Parça görseli, base görselin boyutlarına orantılı olarak ölçeklenir (stretch/squash olmadan)
- [ ] **RATIO-03**: Sonuç görseli her zaman base görselin orijinal boyutlarında döner

## Future Requirements

Bu milat kapsamı dışında, sonraki milatlara bırakılan gereksinimler.

### Deneysel Kombin Giydirme

- [x] **EXP-01**: Kullanıcı model oluşturduktan sonra `Deneysel kombin giydir` CTA'sını görebilir ve bu alternatif akışı seçebilir
- [x] **EXP-02**: Kullanıcı aktif kombin parçalarını ve model görselini tek fal.ai isteğinde toplu olarak üretebilir
- [x] **EXP-03**: Deneysel akış eklenirken mevcut Gemini step-by-step styling akışı bozulmaz
- [x] **EXP-04**: fal.ai entegrasyonu için gerekli yapılandırma (`FAL_KEY`, servis kontratı, prompt builder) tanımlanır
- [x] **EXP-05**: Deneysel akışın prompt/service/UI davranışı otomatik testlerle doğrulanır

- **UNDO-04**: Kullanıcı kombin geçmişinde belirli bir adıma geri dönebilir (multi-step undo)
- **RATIO-04**: Kullanıcı base görsel boyutlarını değiştirebilir (crop/resize)

## Out of Scope

| Özellik | Sebep |
|---------|-------|
| Kullanıcı hesap sistemi | Yerel depolama yeterli, auth karmaşıklığına gerek yok |
| Çoklu kullanıcı paylaşımı | Tek kullanıcı odaklı, sosyal özellikler ileride |
| Mobil native uygulama | Web-first, PWA ileride değerlendirilir |
| Sunucu tarafı oturum yönetimi | Sunucu yok, istemci tarafı depolama yeterli |

## Traceability

Yol haritası oluşturulurken doldurulacak.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RATIO-01 | Phase 1 | Beklemede |
| RATIO-02 | Phase 1 | Beklemede |
| RATIO-03 | Phase 1 | Beklemede |
| SESS-01 | Phase 2 | Beklemede |
| SESS-02 | Phase 2 | Beklemede |
| SESS-03 | Phase 2 | Beklemede |
| SESS-04 | Phase 2 | Beklemede |
| UNDO-01 | Phase 3 | Beklemede |
| UNDO-02 | Phase 3 | Beklemede |
| UNDO-03 | Phase 3 | Beklemede |
| EXP-01 | Phase 4 | Tamamlandı |
| EXP-02 | Phase 4 | Tamamlandı |
| EXP-03 | Phase 4 | Tamamlandı |
| EXP-04 | Phase 4 | Tamamlandı |
| EXP-05 | Phase 4 | Tamamlandı |
**Coverage:**
- v1 gereksinimleri: 15 toplam
- Haritalandırılmış: 15
- Haritalandırılmamış: 0 ✓

---
*Gereksinimler tanımlandı: 2026-03-30*
*Son güncelleme: 2026-04-02 — Phase 4 deneysel kombin gereksinimleri eklendi*
