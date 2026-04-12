/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GarmentCategory, OutfitLayer, SceneVariation, TopLengthOption, WardrobeItem } from '@/lib/kombin/types';

/**
 * SessionState: Complete session state for persistence across page reloads
 */
export interface SessionState {
  modelImageUrl: string | null;
  outfitHistory: OutfitLayer[];
  currentOutfitIndex: number;
  currentPoseIndex: number;
  sceneVariations: SceneVariation[];
  pinnedWardrobe: WardrobeItem[];
  activeCategory: GarmentCategory;
  selectedTopLength: TopLengthOption | null;
}

const STORAGE_KEY = 'fit-check-session-v2';

/**
 * Validates that a restored object has all required SessionState properties
 */
const isValidSessionState = (obj: any): obj is SessionState => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'modelImageUrl' in obj &&
    'outfitHistory' in obj &&
    'currentOutfitIndex' in obj &&
    'currentPoseIndex' in obj &&
    'sceneVariations' in obj &&
    'pinnedWardrobe' in obj &&
    'activeCategory' in obj &&
    'selectedTopLength' in obj
  );
};

/**
 * Saves session state to localStorage
 * Wraps in try/catch to handle quota exceeded errors gracefully
 */
export const saveSessionState = (state: SessionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('[sessionPersistence] localStorage quota exceeded, session not persisted');
    } else {
      console.warn('[sessionPersistence] Failed to save session:', err);
    }
  }
};

/**
 * Restores session state from localStorage
 * Returns null if not found or corrupted
 */
export const restoreSessionState = (): SessionState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    
    // Validate structure
    if (!isValidSessionState(parsed)) {
      console.warn('[sessionPersistence] Invalid session structure, ignoring');
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('[sessionPersistence] Failed to restore session:', err);
    return null;
  }
};

/**
 * Clears all session data from localStorage
 */
export const clearSessionData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[sessionPersistence] Failed to clear session:', err);
  }
};
