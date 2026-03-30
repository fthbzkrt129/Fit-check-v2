# fit-check

## What This Is

fit-check, kullanıcıların fotoğraf yükleyerek kıyafetleri sanal olarak denemesini sağlayan bir web uygulaması. Gemini AI ile görsel işleme yapılır — kıyafet ekleme, poz değiştirme, sahne oluşturma gibi akışlar sunulur. React 19 + Vite ile geliştirilmiş, tamamen istemci tarafı çalışan bir SPA'dır.

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

### Active

- [ ] **UNDO-01**: Kullanıcı son eklenen kombin parçasını geri alabilir
- [ ] **UNDO-02**: Kullanıcı geri alınan parçayı yineleyebilir
- [ ] **SESS-01**: Sayfa yenilenince kombin geçmişi kaybolmaz
- [ ] **SESS-02**: Sayfa yenilenince dolap verisi kaybolmaz
- [ ] **RATIO-01**: Kare formatlı parça eklenince base görselin en-boy oranı korunur
- [ ] **RATIO-02**: Farklı boyutlardaki görseller birleştirilirken orantılı ölçekleme yapılır

### Out of Scope

- Kullanıcı hesap sistemi / giriş — Yerel depolama yeterli, auth karmaşıklığına gerek yok
- Çoklu kullanıcı paylaşımı — Tek kullanıcı odaklı, sosyal özellikler ileride
- Mobil native uygulama — Web-first yaklaşım, PWA ileride değerlendirilir

## Context

- Tek ortam değişkeni: `GEMINI_API_KEY` (istemci tarafında, Vite define ile exposed)
- Tüm görseller data URL olarak state'te tutulur (base64)
- Tailwind CDN üzerinden yükleniyor (npm'den değil)
- Karışık Türkçe/İngilizce arayüz metinleri
- `App.tsx` merkezileşmiş state yönetimi — 20+ useState

## Constraints

- **Teknoloji**: React 19 + Vite 6 + TypeScript 5.8 — mevcut stack korunur
- **API**: Google Gemini AI — tüm görsel işleme bu API üzerinden
- **Ortam**: İstemci tarafı SPA — sunucu yok, static hosting yeterli
- **Tarayıcı**: ES2022 destekleyen modern tarayıcılar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Oturum için sessionStorage/localStorage | Sunucu yok, auth yok — yerel depolama tek seçenek | — Beklemede |
| Undo/redo için zustand veya useState | Mevcut yapı useState ile — ekleme mi, refactor mü? | — Beklemede |
| En-boy oranı için canvas resize mi, padding mi? | Kalite kaybı vs boyut tutarlılığı | — Beklemede |

## Evolution

Bu belge aşama geçişleri ve milat sınırlarında güncellenir.

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
*Son güncelleme: 2026-03-30 — Milat v1.0 başlatıldı*
