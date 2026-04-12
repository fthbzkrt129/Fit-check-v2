# Phase 4: Deneysel Kombin Giydirme - Context

**Phase:** 04-deneysel-kombin-giydirme
**Requirements:** EXP-01, EXP-02, EXP-03, EXP-04
**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Bu faz, mevcut Gemini adım-adım giydirme akışını bozmadan alternatif bir **fal.ai toplu kombin** akışı ekler.

Kapsam:
- `StartScreen` içinde yeni CTA eklemek
- Kullanıcının deneysel moda girmesini sağlamak
- Styling ekranında aktif kombin parçalarını + model görselini tek istekte fal.ai'ye gönderen ayrı final butonu eklemek
- Sonucu mevcut görüntüleme akışında göstermek

Kapsam dışı:
- Mevcut `Proceed to Styling` / Gemini akışını kaldırmak
- Otomatik tetikleme
- Backend/proxy mimarisi eklemek
</domain>

<decisions>
## Decisions

### Locked Decisions
- **D-01:** Entegrasyon **fal.ai** ile yapılacak; Gemini bu deneysel varyasyonun ana üreticisi olmayacak.
- **D-02:** Yeni giriş CTA'sı `StartScreen` içinde, `Proceed to Styling` butonunun yanında yer alacak ve adı **"Deneysel kombin giydir"** olacak.
- **D-03:** fal.ai çağrısı, **aktif kombin parçaları + model görseli** ile **tek istekte** çalışacak; parça parça üretim yapılmayacak.
- **D-04:** fal.ai çağrısı, styling ekranında **ayrı bir final butonu** ile tetiklenecek; kategori bitince otomatik çalışmayacak.
- **D-05:** Prompt yaklaşımı model görselini temel alacak ve diğer görsellerdeki kıyafet öğelerini tek sahnede bunun üzerine birleştirecek.

### the agent's Discretion
- fal.ai endpoint seçimi
- Dosya isimlendirme ve servis/modül ayrımı
- Final aksiyon butonunun ekran içi konumu
- Mevcut SPA mimarisine uygun env aktarım yöntemi
</decisions>

<specifics>
## Specific Ideas

- Amaç: tek istek ile tüm kombini üretip maliyeti düşürmek
- UX ilk adımı: kullanıcı modelini ürettikten sonra standart ya da deneysel akış seçebilmeli
- Deneysel modda kullanıcı önce parçaları seçer, sonra tek seferde kombin üretir
</specifics>

<deferred>
## Deferred Ideas

- fal.ai çağrısını kategori seçimi sırasında otomatik başlatma
- Standart Gemini akışını kaldırma veya tamamen yerine deneysel akışı koyma
- Backend/proxy refactor'ı
</deferred>

---

*Phase: 04-deneysel-kombin-giydirme*
*Context gathered: 2026-04-02 via plan-phase*
