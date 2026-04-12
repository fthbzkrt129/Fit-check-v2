import type { WardrobeItem } from '@/lib/kombin/types';

const STORAGE_KEY = 'fit-check:pinned-wardrobe';

const isPersistableWardrobeItem = (item: WardrobeItem) => item.url.startsWith('data:image/');

export const getPinnedWardrobeItems = (): WardrobeItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return (JSON.parse(raw) as WardrobeItem[]).filter(isPersistableWardrobeItem);
  } catch {
    return [];
  }
};

export const savePinnedWardrobeItems = (items: WardrobeItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter(isPersistableWardrobeItem)));
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
