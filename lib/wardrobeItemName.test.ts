import { describe, expect, it } from 'vitest';
import { formatWardrobeItemName } from './wardrobeItemName';

describe('formatWardrobeItemName', () => {
  it('removes file extensions and normalizes separators', () => {
    expect(formatWardrobeItemName('is12_check_17745707856.jpg')).toBe('is12 check 17745707856');
  });

  it('truncates very long names to keep wardrobe tiles stable', () => {
    expect(formatWardrobeItemName('very_long_uploaded_product_name_for_tile_layout.png')).toBe('very long uploaded pr...');
  });

  it('falls back when the file name is empty after normalization', () => {
    expect(formatWardrobeItemName('.png')).toBe('Uploaded Item');
  });
});
