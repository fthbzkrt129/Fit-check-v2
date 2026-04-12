import type { GarmentCategory, TopLengthOption, DressLengthOption, OuterwearLengthOption } from '@/lib/kombin/types';

const CATEGORY_ORDER: GarmentCategory[] = ['top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory'];

export const getNextCategory = (category: GarmentCategory): GarmentCategory => {
  const currentIndex = CATEGORY_ORDER.indexOf(category);
  return CATEGORY_ORDER[Math.min(currentIndex + 1, CATEGORY_ORDER.length - 1)];
};

export const isCategorySelectionAllowed = (
  activeCategory: GarmentCategory,
  nextCategory: GarmentCategory,
  selectedTopLength: TopLengthOption | null,
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
