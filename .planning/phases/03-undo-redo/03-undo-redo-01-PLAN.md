---
phase: 03-undo-redo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [components/UndoRedoBar.tsx, App.tsx]
autonomous: true
requirements: [UNDO-01, UNDO-02, UNDO-03]
user_setup: []

must_haves:
  truths:
    - "User can click Undo button when currentOutfitIndex > 0 to navigate backward one layer"
    - "User can click Redo button when currentOutfitIndex < outfitHistory.length - 1 to navigate forward one layer"
    - "Undo button appears disabled (grayed out) when no history to go back to"
    - "Redo button appears disabled when viewing the most recent layer"
    - "Undo/Redo state persists across page refresh"
  artifacts:
    - path: "components/UndoRedoBar.tsx"
      provides: "UI component with Undo/Redo buttons, conditional rendering, Framer Motion animations"
      min_lines: 50
    - path: "App.tsx"
      provides: "Integration of UndoRedoBar, handlers (handleUndo, handleRedo), derived state (canUndo, canRedo)"
      exports: ["handleUndo", "handleRedo"]
  key_links:
    - from: "components/UndoRedoBar.tsx"
      to: "App.tsx handlers"
      via: "onUndo, onRedo props"
      pattern: "onClick={onUndo}"
    - from: "App.tsx"
      to: "currentOutfitIndex state"
      via: "setCurrentOutfitIndex()"
      pattern: "setCurrentOutfitIndex\\(prev => prev (\\+|-) 1\\)"
    - from: "currentOutfitIndex changes"
      to: "displayImageUrl (useMemo)"
      via: "array index update"
      pattern: "outfitHistory\\[currentOutfitIndex\\]"
---

<objective>
Add undo/redo functionality so users can navigate backward/forward through outfit history without re-generating images.

Purpose: Users often want to try different outfit combinations or fix a mistake. Undo/Redo lets them quickly revert to previous states or re-apply discarded layers without losing data.

Output: UndoRedoBar component + App.tsx handlers (handleUndo, handleRedo) + button state tied to outfit history length
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-oturum-kalıcılığı/02-oturum-kalıcılığı-01-SUMMARY.md

# App.tsx State Structure (from Phase 2)
From App.tsx ~line 67-88:
```typescript
const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
// ... other state
```

From App.tsx ~line 93-116:
```typescript
// Restore session on mount
useEffect(() => {
  const restoredSession = restoreSessionState();
  if (restoredSession) {
    setModelImageUrl(restoredSession.modelImageUrl);
    setOutfitHistory(restoredSession.outfitHistory);
    setCurrentOutfitIndex(restoredSession.currentOutfitIndex);
    // ...
  }
}, []);
```

# displayImageUrl Derivation
From App.tsx (useMemo):
```typescript
const displayImageUrl = useMemo(() => {
  if (currentOutfitIndex < 0 || currentOutfitIndex >= outfitHistory.length) return null;
  const layer = outfitHistory[currentOutfitIndex];
  // ... resolve to data URL
}, [outfitHistory, currentOutfitIndex, selectedSceneVariationId]);
```

# Component Pattern (from Canvas.tsx, OutfitStack.tsx)
- Components are dumb (receive props, emit callbacks)
- Parent App.tsx owns state
- Framer Motion for animations (AnimatePresence, motion.div)
- Tailwind for styling
- Icons from components/icons (ChevronLeftIcon, etc.)

# outfitFlow utilities (from lib/outfitFlow.ts)
- CATEGORY_LABELS: Record<GarmentCategory, string>
- getNextCategory(current): GarmentCategory
- isCategorySelectionAllowed(outfit): boolean

@.planning/phases/03-undo-redo/03-undo-redo-CONTEXT.md
@.planning/phases/03-undo-redo/03-undo-redo-DISCOVERY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create UndoRedoBar Component</name>
  <files>components/UndoRedoBar.tsx</files>
  <action>
Create a new functional React component `UndoRedoBar.tsx` with the following:

**Props Interface:**
```typescript
interface UndoRedoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}
```

**Structure:**
1. Two buttons (Undo, Redo) in a flex row, left-aligned
2. Use ChevronLeftIcon and ChevronRightIcon from `components/icons`
3. Label text: "Geri Al" (Undo), "Yinele" (Redo)
4. Tailwind classes:
   - Container: `flex gap-2 items-center`
   - Buttons: `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors`
   - Active state: `bg-blue-500 hover:bg-blue-600 text-white`
   - Disabled state: `bg-gray-300 text-gray-500 cursor-not-allowed`
5. Use Framer Motion for smooth opacity transitions when disabled/enabled
6. Apply `disabled={!canUndo}` and `disabled={!canRedo}` attributes
7. Call `onUndo()` on button click (if canUndo), `onRedo()` on button click (if canRedo)

**No new dependencies required** — use existing icons, Tailwind, Framer Motion

**File should be:**
- Functional component with TypeScript
- Proper JSX with accessibility (button roles, aria-disabled if needed)
- ~60-80 lines total
- Follows existing component style (see Canvas.tsx, OutfitStack.tsx for patterns)
  </action>
  <verify>
    <automated>
      - File exists at components/UndoRedoBar.tsx
      - File exports named function UndoRedoBar
      - File imports ChevronLeftIcon, ChevronRightIcon from components/icons
      - TypeScript compiles without errors: npx tsc --noEmit
    </automated>
  </verify>
  <done>
    UndoRedoBar component created with disabled/enabled button states, proper Tailwind styling, and Framer Motion transitions. Component accepts canUndo, canRedo, onUndo, onRedo props and renders correctly.
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate Undo/Redo Handlers into App.tsx</name>
  <files>App.tsx</files>
  <action>
Modify App.tsx to add undo/redo functionality:

**1. Add Derived State (after line ~90, with other const declarations):**
```typescript
const canUndo = currentOutfitIndex > 0;
const canRedo = currentOutfitIndex < outfitHistory.length - 1;
```

**2. Add Event Handlers (after handleGarmentSelect, around line ~300):**
```typescript
const handleUndo = useCallback(() => {
  if (canUndo) {
    setCurrentOutfitIndex(prev => prev - 1);
  }
}, [canUndo]);

const handleRedo = useCallback(() => {
  if (canRedo) {
    setCurrentOutfitIndex(prev => prev + 1);
  }
}, [canRedo]);
```

**3. Import UndoRedoBar Component (at top, line ~8-14 with other component imports):**
```typescript
import UndoRedoBar from './components/UndoRedoBar';
```

**4. Render UndoRedoBar in JSX (inside Canvas container, add as sibling to Canvas or overlay):**

Find the JSX that renders Canvas (around line ~500-600, inside the `modelImageUrl ? (...)` ternary).

**Pattern to follow:** See how Canvas is rendered. Add UndoRedoBar in the same container, positioned absolutely in top-left or as a horizontal bar above Canvas.

Example placement:
```typescript
<div className="relative flex-1">
  <UndoRedoBar 
    canUndo={canUndo}
    canRedo={canRedo}
    onUndo={handleUndo}
    onRedo={handleRedo}
  />
  <Canvas
    // ... existing props
  />
</div>
```

**5. Verify:**
- All state dependencies correct
- No extra re-renders (use useCallback, dependency arrays)
- UndoRedoBar receives correct props

**No breaking changes:**
- Existing garment selection flow unchanged
- Pose variation flow unchanged
- Scene variation flow unchanged
- Session persistence already handles currentOutfitIndex
  </action>
  <verify>
    <automated>
      - npx tsc --noEmit passes (no TypeScript errors)
      - npm run build succeeds (production build)
      - grep -n "handleUndo\|handleRedo" App.tsx shows both handlers defined
      - grep -n "UndoRedoBar" App.tsx shows import and JSX render
    </automated>
  </verify>
  <done>
    App.tsx integrated with:
    - canUndo and canRedo derived state
    - handleUndo and handleRedo useCallback handlers
    - UndoRedoBar component imported and rendered with correct props
    - All handlers wired to currentOutfitIndex setter
    - No TypeScript errors, production build succeeds
  </done>
</task>

</tasks>

<verification>
**Local Verification (manual or automated):**

1. **Browser Test:**
   - Open app, upload model image
   - Add 3-4 garments (build outfit history)
   - Verify Undo button active, click Undo → index decreases, image reverts to previous layer
   - Verify Redo button active, click Redo → index increases, image shows next layer
   - Verify Undo button disabled when index === 0
   - Verify Redo button disabled when index === outfitHistory.length - 1

2. **Persistence Test:**
   - Build outfit with Undo/Redo at middle index (e.g., index 2 of 4)
   - Reload page
   - Verify index persists, image shows correct layer, buttons reflect state

3. **Edge Cases:**
   - With single layer (base only): Both buttons disabled
   - Add new layer while at index 2 of 5: New layer appended, index auto-jumps to 6

**Automated:**
- `npm run build` completes successfully
- No TypeScript errors
- No console errors in DevTools
</verification>

<success_criteria>
✅ UNDO-01: User can click Undo to navigate backward one layer (when canUndo is true)
✅ UNDO-02: User can click Redo to navigate forward one layer (when canRedo is true)
✅ UNDO-03: Undo/Redo buttons appear disabled when not applicable (canUndo/canRedo false)
✅ Undo/Redo state (currentOutfitIndex) persists across page refresh
✅ No breaking changes to existing garment selection, pose variation, scene variation flows
✅ Production build succeeds
✅ All TypeScript types valid
</success_criteria>

<output>
After completion, create `.planning/phases/03-undo-redo/03-undo-redo-01-SUMMARY.md` with:
- What was built (UndoRedoBar component, App.tsx handlers)
- How it works (state flow, index navigation)
- Requirements met (UNDO-01, UNDO-02, UNDO-03)
- Browser verification checklist
- Commits made
- Duration

Then update `.planning/ROADMAP.md`:
- Mark Phase 3 as complete
- Update phase summary with "✅ Undo/Redo implemented"
</output>
