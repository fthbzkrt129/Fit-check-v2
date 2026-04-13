import { describe, expect, it } from 'vitest';
import { addSceneVariationWithLimit, getPoseGenerationBaseImage, getSceneGenerationBaseImage } from './sceneVariations';
import type { OutfitLayer, SceneVariation } from '@/lib/kombin/types';

const createVariation = (id: string, outfitIndex: number, createdAt: number): SceneVariation => ({
  id,
  outfitIndex,
  scene: 'studio',
  lighting: 'soft daylight',
  imageUrl: `https://example.com/${id}.jpg`,
  sourcePose: 'Full frontal view, hands on hips',
  createdAt,
});

describe('addSceneVariationWithLimit', () => {
  it('keeps only the latest three variations for the same outfit', () => {
    const existing = [
      createVariation('scene-1', 2, 1),
      createVariation('scene-2', 2, 2),
      createVariation('scene-3', 2, 3),
      createVariation('other-outfit', 1, 1),
    ];

    const updated = addSceneVariationWithLimit(existing, createVariation('scene-4', 2, 4), 3);

    expect(updated.filter((variation) => variation.outfitIndex === 2).map((variation) => variation.id)).toEqual([
      'scene-2',
      'scene-3',
      'scene-4',
    ]);
    expect(updated.find((variation) => variation.id === 'other-outfit')).toBeDefined();
  });
});

describe('getPoseGenerationBaseImage', () => {
  const layer: OutfitLayer = {
    garment: null,
    category: 'base',
    baseSourceImageUrl: 'base-look',
    poseSourceImageUrl: 'frozen-look',
    poseImages: {
      Front: 'front-look',
    },
  };

  it('prefers the selected scene variation so pose changes follow the active scene image', () => {
    expect(
      getPoseGenerationBaseImage(
        {
          ...createVariation('scene-active', 0, 1),
          imageUrl: 'scene-look',
        },
        layer,
      ),
    ).toBe('scene-look');
  });

  it('falls back to the frozen pose source, then base source, then any pose image', () => {
    expect(getPoseGenerationBaseImage(null, layer)).toBe('frozen-look');
    expect(getPoseGenerationBaseImage(null, { ...layer, poseSourceImageUrl: undefined })).toBe('base-look');
    expect(
      getPoseGenerationBaseImage(null, {
        ...layer,
        poseSourceImageUrl: undefined,
        baseSourceImageUrl: undefined,
      }),
    ).toBe('front-look');
  });
});

describe('getSceneGenerationBaseImage', () => {
  it('prefers the current pose image for scene generation and falls back safely', () => {
    const layer: OutfitLayer = {
      garment: null,
      category: 'base',
      baseSourceImageUrl: 'base-look',
      poseImages: {
        Front: 'front-look',
        Side: 'side-look',
      },
    };

    expect(getSceneGenerationBaseImage(layer, 'Side')).toBe('side-look');
    expect(getSceneGenerationBaseImage(layer, 'Missing')).toBe('base-look');
    expect(getSceneGenerationBaseImage({ ...layer, baseSourceImageUrl: undefined }, 'Missing')).toBe('front-look');
  });
});
