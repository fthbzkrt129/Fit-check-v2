import { describe, expect, it } from 'vitest';
import { getNextCategory, isCategorySelectionAllowed } from './outfitFlow';

describe('outfitFlow', () => {
  it('blocks forward progress from top until a top length is chosen', () => {
    expect(isCategorySelectionAllowed('top', 'outerwear', null, null, null, [])).toBe(false);
    expect(isCategorySelectionAllowed('top', 'bottom', null, null, null, [])).toBe(false);
  });

  it('blocks forward progress from outerwear and dress until their lengths are chosen', () => {
    expect(isCategorySelectionAllowed('outerwear', 'bottom', 'hip', null, null, ['top'])).toBe(false);
    expect(isCategorySelectionAllowed('dress', 'footwear', 'hip', null, null, ['top'])).toBe(false);
    expect(isCategorySelectionAllowed('outerwear', 'bottom', 'hip', null, 'short', ['top'])).toBe(true);
    expect(isCategorySelectionAllowed('dress', 'footwear', 'hip', 'midi', null, ['top'])).toBe(true);
  });

  it('unlocks valid next categories for two-piece and dress flows', () => {
    expect(isCategorySelectionAllowed('top', 'outerwear', 'hip', null, null, [])).toBe(true);
    expect(isCategorySelectionAllowed('top', 'bottom', 'hip', null, null, [])).toBe(true);
    expect(isCategorySelectionAllowed('top', 'dress', 'hip', null, null, [])).toBe(true);
    expect(isCategorySelectionAllowed('bottom', 'footwear', 'hip', null, null, ['top', 'bottom'])).toBe(true);
  });

  it('allows revisiting already completed categories without reopening future steps', () => {
    expect(isCategorySelectionAllowed('bottom', 'top', 'hip', null, null, ['top', 'outerwear', 'dress', 'bottom'])).toBe(true);
    expect(isCategorySelectionAllowed('bottom', 'accessory', 'hip', null, null, ['top', 'outerwear', 'dress', 'bottom'])).toBe(false);
  });

  it('still returns the next category helper values for existing flows', () => {
    expect(getNextCategory('top')).toBe('bottom');
    expect(getNextCategory('outerwear')).toBe('bottom');
    expect(getNextCategory('dress')).toBe('footwear');
    expect(getNextCategory('bottom')).toBe('footwear');
  });

  it('continues from footwear to accessory as the final step', () => {
    expect(getNextCategory('footwear')).toBe('accessory');
    expect(getNextCategory('accessory')).toBe('accessory');
  });
});
