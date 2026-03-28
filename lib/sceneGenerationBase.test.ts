import { describe, expect, it } from 'vitest';
import { getPoseGenerationBaseImage, getSceneGenerationBaseImage } from './sceneVariations';
import type { OutfitLayer, SceneVariation } from '../types';

const layer: OutfitLayer = {
  garment: null,
  category: 'base',
  baseSourceImageUrl: 'base-source',
  poseSourceImageUrl: 'visible-source',
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

describe('pose option key consistency', () => {
  it('stores and reads pose images by instruction key', () => {
    expect(layer.poseImages['Full frontal view, hands on hips']).toBe('base-front');
    expect(layer.poseImages['Front Hands on Hips']).toBeUndefined();
  });
});

describe('getSceneGenerationBaseImage', () => {
  it('uses the current pose image from the outfit layer', () => {
    expect(getSceneGenerationBaseImage(layer, 'Walking towards camera')).toBe('base-walk');
  });

  it('falls back to the base source image when current pose is missing', () => {
    expect(getSceneGenerationBaseImage(layer, 'Side profile view')).toBe('base-source');
  });
});

describe('getPoseGenerationBaseImage', () => {
  it('uses the selected scene variation when one is active', () => {
    expect(getPoseGenerationBaseImage(sceneVariation, layer)).toBe('scene-image');
  });

  it('prefers the frozen visible pose source image when no scene is selected', () => {
    expect(getPoseGenerationBaseImage(null, layer)).toBe('visible-source');
  });

  it('falls back to the base source image when no frozen visible pose source exists', () => {
    expect(getPoseGenerationBaseImage(null, { ...layer, poseSourceImageUrl: undefined })).toBe('base-source');
  });
});
