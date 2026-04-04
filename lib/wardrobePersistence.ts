import type { WardrobeItem } from '../types';

const RESTORABLE_URL_PREFIXES = ['data:image/', 'http://', 'https://', '/'];

export const isRestorableWardrobeUrl = (url: string): boolean => {
  const normalized = url.trim();

  if (!normalized || normalized === '[image-data]' || normalized.startsWith('blob:')) {
    return false;
  }

  return RESTORABLE_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

export const sanitizePersistedWardrobeItems = (items: WardrobeItem[]): WardrobeItem[] =>
  items.filter((item) => isRestorableWardrobeUrl(item.url));
