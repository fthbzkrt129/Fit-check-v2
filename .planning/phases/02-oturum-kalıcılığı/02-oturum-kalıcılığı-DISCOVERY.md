# Phase 2: Oturum Kalıcılığı - Discovery

**Date:** 2026-03-30
**Phase:** 02-oturum-kalıcılığı
**Requirements:** SESS-01, SESS-02, SESS-03, SESS-04

## Context

Phase 1 (En-Boy Oranı Koruma) tamamlandı. Tüm state App.tsx'de useState hooks ile yönetiliyor. localStorage kullanımı mevcut ama session persistence yapısı henüz kurulmamış.

## Research Summary

### 1. React + localStorage Best Practices

**Pattern:** useEffect + dependency array

```typescript
// Restore state on mount
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved) {
    try {
      setState(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to restore:', e);
    }
  }
}, []); // Empty deps = once on mount

// Persist state on change
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(state));
}, [state]); // Run whenever state changes
```

**Key Rules (from React docs):**
- `useEffect` synchronizes components with external systems (localStorage is an external system)
- Dependencies array controls when effect runs
- Empty array `[]` = run once on mount (perfect for restoring initial state)
- Effect list `[state]` = run whenever state changes (perfect for saving)
- Setup function should handle errors (corrupted data, storage quota, etc.)

### 2. Session State Inventory (from ARCHITECTURE.md)

App.tsx manages via useState:
- `modelImageUrl` — Base model image (data URL)
- `outfitHistory` — Array of OutfitLayer objects (all garment applications)
- `currentOutfitIndex` — Position in outfit history
- `currentPoseIndex` — Currently selected pose
- `sceneVariations` — Map of scene/lighting results keyed by outfitIndex
- `pinnedWardrobe` — User-uploaded garments (saved separately per ARCHITECTURE.md)
- `activeCategory` — Current category being dressed (top/bottom/footwear/accessory)

**Note:** ARCHITECTURE mentions `lib/pinnedWardrobe.ts` (wardrobe persistence) and `lib/imagePersistence.ts` (image data URL conversion). These likely already handle some persistence.

### 3. Storage Strategy

**Key insight:** Not all state needs localStorage. Some can be derived/reset on new session.

| State | Persist? | Why | Storage Type |
|-------|----------|-----|--------------|
| modelImageUrl | YES | SESS-01 base (needed for all operations) | localStorage (data URL) |
| outfitHistory | YES | SESS-01 core requirement | localStorage (JSON array) |
| currentOutfitIndex | YES | SESS-01 core requirement | localStorage (number) |
| currentPoseIndex | YES | SESS-03 requirement | localStorage (number) |
| sceneVariations | YES | SESS-03 requirement | localStorage (JSON object) |
| pinnedWardrobe | YES | SESS-02 requirement | localStorage (JSON array, maybe already done) |
| activeCategory | NO | Derived from outfit progress, resets on new session | — |
| loading states | NO | UI-only, no need to persist | — |

### 4. JSON Serialization Edge Cases

**Data URL serialization:**
- Base64 data URLs are JSON-serializable as strings
- Large URLs may hit localStorage quota (~5MB limit)
- Solution: Store path/ID instead of full data URL for system wardrobe; only persist user-uploaded images as data URLs

**OutfitLayer with nested objects:**
```typescript
// Assume OutfitLayer = {garment, poseImages, category}
// poseImages = Record<string, string> (pose name -> data URL)
// This nests deeply but is JSON-serializable
```

**Error scenarios:**
- Corrupted JSON → try/catch on parse
- Missing keys → validate structure after restore
- Storage quota exceeded → log warning, continue without persistence

### 5. "Reset" Requirement (SESS-04)

"Baştan Başla" button should clear all session data. Implementation:
```typescript
const handleReset = () => {
  setModelImageUrl(null);
  setOutfitHistory([]);
  setCurrentOutfitIndex(-1);
  setCurrentPoseIndex(0);
  setSceneVariations({});
  setPinnedWardrobe([]); // or check if separate reset needed
  
  localStorage.removeItem('session_modelImageUrl');
  localStorage.removeItem('session_outfitHistory');
  // ... etc
};
```

## Task Breakdown

Phase 2 requires 2-3 tasks:

1. **Task 1:** Create persistence utilities module (`lib/sessionPersistence.ts`)
   - `saveSessionState(stateObj)` — Serialize and save to localStorage
   - `restoreSessionState()` — Restore from localStorage with validation
   - `clearSessionData()` — Delete all session keys
   - Handle errors, quota checks, JSON validation

2. **Task 2:** Integrate persistence hooks into App.tsx
   - Add `useEffect` on mount to restore initial state
   - Add `useEffect` on each state change to persist
   - Wire `handleReset` to call `clearSessionData()`
   - Ensure wardrobe persistence works (check if already implemented)

3. **Task 3 (Optional):** Test persistence flow
   - Verify data survives page reload
   - Verify reset clears all data
   - Verify data isolation (one outfit doesn't affect another session)

## Storage Keys Schema

Use prefixed keys to avoid collisions:

```
session_modelImageUrl         # Base model image (data URL)
session_outfitHistory         # Entire outfit history array
session_currentOutfitIndex    # Current position in history
session_currentPoseIndex      # Current pose selection
session_sceneVariations       # Scene generation results
session_wardrobe              # User-uploaded wardrobe items (if not separate)
```

Alternative: Single key with namespaced object:
```
fit-check-session → {
  modelImageUrl,
  outfitHistory,
  currentOutfitIndex,
  currentPoseIndex,
  sceneVariations,
  wardrobe
}
```

**Recommendation:** Single namespaced key for atomic writes (all-or-nothing integrity).

## No Breaking Changes

- Phase 1 functionality (aspect ratio) remains intact
- UI components unchanged
- Service layer (Gemini API) unchanged
- Wardrobe loading/pinning unchanged (if already working)

---

*Discovery Date: 2026-03-30*
