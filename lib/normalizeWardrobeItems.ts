import type { GarmentCategory, WardrobeItem } from '../types';
import { formatWardrobeItemName } from './wardrobeItemName';

const defaultCategory: GarmentCategory = 'top';

export const normalizeWardrobeItem = (item: WardrobeItem, fallbackCategory: GarmentCategory = defaultCategory): WardrobeItem => {
  const category = item.category ?? fallbackCategory;

  return {
    ...item,
    category,
    name: formatWardrobeItemName(item.name, category),
  };
};

export const normalizeWardrobeItems = (items: WardrobeItem[], fallbackCategory: GarmentCategory = defaultCategory): WardrobeItem[] => (
  items.map((item) => normalizeWardrobeItem(item, fallbackCategory))
);
