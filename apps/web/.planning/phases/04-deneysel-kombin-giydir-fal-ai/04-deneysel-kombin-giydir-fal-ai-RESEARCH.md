# Phase 4: Deneysel Kombin Giydir (fal.ai) - Research

**Date:** 2026-04-02
**Phase:** 04-deneysel-kombin-giydir-fal-ai
**Research level:** Level 2 — new external integration

## Existing Flow Findings

1. **UI entry point:** `components/StartScreen.tsx`
   - `generatedModelUrl` hazır olduğunda `Proceed to Styling` butonu görünür.
   - Bu buton `onModelFinalized(generatedModelUrl)` çağırır.
2. **Main app transition:** `App.tsx`
   - `handleModelFinalized(url)` model görselini state'e yazar ve `outfitHistory` içine base layer oluşturur.
3. **Standard styling path:** `handleGarmentSelect()`
   - Her seçimde `generateVirtualTryOnImage()` çağrılır.
   - Bu maliyetli çünkü her kategori/ürün seçiminde ayrı AI request oluşur.

## fal.ai Documentation Findings

Source validated via Context7 (`/fal-ai/fal-js`, `/websites/fal_ai_models`):

### fal-js client

- Paket: `@fal-ai/client`
- Yapılandırma: `fal.config({ credentials: process.env.FAL_KEY })`
- Browser kullanımında doğrudan credential mümkündür; güvenlik için proxy önerilir, ancak bu repo browser-only olduğu için ilk iterasyonda mevcut env exposure pattern'i ile uyumlu kalınacak.
- Queue lifecycle desteklenir:
  - `fal.queue.submit(endpoint, { input })`
  - `fal.queue.subscribeToStatus(endpoint, { requestId, onQueueUpdate })`
  - `fal.queue.result(endpoint, { requestId })`
- Hata türleri:
  - `ApiError`
  - `ValidationError`
  - `isRetryableError(error)`
- Dosya yükleme:
  - `fal.storage.upload(file)`
  - `fal.storage.transformInput()` nested File/Blob yapılarını URL'e çevirir

### Candidate model patterns

- `wan/v2.6/image-to-image`
  - `image_urls[]` kabul eder
  - örnek prompt birden çok görseldeki öğeleri tek sahnede birleştirir
  - fiyat örneği dokümanda `$0.03 / image`
- `fal-ai/qwen-image-edit-plus`
  - `image_urls[]` + prompt ile image editing
- `fal-ai/kling-image/v3/image-to-image`
  - `@Image1`, `@Image2` referanslı prompt desteği

## Research Decision

**Recommended default endpoint:** `wan/v2.6/image-to-image`

Gerekçe:
- D-05 ve D-07 ile uyumlu: çoklu görseli tek request'te kabul ediyor
- Prompt örneği doğrudan "image 1 scene + image 2/3/4 elements" tarzını destekliyor
- D-06 maliyet odağına uygun daha düşük maliyetli örnek fiyat bilgisi var

## Implementation Constraints Derived From Research

1. **Provider split must be explicit**
   - Gemini service korunacak
   - fal.ai için ayrı servis modülü gerekli
2. **Prompt bundling helper needed**
   - Base model image = image 1
   - Garment refs = image 2..N
   - Prompt helper referans sıralamasını deterministik üretmeli
3. **Retry policy must be bounded**
   - Sadece `isRetryableError` durumunda tek retry
   - Duplicate submit guard zorunlu
4. **Client-side credential risk must be surfaced**
   - `FAL_KEY` user setup'ta belirtilecek
5. **Standard path untouched**
   - `generateVirtualTryOnImage()` kullanan mevcut akış değişmeden kalmalı

## Risks

- fal.ai anahtarının client-side exposure riski
- Mevcut sequential category UI'nin staged-bundle davranışına adapte edilmesi
- Çoklu referanslı tek sonuç üretiminde kalite dalgalanması
- Outfit history veri modelinin bundled result ile semantik uyumu

## Recommended Scope Split

- **Plan 01:** fal adapter + prompt/image bundling + retry-safe contract tests
- **Plan 02:** UI entry split + staged outfit selection + App wiring + UX/test coverage
