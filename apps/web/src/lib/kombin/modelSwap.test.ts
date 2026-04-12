import { describe, expect, it } from 'vitest';
import { getModelSwapReferenceImage } from './modelSwap';
import type { OutfitLayer } from '@/lib/kombin/types';

describe('getModelSwapReferenceImage', () => {
  const layer: OutfitLayer = {
    garment: null,
    category: 'base',
    baseSourceImageUrl: 'base-look',
    poseSourceImageUrl: 'stable-look',
    poseImages: {
      Front: 'front-look',
      Side: 'side-look',
    },
  };

  it('prefers a stable pose source over current pose output', () => {
    expect(getModelSwapReferenceImage(layer)).toBe('stable-look');
  });

  it('falls back to base source and then visible pose image', () => {
    expect(getModelSwapReferenceImage({ ...layer, poseSourceImageUrl: undefined })).toBe('base-look');
    expect(getModelSwapReferenceImage({ ...layer, poseSourceImageUrl: undefined, baseSourceImageUrl: undefined })).toBe('front-look');
  });
});
