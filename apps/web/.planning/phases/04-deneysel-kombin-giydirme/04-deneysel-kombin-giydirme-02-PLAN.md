---
phase: 04-deneysel-kombin-giydirme
plan: "02"
type: execute
wave: 2
depends_on:
  - 04-01
files_modified:
  - App.tsx
  - components/StartScreen.tsx
  - components/ExperimentalTryOnBar.tsx
autonomous: false
requirements:
  - EXP-01
  - EXP-02
  - EXP-03
must_haves:
  truths:
    - "Kullanıcı model oluşturduktan sonra `Deneysel kombin giydir` CTA'sını görebilir."
    - "Deneysel modda kullanıcı kombin parçalarını seçip tek final butonuyla üretimi başlatabilir."
    - "fal.ai sonucu mevcut görüntüleme alanında görünürken standart Gemini akışı bozulmaz."
  artifacts:
    - path: "components/StartScreen.tsx"
      provides: "İki CTA'lı giriş seçimi"
      min_lines: 180
    - path: "components/ExperimentalTryOnBar.tsx"
      provides: "Deneysel final aksiyon bileşeni"
      exports: ["default"]
    - path: "App.tsx"
      provides: "Mode state, final fal tetikleme, existing flow isolation"
      contains: "generateExperimentalOutfitImage"
  key_links:
    - from: "components/StartScreen.tsx"
      to: "App.tsx"
      via: "mode selection callback"
      pattern: "Deneysel kombin giydir"
    - from: "App.tsx"
      to: "services/falService.ts"
      via: "final experimental generate handler"
      pattern: "generateExperimentalOutfitImage"
    - from: "App.tsx"
      to: "components/ExperimentalTryOnBar.tsx"
      via: "conditional render in experimental mode"
      pattern: "ExperimentalTryOnBar"
---

<objective>
Deneysel fal.ai akışını kullanıcıya görünür ve çalıştırılabilir hale getir.

Purpose: D-02, D-03 ve D-04'e uygun olarak kullanıcıların standart akışı kaybetmeden toplu kombin üretimini deneyebilmesini sağlamak.
Output: StartScreen CTA, experimental mode state, final generate button, App orchestration, kullanıcı doğrulama checkpoint'i.
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
@.planning/phases/03-undo-redo/03-undo-redo-01-SUMMARY.md
@App.tsx
@components/StartScreen.tsx

<interfaces>
Existing StartScreen contract:
```typescript
interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}
```

Plan 01 output contract to use directly:
```typescript
export type StylingMode = 'standard' | 'experimental';
export const generateExperimentalOutfitImage: (input: ExperimentalOutfitInput) => Promise<string>;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: StartScreen içinde deneysel giriş CTA'sını ekle</name>
  <files>components/StartScreen.tsx, App.tsx</files>
  <action>D-02'yi uygula: `Proceed to Styling` yanında ikinci CTA olarak `Deneysel kombin giydir` butonunu ekle. App tarafında standart ve deneysel mod ayrımını taşıyan açık bir state oluştur. CTA seçimi yalnızca akış modunu belirlesin; bu aşamada fal çağrısı yapılmasın. `Proceed to Styling` mevcut davranışını korusun; deneysel CTA ise kullanıcıyı aynı model görseliyle experimental styling moduna soksun.</action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Kullanıcı model üretimi sonrası iki farklı yol görür; standart yol korunur, deneysel yol ayrı mode state ile başlatılır.</done>
</task>

<task type="auto">
  <name>Task 2: Final experimental generate butonunu ve App orchestration'ını bağla</name>
  <files>App.tsx, components/ExperimentalTryOnBar.tsx</files>
  <action>D-03 ve D-04 için yeni `ExperimentalTryOnBar` bileşeni oluştur ve sadece experimental mode aktifken render et. App içinde aktif outfit katmanlarından `base` dışındaki garment görsellerini topla; `generateExperimentalOutfitImage(...)` çağrısını yalnızca bu final butonu tetiklesin. Başarılı sonuçta yeni görseli mevcut görüntüleme alanında göster; loading/error davranışını mevcut `App.tsx` kalıplarıyla yönet. Otomatik tetikleme ekleme, mevcut `handleGarmentSelect()` Gemini davranışını standart mod için bozma, undo/redo ve scene/pose akışlarına gereksiz yan etki verme.</action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Experimental mode kullanıcısı kombin parçalarını seçtikten sonra tek butonla fal.ai üretimi başlatabilir; sonuç ana canvas akışında görünür; standart mod etkilenmez.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Tarayıcıda deneysel akışı doğrula</name>
  <action>Task 1 ve Task 2 tamamlandıktan sonra kullanıcıyla birlikte yeni CTA görünürlüğünü, final fal.ai tetikleme anını ve standart akışın bozulmadığını uçtan uca doğrula.</action>
  <what-built>StartScreen deneysel CTA + styling ekranında final fal.ai üretim akışı</what-built>
  <how-to-verify>
    1. Uygulamayı aç ve bir model fotoğrafı yükle.
    2. Model üretildikten sonra `Proceed to Styling` yanında `Deneysel kombin giydir` butonunu gör.
    3. Bu butonla experimental moda gir.
    4. En az 2 farklı kategori parçası seç.
    5. Styling ekranındaki `Deneysel kombin üret` butonuna bas.
    6. Tek loading akışı göründüğünü ve sonuç görselinin ana canvas'ta belirdiğini doğrula.
    7. Standart `Proceed to Styling` yolunu da test et; mevcut Gemini akışının aynı kaldığını doğrula.
  </how-to-verify>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Kullanıcı deneysel CTA'yı görebildiğini, final butonun tek tetikleme noktası olduğunu ve standart akışın bozulmadığını onaylar.</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build başarılı olmalı.
- Experimental mode yalnızca final CTA ile fal isteği atmalı.
- Standard mode davranışı korunmalı.
</verification>

<success_criteria>
- EXP-01: StartScreen üzerinde yeni deneysel CTA görünür.
- EXP-02: fal.ai tek final isteği ile aktif kombin + model üzerinden çalışır.
- EXP-03: mevcut Gemini step-by-step akışı bozulmadan kullanılmaya devam eder.
</success_criteria>

<output>
After completion, create `.planning/phases/04-deneysel-kombin-giydirme/04-deneysel-kombin-giydirme-02-SUMMARY.md`
</output>
