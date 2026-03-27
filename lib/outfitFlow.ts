import type { GarmentCategory, TopLengthOption } from '../types';

const CATEGORY_ORDER: GarmentCategory[] = ['top', 'bottom', 'footwear', 'accessory'];

export const getNextCategory = (category: GarmentCategory): GarmentCategory => {
  const currentIndex = CATEGORY_ORDER.indexOf(category);
  return CATEGORY_ORDER[Math.min(currentIndex + 1, CATEGORY_ORDER.length - 1)];
};

export const isCategorySelectionAllowed = (
  activeCategory: GarmentCategory,
  nextCategory: GarmentCategory,
  selectedTopLength: TopLengthOption | null,
): boolean => {
  if (activeCategory === 'top' && nextCategory !== 'top' && !selectedTopLength) {
    return false;
  }

  return true;
};

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: 'Üst Giyim',
  bottom: 'Alt Giyim',
  footwear: 'Ayakkabı',
  accessory: 'Aksesuar',
};

export const TOP_LENGTH_LABELS: Record<TopLengthOption, string> = {
  crop: 'Crop',
  waist: 'Bel',
  hip: 'Kalça',
  tunic: 'Tunik',
};
