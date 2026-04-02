import { describe, expect, it } from 'vitest';

const wardrobe = [
  { id: 'top-1', name: 'Top Item', url: 'https://example.com/top.jpg', category: 'top' as const, source: 'system' as const },
  { id: 'shoe-1', name: 'Shoe Item', url: 'https://example.com/shoe.jpg', category: 'footwear' as const, source: 'system' as const },
  { id: 'user-uncategorized', name: 'Uploaded Item', url: 'blob:user-item', source: 'user' as const },
];

const getVisibleWardrobe = (items: typeof wardrobe, activeCategory: 'top' | 'bottom' | 'footwear' | 'accessory') =>
  items.filter((item) => item.category === activeCategory);

describe('WardrobePanel filtering', () => {
  it('shows only active category items', () => {
    const visibleWardrobe = getVisibleWardrobe(wardrobe, 'footwear');

    expect(visibleWardrobe).toHaveLength(1);
    expect(visibleWardrobe[0].name).toBe('Shoe Item');
  });

  it('does not show uncategorized uploaded items in every step', () => {
    const visibleWardrobe = getVisibleWardrobe(wardrobe, 'top');

    expect(visibleWardrobe).toHaveLength(1);
    expect(visibleWardrobe[0].id).toBe('top-1');
  });
});
