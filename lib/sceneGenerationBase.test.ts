import { describe, expect, it } from 'vitest';
import { getPoseGenerationBaseImage, getSceneGenerationBaseImage } from './sceneVariations';
import type { OutfitLayer, SceneVariation } from '../types';

const layer: OutfitLayer = {
  garment: null,
  category: 'base',
  poseImages: {
    'Full frontal view, hands on hips': 'base-front',
    'Walking towards camera': 'base-walk',
  },
};

const sceneVariation: SceneVariation = {
  id: 'scene-1',
  outfitIndex: 0,
  scene: 'luxury room',
  lighting: 'golden hour',
  imageUrl: 'scene-image',
  sourcePose: 'Full frontal view, hands on hips',
  createdAt: 1,
};

describe('getSceneGenerationBaseImage', () => {
  it('uses the current pose image from the outfit layer', () => {
    expect(getSceneGenerationBaseImage(layer, 'Walking towards camera')).toBe('base-walk');
  });

  it('falls back to the first available pose image when current pose is missing', () => {
    expect(getSceneGenerationBaseImage(layer, 'Side profile view')).toBe('base-front');
  });
});

describe('getPoseGenerationBaseImage', () => {
  it('uses the selected scene variation when one is active', () => {
    expect(getPoseGenerationBaseImage(sceneVariation, layer)).toBe('scene-image');
  });

  it('falls back to the first outfit pose image when no scene is selected', () => {
    expect(getPoseGenerationBaseImage(null, layer)).toBe('base-front');
  });
});
