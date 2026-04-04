import { describe, expect, it } from 'vitest';

import type { WardrobeItem } from '../types';
import { sanitizePersistedWardrobeItems } from './wardrobePersistence';

const item = (overrides: Partial<WardrobeItem> = {}): WardrobeItem => ({
  id: 'item-1',
  name: 'Item',
  url: 'https://example.com/item.png',
  source: 'user',
  ...overrides,
});

describe('wardrobePersistence', () => {
  it('keeps only wardrobe items with restorable urls', () => {
    const items = [
      item({ id: 'remote', url: 'https://example.com/item.png' }),
      item({ id: 'inline', url: 'data:image/png;base64,abc' }),
      item({ id: 'blob', url: 'blob:http://localhost/file' }),
      item({ id: 'placeholder', url: '[image-data]' }),
      item({ id: 'filename-only', url: 'shoe.jpg' }),
      item({ id: 'empty', url: '   ' }),
    ];

    expect(sanitizePersistedWardrobeItems(items).map((entry) => entry.id)).toEqual(['remote', 'inline']);
  });
});
