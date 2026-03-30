/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GarmentCategory, SceneVariation, TopLengthOption, WardrobeItem } from '../types';

const STORAGE_KEY = 'fit-check-session';

export interface SessionLayerMeta {
  garmentId: string | null;
  garmentName: string | null;
  category: GarmentCategory | 'base';
  topLength: TopLengthOption | null;
}

export interface SessionData {
  currentOutfitIndex: number;
  currentPoseIndex: number;
  sceneVariations: SceneVariation[];
  activeCategory: GarmentCategory;
  selectedTopLength: TopLengthOption | null;
  wardrobeUserItems: WardrobeItem[];
  outfitLayerMeta: SessionLayerMeta[];
  hasModel: boolean;
}

export const saveSession = (data: SessionData): void => {
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
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    console.warn('[sessionStorage] Corrupted session data, ignoring.');
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
};
