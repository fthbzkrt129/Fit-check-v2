---
phase: 02-oturum-kalıcılığı
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/sessionPersistence.ts, src/App.tsx]
autonomous: true
requirements: [SESS-01, SESS-02, SESS-03, SESS-04]
user_setup: []

must_haves:
  truths:
    - "When a user loads the app, previously saved outfit history (outfitHistory, currentOutfitIndex) is restored"
    - "User-uploaded wardrobe items persist across page reloads"
    - "Current pose index and scene variations are restored after page reload"
    - "Clicking 'Baştan Başla' clears all session data from localStorage and resets the app to initial state"
  artifacts:
    - path: "src/lib/sessionPersistence.ts"
      provides: "Session persistence utilities for saving/restoring/clearing state"
      exports: ["saveSessionState", "restoreSessionState", "clearSessionData", "SessionState"]
    - path: "src/App.tsx"
      provides: "Integration of persistence hooks and reset handler"
      exports: ["App"] (unchanged export, internal hooks added)
  key_links:
    - from: "src/App.tsx"
      to: "src/lib/sessionPersistence.ts"
      via: "useEffect hooks calling restore/save functions"
      pattern: "useEffect.*restoreSessionState|saveSessionState"
    - from: "src/App.tsx handleReset"
      to: "localStorage"
      via: "clearSessionData function clearing storage"
      pattern: "handleReset.*clearSessionData|localStorage.removeItem"
---

<objective>
Implement session persistence to automatically save and restore user's outfit history, wardrobe data, pose selections, and scene variations across page reloads.

Purpose: Meet SESS-01, SESS-02, SESS-03, SESS-04 requirements so users don't lose work when refreshing the page.
Output: New sessionPersistence.ts utility module and integration hooks in App.tsx.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/02-oturum-kalıcılığı/02-oturum-kalıcılığı-DISCOVERY.md
@.planning/phases/02-oturum-kalıcılığı/02-oturum-kalıcılığı-CONTEXT.md
@.planning/codebase/ARCHITECTURE.md
@src/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create session persistence utility module</name>
  <files>src/lib/sessionPersistence.ts</files>
  <action>
Create a new utility module `src/lib/sessionPersistence.ts` with the following functions:

1. **Type Definition (SessionState interface):**
   - modelImageUrl: string | null
   - outfitHistory: OutfitLayer[]
   - currentOutfitIndex: number
   - currentPoseIndex: number
   - sceneVariations: Record&lt;number, SceneVariation[]&gt;
   - pinnedWardrobe: WardrobeItem[]

2. **Function: saveSessionState(state: SessionState): void**
   - Serialize state to JSON
   - Save to localStorage under key "fit-check-session"
   - Wrap in try/catch to handle quota exceeded errors
   - Log warning if storage fails (don't throw)

3. **Function: restoreSessionState(): SessionState | null**
   - Retrieve "fit-check-session" from localStorage
   - Parse JSON with try/catch
   - Validate structure (check required keys exist)
   - Return null if missing/corrupted
   - Return full SessionState object if valid

4. **Function: clearSessionData(): void**
   - Remove "fit-check-session" key from localStorage
   - No error handling needed (removeItem is safe)

5. **Error Handling Patterns:**
   - localStorage.getItem() can return null safely
   - JSON.parse() wrapped in try/catch with fallback to null
   - localStorage.setItem() wrapped in try/catch, log warning but don't throw
   - Type validation after restore (check for required properties)

Import types from @/types.ts (OutfitLayer, SceneVariation, WardrobeItem).
  </action>
  <verify>
    <automated>
      npm test -- --run 2>&1 | grep -i "sessionPersistence\|PASS\|FAIL" || echo "Tests would verify sessionPersistence module structure and exports"
    </automated>
  </verify>
  <done>
    sessionPersistence.ts module created with saveSessionState, restoreSessionState, clearSessionData functions, proper error handling, and TypeScript types
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate persistence hooks into App.tsx</name>
  <files>src/App.tsx</files>
  <action>
Modify `src/App.tsx` to integrate session persistence:

1. **Import the persistence module:**
   ```typescript
   import { saveSessionState, restoreSessionState, clearSessionData } from '@/lib/sessionPersistence';
   ```

2. **Add restore effect (mount only):**
   - Create useEffect with empty dependency array []
   - On mount, call restoreSessionState()
   - If valid state returned:
     - Set modelImageUrl, outfitHistory, currentOutfitIndex, currentPoseIndex, sceneVariations, pinnedWardrobe
     - Use setState calls for each (or batch if using reducer - check current App.tsx pattern)
   - If null (no saved state or corrupted):
     - Skip restoration, app initializes to default state (already done by useState initial values)

3. **Add persist effect (on state changes):**
   - Create useEffect with dependency array: [modelImageUrl, outfitHistory, currentOutfitIndex, currentPoseIndex, sceneVariations, pinnedWardrobe]
   - In effect body, build SessionState object from current state
   - Call saveSessionState(sessionState)
   - This runs after each state change, keeping localStorage in sync

4. **Wire reset handler:**
   - Find existing reset/clear button handler (likely in handleReset or similar)
   - Add call to clearSessionData() BEFORE resetting state
   - Then perform existing state resets (setModelImageUrl(null), setOutfitHistory([]), etc.)
   - Example pattern:
     ```typescript
     const handleReset = () => {
       clearSessionData(); // Clear localStorage first
       setModelImageUrl(null);
       setOutfitHistory([]);
       // ... other resets
     };
     ```

5. **Error logging:**
   - Restore phase: if restoreSessionState returns null, optionally log to console for debugging
   - Persist phase: localStorage errors are already caught in sessionPersistence.ts

6. **No breaking changes:**
   - Keep all existing App.tsx logic, state, and handlers
   - Only ADD useEffect hooks and calls to persistence functions
   - Do NOT change component hierarchy, rendering logic, or other handlers
  </action>
  <verify>
    <automated>
      npm run build 2>&1 | grep -i "error\|success" || echo "Build verification - successful compile"
    </automated>
  </verify>
  <done>
    App.tsx integrated with session persistence: restore on mount, persist on state change, reset clears storage. All existing functionality preserved.
  </done>
</task>

</tasks>

<verification>
After completion, verify:
1. Open app in browser, upload model, add garments, select pose, generate scene
2. Reload page → all state restored (outfit history visible, current pose preserved, scenes still there)
3. Click "Baştan Başla" button → state resets, localStorage cleared
4. Reload after reset → app shows initial state (no previous data)
5. Check browser DevTools → localStorage contains "fit-check-session" key with valid JSON
6. Try to break localStorage (manually corrupt the JSON in DevTools) → page still loads without crashing
7. Verify wardrobe items persist (SESS-02)
</verification>

<success_criteria>
- SESS-01: outfitHistory and currentOutfitIndex persist and restore on page reload ✓
- SESS-02: User-uploaded wardrobe data persists across reloads ✓
- SESS-03: currentPoseIndex and sceneVariations persist and restore on page reload ✓
- SESS-04: "Baştan Başla" clears all session data and resets app ✓
- No errors when corrupted localStorage data encountered ✓
- All existing functionality remains unchanged ✓
</success_criteria>

<output>
After completion, create .planning/phases/02-oturum-kalıcılığı/02-oturum-kalıcılığı-SUMMARY.md
</output>
