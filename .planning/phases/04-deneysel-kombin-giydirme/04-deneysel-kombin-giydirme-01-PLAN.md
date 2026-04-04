---
phase: 04-deneysel-kombin-giydirme
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - types.ts
  - lib/experimentalOutfitPrompt.ts
  - lib/experimentalOutfitPrompt.test.ts
  - services/falService.ts
  - services/falService.test.ts
autonomous: true
requirements:
  - EXP-02
  - EXP-04
user_setup:
  - service: fal.ai
    why: "Deneysel toplu kombin üretimi için fal.ai credential gerekli"
    env_vars:
      - name: FAL_KEY
        source: "fal.ai dashboard / API keys"
must_haves:
  truths:
    - "Uygulama aktif kombin parçalarını tek payload mantığıyla fal.ai servisine hazırlayabilir."
    - "Deneysel akış için prompt tek istekli kombin üretimini açıkça tarif eder."
    - "fal.ai cevabı uygulamanın kullanabileceği tek bir image URL/data URL sonucuna normalize edilir."
  artifacts:
    - path: "lib/experimentalOutfitPrompt.ts"
      provides: "Tek istekli deneysel kombin prompt builder"
      min_lines: 30
    - path: "services/falService.ts"
      provides: "fal.ai adapter ve response normalization"
      exports: ["generateExperimentalOutfitImage"]
    - path: "services/falService.test.ts"
      provides: "fal response normalization doğrulaması"
      contains: "generateExperimentalOutfitImage"
  key_links:
    - from: "services/falService.ts"
      to: "@fal-ai/client"
      via: "fal.config / fal.run or fal.subscribe"
      pattern: "@fal-ai/client"
    - from: "services/falService.ts"
      to: "lib/experimentalOutfitPrompt.ts"
      via: "prompt builder import"
      pattern: "buildExperimentalOutfitPrompt"
---

<objective>
fal.ai toplu kombin akışı için teknik temeli kur.

Purpose: D-01, D-03 ve D-05 doğrultusunda App katmanının doğrudan kullanabileceği testli bir servis kontratı üretmek.
Output: fal.ai client entegrasyonu, toplu kombin prompt builder, normalize edilmiş service API, env setup.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-deneysel-kombin-giydirme/04-deneysel-kombin-giydirme-CONTEXT.md
@.planning/phases/04-deneysel-kombin-giydirme/04-deneysel-kombin-giydirme-DISCOVERY.md
@services/geminiService.ts
@types.ts

<interfaces>
From types.ts:
```typescript
export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category?: GarmentCategory;
  source: 'system' | 'user';
  isPinned?: boolean;
}

export interface OutfitLayer {
  garment: WardrobeItem | null;
  poseImages: Record<string, string>;
  category: GarmentCategory | 'base';
}
```

From services/geminiService.ts pattern to mirror:
```typescript
export const generateVirtualTryOnImage = async (...): Promise<string> => { ... }
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Yazılacak fal kontratları ve failing test iskeletini oluştur</name>
  <files>types.ts, lib/experimentalOutfitPrompt.ts, lib/experimentalOutfitPrompt.test.ts, services/falService.ts, services/falService.test.ts</files>
  <behavior>
    - Test 1: `buildExperimentalOutfitPrompt` modeli ana görsel olarak tanımlar ve seçili garment görsellerini sıralı biçimde prompt'a dahil eder.
    - Test 2: garment listesi boşsa builder anlamlı hata üretir.
    - Test 3: `generateExperimentalOutfitImage` fal response içinden ilk geçerli çıktı URL'sini döndürür.
    - Test 4: fal response beklenen image alanını içermiyorsa servis kontrollü hata fırlatır.
  </behavior>
  <action>D-01, D-03 ve D-05 için önce kontratları yaz. `types.ts` içine deneysel akışın App tarafından tüketeceği tipleri ekle (örn. styling mode union, fal request input, fal result shape). `lib/experimentalOutfitPrompt.ts` ve `services/falService.ts` içinde export yüzeyini tanımla ama implementasyonu minimumda bırak; asıl amaç failing testleri netleştirmek. Testler App'e bağımlı olmasın, saf prompt/service sözleşmesini doğrulasın.</action>
  <verify>
    <automated>npm test -- lib/experimentalOutfitPrompt.test.ts services/falService.test.ts</automated>
  </verify>
  <done>Deneysel toplu kombin prompt ve fal servis kontratları testlerle tanımlanmış olur; testler implementasyon öncesi beklenen davranışı açık eder.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: fal.ai adapter ve prompt builder implementasyonunu tamamla</name>
  <files>package.json, vite.config.ts, types.ts, lib/experimentalOutfitPrompt.ts, lib/experimentalOutfitPrompt.test.ts, services/falService.ts, services/falService.test.ts</files>
  <behavior>
    - Test 1: prompt builder tek istekte model + tüm aktif garment öğelerini tarif eder.
    - Test 2: servis, fal sonucunu uygulamanın kullanacağı tek string image URL olarak normalize eder.
    - Test 3: eksik response veya boş garment listesi kullanıcı dostu hataya dönüşür.
  </behavior>
  <action>`@fal-ai/client` bağımlılığını ekle. `vite.config.ts` içinde mevcut istemci-env desenini izleyerek `FAL_KEY` exposure ekle; discovery proxy önerse de bu repo D-01 kapsamındaki mevcut SPA mimarisiyle ilerliyor. `lib/experimentalOutfitPrompt.ts` içinde model görselini image 1, aktif garment görsellerini image 2..N olacak şekilde tek istekli prompt üret. `services/falService.ts` içinde fal client config, input transform ve response normalization yaz; endpoint ID ve output extractor tek yerde dursun. `services/geminiService.ts` kalıplarını izle ama mevcut Gemini akışına dokunma.</action>
  <verify>
    <automated>npm test -- lib/experimentalOutfitPrompt.test.ts services/falService.test.ts && npm run build</automated>
  </verify>
  <done>App katmanının çağırabileceği `generateExperimentalOutfitImage(...)` servisi hazır olur; fal env exposure, prompt builder ve normalize edilmiş sonuç akışı çalışır.</done>
</task>

</tasks>

<verification>
- Servis testleri geçmeli.
- Production build yeni fal bağımlılığı ile başarılı tamamlanmalı.
- `generateExperimentalOutfitImage` Promise&lt;string&gt; kontratını korumalı.
</verification>

<success_criteria>
- D-01: fal.ai entegrasyonu servis seviyesinde hazır.
- D-03: aktif kombin parçalarını tek isteğe dönüştüren payload/prompt katmanı mevcut.
- D-05: prompt builder model + garment birleşim mantığını açıkça taşır.
- EXP-04 için `FAL_KEY` user setup plan frontmatter'da tanımlı.
</success_criteria>

<output>
After completion, create `.planning/phases/04-deneysel-kombin-giydirme/04-deneysel-kombin-giydirme-01-SUMMARY.md`
</output>
