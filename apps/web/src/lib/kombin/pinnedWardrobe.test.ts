import { beforeEach, describe, expect, it } from 'vitest';
import type { WardrobeItem } from '@/lib/kombin/types';
import { addPinnedWardrobeItem, getPinnedWardrobeItems, savePinnedWardrobeItems } from './pinnedWardrobe';

const STORAGE_KEY = 'fit-check:pinned-wardrobe';

const createPinnedItem = (overrides: Partial<WardrobeItem> = {}): WardrobeItem => ({
  id: 'user-item-1',
  name: 'Pinned Bag',
  url: 'data:image/png;base64,abc123',
  category: 'accessory',
  source: 'user',
  isPinned: true,
  ...overrides,
});

describe('pinnedWardrobe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads pinned wardrobe items from localStorage', () => {
    const items = [createPinnedItem()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    expect(getPinnedWardrobeItems()).toEqual(items);
  });

  it('writes pinned wardrobe items to localStorage', () => {
    const items = [createPinnedItem()];

    savePinnedWardrobeItems(items);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(items));
  });

  it('adds a new pinned item without duplicating the same id', () => {
    const item = createPinnedItem();

    addPinnedWardrobeItem(item);
    addPinnedWardrobeItem(item);

    expect(getPinnedWardrobeItems()).toEqual([item]);
  });

  it('keeps only persistable user items with data urls', () => {
    const blobItem = createPinnedItem({ id: 'blob-item', url: 'blob:http://localhost/blob-id' });
    const dataItem = createPinnedItem({ id: 'data-item', url: 'data:image/png;base64,realdata' });

    addPinnedWardrobeItem(blobItem);
    addPinnedWardrobeItem(dataItem);

    expect(getPinnedWardrobeItems()).toEqual([dataItem]);
  });

  it('returns an empty array when localStorage data is invalid', () => {
    localStorage.setItem(STORAGE_KEY, '{not-valid-json');

    expect(getPinnedWardrobeItems()).toEqual([]);
  });
});
