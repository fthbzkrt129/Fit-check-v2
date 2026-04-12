import { describe, expect, it } from 'vitest';
import { getNextCategory, isCategorySelectionAllowed } from './outfitFlow';

describe('outfitFlow', () => {
  it('allows switching freely between categories regardless of top length', () => {
    expect(isCategorySelectionAllowed('top', 'bottom', null)).toBe(true);
    expect(isCategorySelectionAllowed('top', 'accessory', null)).toBe(true);
    expect(isCategorySelectionAllowed('bottom', 'top', null)).toBe(true);
  });

  it('still returns the next category helper values for existing flows', () => {
    expect(getNextCategory('top')).toBe('outerwear');
    expect(getNextCategory('bottom')).toBe('footwear');
  });

  it('continues from footwear to accessory as the final step', () => {
    expect(getNextCategory('footwear')).toBe('accessory');
    expect(getNextCategory('accessory')).toBe('accessory');
  });
});
