import type { GarmentCategory, TopLengthOption, DressLengthOption, OuterwearLengthOption } from '@/lib/kombin/types';

const CATEGORY_ORDER: GarmentCategory[] = ['top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory'];

export const getNextCategory = (category: GarmentCategory): GarmentCategory => {
  switch (category) {
    case 'top':
    case 'outerwear':
      return 'bottom';
    case 'dress':
    case 'bottom':
      return 'footwear';
    case 'footwear':
      return 'accessory';
    default:
      return 'accessory';
  }
};

export const isCategorySelectionAllowed = (
  activeCategory: GarmentCategory,
  nextCategory: GarmentCategory,
  selectedTopLength: TopLengthOption | null,
  selectedDressLength: DressLengthOption | null,
  selectedOuterwearLength: OuterwearLengthOption | null,
  completedCategories: GarmentCategory[] = [],
): boolean => {
  if (nextCategory === activeCategory) {
    return true;
  }

  if (completedCategories.includes(nextCategory)) {
    return true;
  }

  if (activeCategory === 'top' && !selectedTopLength) {
    return false;
  }

  if (activeCategory === 'dress' && !selectedDressLength) {
    return false;
  }

  if (activeCategory === 'outerwear' && !selectedOuterwearLength) {
    return false;
  }

  if (activeCategory === 'top') {
    return nextCategory === 'outerwear' || nextCategory === 'bottom' || nextCategory === 'dress';
  }

  if (activeCategory === 'outerwear') {
    return nextCategory === 'bottom';
  }

  if (activeCategory === 'dress') {
    return nextCategory === 'footwear';
  }

  return getNextCategory(activeCategory) === nextCategory;
};

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: 'Üst Giyim',
  outerwear: 'Dış Giyim',
  dress: 'Elbise',
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

export const DRESS_LENGTH_LABELS: Record<DressLengthOption, string> = {
  knee: 'Diz',
  midi: 'Midi',
  maxi: 'Maxi',
  floor: 'Uzun (Floor)',
};

export const OUTERWEAR_LENGTH_LABELS: Record<OuterwearLengthOption, string> = {
  short: 'Kısa (Ceket)',
  medium: 'Orta (Blazer)',
  long: 'Uzun (Mont)',
};
