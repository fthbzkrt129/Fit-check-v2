/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  DressLengthOption,
  ExperimentalGarmentSelection,
  GarmentCategory,
  OuterwearLengthOption,
  OutfitLayer,
  SceneVariation,
  TopLengthOption,
  WardrobeItem,
} from '@/lib/kombin/types';

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
  selectedDressLength: DressLengthOption | null;
  selectedOuterwearLength: OuterwearLengthOption | null;
  stylingMode: 'standard' | 'experimental';
  stagedExperimentalGarments: ExperimentalGarmentSelection[];
}

const STORAGE_KEY = 'fit-check-session-v2';
const garmentCategories = new Set<GarmentCategory>(['top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory']);
const topLengths = new Set<TopLengthOption>(['crop', 'waist', 'hip', 'tunic']);
const dressLengths = new Set<DressLengthOption>(['knee', 'midi', 'maxi', 'floor']);
const outerwearLengths = new Set<OuterwearLengthOption>(['short', 'medium', 'long']);

const isDataImageUrl = (value: string | null | undefined) => typeof value === 'string' && value.startsWith('data:image/');

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isValidOutfitLayer = (value: unknown) =>
  isRecord(value) &&
  typeof value.category === 'string' &&
  isRecord(value.poseImages) &&
  Object.values(value.poseImages).every((imageUrl) => typeof imageUrl === 'string');

const isValidSceneVariation = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.imageUrl === 'string' &&
  typeof value.sourcePose === 'string' &&
  typeof value.createdAt === 'number';

const isValidWardrobeItem = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.url === 'string' &&
  typeof value.source === 'string';

const isValidExperimentalGarmentSelection = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.category === 'string' &&
  typeof value.source === 'string';

const toQuotaSafeSessionState = (state: SessionState): SessionState => ({
  ...toPersistableSessionState(state),
  pinnedWardrobe: state.pinnedWardrobe.filter((item) => !isDataImageUrl(item.url)),
  stagedExperimentalGarments: state.stagedExperimentalGarments.filter(
    (selection) => typeof selection.source === 'string' && !isDataImageUrl(selection.source),
  ),
});

const toPersistableSessionState = (state: SessionState): SessionState => {
  const hasHeavyImages =
    isDataImageUrl(state.modelImageUrl) ||
    state.outfitHistory.some((layer) => Object.values(layer.poseImages).some((imageUrl) => isDataImageUrl(imageUrl))) ||
    state.sceneVariations.some((variation) => isDataImageUrl(variation.imageUrl));

  if (!hasHeavyImages) {
    return state;
  }

  return {
    ...state,
    modelImageUrl: null,
    outfitHistory: [],
    currentOutfitIndex: 0,
    currentPoseIndex: 0,
    sceneVariations: [],
  };
};

const normalizeSessionState = (state: Omit<SessionState, 'stylingMode' | 'stagedExperimentalGarments'> & Partial<Pick<SessionState, 'stylingMode' | 'stagedExperimentalGarments'>>): SessionState => ({
  ...state,
  stylingMode: state.stylingMode === 'experimental' ? 'experimental' : 'standard',
  stagedExperimentalGarments: Array.isArray(state.stagedExperimentalGarments) ? state.stagedExperimentalGarments : [],
});

/**
 * Validates that a restored object has all required SessionState properties
 */
const isValidSessionState = (obj: any): obj is SessionState => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('modelImageUrl' in obj) &&
    (obj.modelImageUrl === null || typeof obj.modelImageUrl === 'string') &&
    Array.isArray(obj.outfitHistory) &&
    obj.outfitHistory.every(isValidOutfitLayer) &&
    typeof obj.currentOutfitIndex === 'number' &&
    typeof obj.currentPoseIndex === 'number' &&
    Array.isArray(obj.sceneVariations) &&
    obj.sceneVariations.every(isValidSceneVariation) &&
    Array.isArray(obj.pinnedWardrobe) &&
    obj.pinnedWardrobe.every(isValidWardrobeItem) &&
    garmentCategories.has(obj.activeCategory) &&
    'selectedTopLength' in obj &&
    'selectedDressLength' in obj &&
    'selectedOuterwearLength' in obj &&
    (obj.selectedTopLength === null || topLengths.has(obj.selectedTopLength)) &&
    (obj.selectedDressLength === null || dressLengths.has(obj.selectedDressLength)) &&
    (obj.selectedOuterwearLength === null || outerwearLengths.has(obj.selectedOuterwearLength)) &&
    (obj.stylingMode === undefined || obj.stylingMode === 'standard' || obj.stylingMode === 'experimental') &&
    (obj.stagedExperimentalGarments === undefined || (Array.isArray(obj.stagedExperimentalGarments) && obj.stagedExperimentalGarments.every(isValidExperimentalGarmentSelection)))
  );
};

/**
 * Saves session state to localStorage
 * Wraps in try/catch to handle quota exceeded errors gracefully
 */
export const saveSessionState = (state: SessionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistableSessionState(state)));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toQuotaSafeSessionState(state)));
      } catch {
        console.warn('[sessionPersistence] localStorage quota exceeded, session not persisted');
      }
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

    return normalizeSessionState(parsed);
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
