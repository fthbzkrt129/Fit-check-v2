/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  DressLengthOption,
  GarmentCategory,
  OuterwearLengthOption,
  SceneVariation,
  TopLengthOption,
  WardrobeItem,
} from '@/lib/kombin/types';

const STORAGE_KEY = 'fit-check-session';

const isValidSessionData = (value: unknown): value is SessionData => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.currentOutfitIndex === 'number' &&
    typeof data.currentPoseIndex === 'number' &&
    Array.isArray(data.sceneVariations) &&
    typeof data.activeCategory === 'string' &&
    (data.selectedTopLength === null || typeof data.selectedTopLength === 'string') &&
    (data.selectedDressLength === null || typeof data.selectedDressLength === 'string') &&
    (data.selectedOuterwearLength === null || typeof data.selectedOuterwearLength === 'string') &&
    Array.isArray(data.wardrobeUserItems) &&
    Array.isArray(data.outfitLayerMeta) &&
    typeof data.hasModel === 'boolean'
  );
};

export interface SessionLayerMeta {
  garmentId: string | null;
  garmentName: string | null;
  category: GarmentCategory | 'base';
  topLength: TopLengthOption | null;
  dressLength: DressLengthOption | null;
  outerwearLength: OuterwearLengthOption | null;
}

export interface SessionData {
  currentOutfitIndex: number;
  currentPoseIndex: number;
  sceneVariations: SceneVariation[];
  activeCategory: GarmentCategory;
  selectedTopLength: TopLengthOption | null;
  selectedDressLength: DressLengthOption | null;
  selectedOuterwearLength: OuterwearLengthOption | null;
  wardrobeUserItems: WardrobeItem[];
  outfitLayerMeta: SessionLayerMeta[];
  hasModel: boolean;
}

export const saveSession = (data: SessionData): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('[sessionStorage] localStorage quota exceeded, session will not be persisted.');
    } else {
      console.warn('[sessionStorage] Failed to save session:', err);
    }
  }
};

export const loadSession = (): SessionData | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValidSessionData(parsed)) {
      console.warn('[sessionStorage] Invalid session shape, ignoring.');
      return null;
    }

    return parsed;
  } catch {
    console.warn('[sessionStorage] Corrupted session data, ignoring.');
    return null;
  }
};

export const clearSession = (): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
};
