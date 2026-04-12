# Phase 3: Undo/Redo - Discovery

**Date:** 2026-03-30
**Phase:** 03-undo-redo
**Requirements:** UNDO-01, UNDO-02, UNDO-03

## Research Summary

### 1. Current State Architecture (from ARCHITECTURE.md + App.tsx inspection)

**Outfit History Model:**
```typescript
outfitHistory: OutfitLayer[]
// Each layer: { garment?: WardrobeItem, poseImages: Record<string, string>, category: GarmentCategory | 'base' }
```

**Index Management:**
- `currentOutfitIndex: number` — Index into `outfitHistory` of the **currently displayed** layer
- Derived: `displayImageUrl` via useMemo uses `outfitHistory[currentOutfitIndex]` to display the image
- History already persisted via `saveSessionState()` (Phase 2)

### 2. Current Forward-Only Flow

**Garment Selection (app.tsx handleGarmentSelect):**
1. User picks garment → calls Gemini API
2. Result → new `OutfitLayer` appended to `outfitHistory`
3. `currentOutfitIndex` incremented (always points to latest)
4. `displayImageUrl` updates to show new layer

**Why This Works for Undo/Redo:**
- `outfitHistory` is immutable (never delete/reorder items)
- `currentOutfitIndex` is the only mutable state
- Moving index backward/forward = undo/redo

### 3. Implementation Pattern

**Undo Handler:**
```typescript
const handleUndo = () => {
  if (currentOutfitIndex > 0) {
    setCurrentOutfitIndex(prev => prev - 1);
  }
};
```

**Redo Handler:**
```typescript
const handleRedo = () => {
  if (currentOutfitIndex < outfitHistory.length - 1) {
    setCurrentOutfitIndex(prev => prev + 1);
  }
};
```

**Conditional Rendering (for button disabled state):**
```typescript
const canUndo = currentOutfitIndex > 0;
const canRedo = currentOutfitIndex < outfitHistory.length - 1;

// Button:
<button disabled={!canUndo} onClick={handleUndo}>Undo</button>
<button disabled={!canRedo} onClick={handleRedo}>Redo</button>
```

### 4. UI Component Approach

**Option A: Add to Canvas.tsx header**
- Canvas already displays layer controls
- Add two buttons next to pose selector

**Option B: Create new UndoRedoBar component**
- Separate component for clarity
- Can be positioned absolutely over Canvas
- Matches existing UI pattern (FooterSuggestions, etc.)

**Recommendation:** Option B (separate component) — better separation of concerns, easier to test, matches Tailwind patterns.

### 5. Edge Cases & Validation

**Case 1: outfitHistory length === 1 (only base layer)**
- `canUndo = false` (index can't go below 0)
- `canRedo = false` (index is at max)
- Both buttons disabled

**Case 2: User adds new layer while not at latest**
- Example: index at 1, history has 5 items
- User adds 6th item
- New item appended to `outfitHistory`
- `currentOutfitIndex` should jump to latest (or keep at 1 — clarify with user)
- **Decision: Jump to latest** (match existing behavior)

**Case 3: Undo/Redo persists across refresh**
- `currentOutfitIndex` already in `SessionState` (Phase 2)
- Refresh will restore the index
- ✓ Already handled

### 6. No Conflicts

- **Pose Variation:** Uses `outfitHistory[currentOutfitIndex].poseImages[poseInstruction]` — undo/redo doesn't affect this
- **Scene Variation:** Tied to `outfitIndex` in `SceneVariation` — undo/redo doesn't affect this (scenes for each index are separate)
- **Wardrobe:** No dependency on index
- **Session Persistence:** `currentOutfitIndex` already persisted — undo/redo state automatically saved

## Task Breakdown

### Task 1: Create UndoRedoBar component
- Location: `components/UndoRedoBar.tsx`
- Inputs: `canUndo`, `canRedo`, `onUndo`, `onRedo`
- Styling: Match Canvas header (Tailwind, Framer Motion transitions)
- Button icons: From `components/icons/`

### Task 2: Integrate into App.tsx
- Add handlers: `handleUndo()`, `handleRedo()`
- Add derived state: `canUndo`, `canRedo`
- Wire buttons to handlers
- Position UndoRedoBar in Canvas area (overlay or side-by-side)

### Task 3 (Optional): Add keyboard shortcuts
- Ctrl+Z = Undo
- Ctrl+Shift+Z = Redo
- Trigger handlers via `useEffect` + `keydown` listener

## Storage & Persistence

- Undo/Redo state = `currentOutfitIndex` value
- Already persisted via `SessionState` (Phase 2)
- No new storage needed ✓

## Test Scenarios

1. ✅ Load app with existing outfit history
2. ✅ Click Undo → index decreases, image updates
3. ✅ Click Redo → index increases, image updates
4. ✅ Click Undo with index at 0 → button disabled, no action
5. ✅ Click Redo with index at max → button disabled, no action
6. ✅ Reload page → index persists, buttons reflect state
7. ✅ Add new layer while at index 2 of 5 → new layer appended, index jumps to 6

---

*Discovery Date: 2026-03-30*
