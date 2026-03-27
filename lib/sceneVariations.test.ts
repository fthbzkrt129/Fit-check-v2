import { describe, expect, it } from 'vitest';
import { addSceneVariationWithLimit } from './sceneVariations';
import type { SceneVariation } from '../types';

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
