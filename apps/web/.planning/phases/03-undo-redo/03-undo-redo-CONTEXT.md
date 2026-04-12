# Phase 3: Undo/Redo - Phase Context

**Phase:** 03-undo-redo
**Requirements:** UNDO-01, UNDO-02, UNDO-03
**Date:** 2026-03-30

## User Vision

Kullanıcılar yanlış bir parça seçtiklerinde veya fikir değiştirdiklerinde önceki duruma dönebilmelidir. Son eklenen parçayı geri almak (undo) ve tekrar uygulamak (redo) için kolay butonlar olmalı.

## Architecture Context

**From Phase 2 Completion:**
- `outfitHistory: OutfitLayer[]` — Tüm layerlar tarihi olarak saklanıyor
- `currentOutfitIndex: number` — Aktif katmanın indeksi
- Session persistence `restoreSessionState()` ve `saveSessionState()` aktif

**Key Insight:**
`currentOutfitIndex` zaten bir "cursor" gibi davranıyor. Phase 1 ve 2'de yalnızca forward hareket etti. Phase 3 te bunu backward/forward yapacağız.

## Requirements Interpretation

1. **UNDO-01:** "Tek tıkla geri alabilir" = `currentOutfitIndex` azalt (1 adım)
   - Trigger: Undo button click
   - Condition: `currentOutfitIndex > 0`
   - Action: `setCurrentOutfitIndex(prev => prev - 1)`

2. **UNDO-02:** "Geri alınan parçayı yineleyebilir" = `currentOutfitIndex` artır (1 adım)
   - Trigger: Redo button click
   - Condition: `currentOutfitIndex < outfitHistory.length - 1`
   - Action: `setCurrentOutfitIndex(prev => prev + 1)`

3. **UNDO-03:** "Butonlar bağlam bazlı görünür/gizli olur" = Conditional rendering
   - Undo: Active when `currentOutfitIndex > 0`, disabled when `currentOutfitIndex === 0`
   - Redo: Active when `currentOutfitIndex < outfitHistory.length - 1`, disabled when at latest

## UI Placement

Undo/Redo butonları Canvas'ın üst-left köşesine, "Baştan Başla" gibi, icon ve label ile.

## No Breaking Changes

- `outfitHistory` ve `currentOutfitIndex` mantığı değişmiyor
- Mevcut garment selection flow unchanged
- Session persistence unchanged (undo/redo state zaten persist ediliyor)

---

*Context created: 2026-03-30*
