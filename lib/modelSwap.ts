import type { OutfitLayer } from '../types';

export const getModelSwapReferenceImage = (layer: OutfitLayer | undefined): string | null => {
  if (!layer) {
    return null;
  }

  return layer.poseSourceImageUrl ?? layer.baseSourceImageUrl ?? Object.values(layer.poseImages)[0] ?? null;
};
