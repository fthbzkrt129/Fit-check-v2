import { describe, expect, it } from 'vitest';
import { getNextCategory, isCategorySelectionAllowed } from './outfitFlow';

describe('outfitFlow', () => {
  it('requires top length before leaving top category', () => {
    expect(isCategorySelectionAllowed('top', 'bottom', null)).toBe(false);
    expect(isCategorySelectionAllowed('top', 'bottom', 'hip')).toBe(true);
  });

  it('advances from top to bottom after top garment is added', () => {
    expect(getNextCategory('top')).toBe('bottom');
    expect(getNextCategory('bottom')).toBe('footwear');
  });

  it('continues from footwear to accessory as the final step', () => {
    expect(getNextCategory('footwear')).toBe('accessory');
    expect(getNextCategory('accessory')).toBe('accessory');
  });
});
