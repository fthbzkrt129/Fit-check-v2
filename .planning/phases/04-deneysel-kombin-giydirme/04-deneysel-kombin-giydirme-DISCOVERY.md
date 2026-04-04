# Phase 4: Deneysel Kombin Giydirme - Discovery

**Date:** 2026-04-02
**Phase:** 04-deneysel-kombin-giydirme
**Discovery Level:** 2 — New external integration (`fal.ai`) in an existing SPA

## Research Summary

### 1. Current Architecture Fit

- Uygulama saf istemci tarafı React + Vite SPA.
- Tüm AI çağrıları bugün `services/geminiService.ts` içinden yönetiliyor.
- `App.tsx` tüm state ve orchestration katmanını elinde tutuyor.
- Mevcut Gemini akışını bozmadan alternatif yol eklemek için en düşük riskli yaklaşım: **ayrı bir fal servisi + App içinde mode state + deneysel final CTA**.

### 2. fal.ai Client Findings

Context7 doğrulaması:
- `@fal-ai/client` tarayıcı ve TypeScript ile kullanılabiliyor.
- `fal.storage.upload(file)` veya doğrudan `File` nesneleri ile çoklu görsel girdisi destekleniyor.
- `fal.run(...)` / `fal.subscribe(...)` ile sonuç alınabiliyor.
- Dokümantasyon, tarayıcıda credential saklamanın önerilmediğini; ideal yaklaşımın proxy olduğunu belirtiyor.

### 3. Project-Specific Integration Choice

Bu repo zaten `GEMINI_API_KEY` değerini istemci bundle'ına expose ediyor. Yeni backend/proxy bu fazın dışında olduğu için en uygulanabilir seçim:

- **Şimdilik client-side `FAL_KEY` env exposure**
- Tek servis dosyasında fal client config
- User setup olarak `FAL_KEY` eklenmesi

Not: Güvenlik açısından proxy daha doğru, ancak bu fazın kapsamı değil.

### 4. UX Recommendation

Kullanıcı kararları ile uyumlu önerilen akış:

1. `StartScreen` içinde iki yol sun:
   - `Proceed to Styling`
   - `Deneysel kombin giydir`
2. Her iki yol da aynı model görselini oluşturur ve styling ekranına taşır.
3. Deneysel mod aktifse parça seçimleri mevcut wardrobe UX ile yapılır ama üretim **hemen yapılmaz**.
4. Ayrı bir final butonu (`Deneysel kombin üret`) aktif kombin parçalarını + model görselini fal.ai'ye tek istekte yollar.

### 5. Prompt / Payload Shape

- image 1 = model/base image
- image 2..N = seçilen kombin parçaları
- tek prompt = model üzerindeki kombini provided images ile tek sahnede üret
- Boş garment listesi için erken hata verilmeli

### 6. Dependency Implications

- Önce servis kontratı ve prompt builder çıkmalı
- Sonra UI / App orchestration bu kontratı kullanmalı
- İki wave uygun:
  - Wave 1: fal service + tests/contracts
  - Wave 2: StartScreen CTA + experimental mode UI + App wiring

### 7. Risks / Pitfalls

- Standart Gemini `handleGarmentSelect()` akışı kırılmamalı
- Aktif kombin katmanları ile base katmanı karıştırılmamalı
- fal output formatı endpoint'e göre değişebileceği için servis katmanında normalize edilmeli
- Uzun `App.tsx` dosyasında yeni state eklenirken session / undo-redo davranışı korunmalı

## Recommendation

- **Plan 01:** `@fal-ai/client` entegrasyonu, prompt builder, normalize edilmiş service contract, testler, env exposure
- **Plan 02:** `StartScreen` CTA, experimental mode state, final generate button, App wiring, browser checkpoint

---

*Discovery completed: 2026-04-02*
