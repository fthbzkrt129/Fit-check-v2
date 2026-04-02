import { describe, expect, it } from 'vitest';
import { formatWardrobeItemName } from './wardrobeItemName';

describe('formatWardrobeItemName', () => {
  it('removes file extensions and normalizes separators', () => {
    expect(formatWardrobeItemName('is12_check_17745707856.jpg')).toBe('is12 check 17745707856');
  });

  it('falls back for generated internal file names', () => {
    expect(formatWardrobeItemName('unnamed.jpg', 'top')).toBe('Uploaded Top');
    expect(formatWardrobeItemName('fit-check-1774996900.png', 'bottom')).toBe('Uploaded Bottom');
    expect(formatWardrobeItemName('Gemini_Generated_Image.jpeg', 'accessory')).toBe('Uploaded Accessory');
  });

  it('truncates very long names to keep wardrobe tiles stable', () => {
    expect(formatWardrobeItemName('very_long_uploaded_product_name_for_tile_layout.png')).toBe('very long uploaded pr...');
  });

  it('falls back when the file name is empty after normalization', () => {
    expect(formatWardrobeItemName('.png')).toBe('Uploaded Item');
  });
});
