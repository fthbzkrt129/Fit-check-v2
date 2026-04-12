import type { OutfitLayer, SceneVariation } from '@/lib/kombin/types';

export const getSceneGenerationBaseImage = (
  layer: OutfitLayer | undefined,
  poseInstruction: string,
): string | null => {
  if (!layer) {
    return null;
  }

  return layer.poseImages[poseInstruction] ?? layer.baseSourceImageUrl ?? Object.values(layer.poseImages)[0] ?? null;
};

export const getPoseGenerationBaseImage = (
  selectedSceneVariation: SceneVariation | null,
  layer: OutfitLayer | undefined,
): string | null => {
  if (selectedSceneVariation) {
    return selectedSceneVariation.imageUrl;
  }

  if (!layer) {
    return null;
  }

  return layer.poseSourceImageUrl ?? layer.baseSourceImageUrl ?? Object.values(layer.poseImages)[0] ?? null;
};

export const addSceneVariationWithLimit = (
  existing: SceneVariation[],
  nextVariation: SceneVariation,
  limit: number,
): SceneVariation[] => {
  const sameOutfitVariations = existing
    .filter((variation) => variation.outfitIndex === nextVariation.outfitIndex)
    .concat(nextVariation)
    .sort((left, right) => left.createdAt - right.createdAt)
    .slice(-limit);

  const otherVariations = existing.filter((variation) => variation.outfitIndex !== nextVariation.outfitIndex);

  return [...otherVariations, ...sameOutfitVariations];
};
