# Phase 2: Oturum Kalıcılığı - Context & Decisions

**Date:** 2026-03-30
**Phase:** 02-oturum-kalıcılığı

## Vision

Kullanıcıların kıyafet kombinasyonlarını, yüklediği dolaplarını ve poz/sahne seçimlerini sayfa yenilemesi sonrasında kaybetmemesi. Tüm oturum verisi tarayıcı localStorage'ında kalıcı hale gelir.

## Requirements (from ROADMAP)

- **SESS-01**: Sayfa yenilenince kombin geçmişi (outfitHistory, currentOutfitIndex) kaybolmaz
- **SESS-02**: Sayfa yenilenince dolap verisi (kullanıcının yüklediği parçalar) kaybolmaz
- **SESS-03**: Sayfa yenilenince mevcut poz indeksi ve sahne varyasyonları korunur
- **SESS-04**: "Baştan Başla" seçeneği tüm kayıtlı oturum verisini temizler

## Decisions

### D-01: Storage Solution
**Decision:** Browser localStorage (istemci tarafı)
**Rationale:** Sunucu yok, kullanıcı hesap sistemi yok, tek kullanıcı odaklı app. localStorage yeterli ve basit.
**Locked:** ✓

### D-02: Serialization Format
**Decision:** JSON (localStorage string format)
**Rationale:** Tüm state (outfitHistory, poseImages, sceneVariations) JSON-serializable. localStorage otomatik string konvertirme yapar.
**Locked:** ✓

### D-03: Storage Namespace
**Decision:** Single key `fit-check-session` containing namespaced object
**Rationale:** Atomic writes (tüm data bir karede yazılır), collisions, cleanup kolay.
**Locked:** ✓

### D-04: Error Handling
**Decision:** Graceful degradation (corrupted data = skip restore, continue without)
**Rationale:** localStorage güvenilir olmayabilir (quota full, corrupt data), app hiçbir şekilde bozulmayacak.
**Locked:** ✓

## Architecture Impact

**Modified Components:**
- `App.tsx` — Add useEffect hooks for restore/persist + reset handler wire

**New Files:**
- `src/lib/sessionPersistence.ts` — Persistence utilities

**Unchanged:**
- Service layer, component hierarchy, styling, Gemini API usage
- Phase 1 aspect ratio preservation

## Edge Cases Handled

1. **First visit** → localStorage empty → state initializes to default (modelImageUrl = null, outfitHistory = [], etc.)
2. **Corrupted data** → JSON.parse fails → skip restore, use default
3. **Storage quota exceeded** → Catch error, warn user, continue without persistence
4. **Manual reset** → "Baştan Başla" clears localStorage key entirely
5. **Multiple tabs** → Each tab has its own session (storage-event not used, intentional isolation)

## Testing Strategy

Verification will test:
- Page reload with unsaved state → state restored correctly
- "Baştan Başla" → localStorage cleared, state reset to initial
- Corrupted localStorage data → app doesn't crash, uses defaults
- Existing wardrobe functionality → unchanged

---

*Context defined: 2026-03-30*
