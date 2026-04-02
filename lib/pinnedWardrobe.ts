import type { WardrobeItem } from '../types';
import { normalizeWardrobeItems } from './normalizeWardrobeItems';

const STORAGE_KEY = 'fit-check:pinned-wardrobe';

const isPersistableWardrobeItem = (item: WardrobeItem) => item.url.startsWith('data:image/');

export const getPinnedWardrobeItems = (): WardrobeItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return normalizeWardrobeItems((JSON.parse(raw) as WardrobeItem[]).filter(isPersistableWardrobeItem));
  } catch {
    return [];
  }
};

export const savePinnedWardrobeItems = (items: WardrobeItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeWardrobeItems(items.filter(isPersistableWardrobeItem))));
};

export const addPinnedWardrobeItem = (item: WardrobeItem) => {
  const existing = getPinnedWardrobeItems();
  if (existing.some((entry) => entry.id === item.id)) {
    return existing;
  }

  const updated = [...existing, item];
  savePinnedWardrobeItems(updated);
  return updated;
};
