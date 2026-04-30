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
  _activeCategory: GarmentCategory,
  _nextCategory: GarmentCategory,
  _selectedTopLength: TopLengthOption | null,
  _selectedDressLength: DressLengthOption | null,
  _selectedOuterwearLength: OuterwearLengthOption | null,
  _completedCategories: GarmentCategory[] = [],
): boolean => {
  return true;
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
