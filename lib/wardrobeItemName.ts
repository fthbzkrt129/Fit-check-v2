import type { GarmentCategory } from '../types';

const uploadFallbackLabels: Record<GarmentCategory, string> = {
  top: 'Uploaded Top',
  bottom: 'Uploaded Bottom',
  outerwear: 'Uploaded Outerwear',
  dress: 'Uploaded Dress',
  footwear: 'Uploaded Footwear',
  accessory: 'Uploaded Accessory',
};

const looksGenerated = (normalizedName: string): boolean => {
  const compactName = normalizedName.toLowerCase();

  return compactName === 'unnamed'
    || compactName.startsWith('fit check ')
    || compactName.startsWith('gemini generated')
    || compactName.startsWith('screenshot ')
    || /^[a-z]{2,}\\d+(?:\\s+[a-z0-9]+)*$/i.test(normalizedName);
};

export const formatWardrobeItemName = (fileName: string, category?: GarmentCategory): string => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  const normalized = withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return category ? uploadFallbackLabels[category] : 'Uploaded Item';
  }

  if (looksGenerated(normalized)) {
    return category ? uploadFallbackLabels[category] : 'Uploaded Item';
  }

  if (normalized.length <= 24) {
    return normalized;
  }

  return `${normalized.slice(0, 21).trimEnd()}...`;
};
