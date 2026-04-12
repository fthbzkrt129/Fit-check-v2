import { describe, expect, it } from 'vitest';

import type { ExperimentalGarmentSelection } from '@/lib/kombin/types';
import { buildExperimentalBundleInput, buildExperimentalBundlePrompt } from './experimentalBundle';

const selections: ExperimentalGarmentSelection[] = [
  {
    id: 'top-1',
    name: 'Cream Blazer',
    category: 'top',
    source: 'https://example.com/top.png',
  },
  {
    id: 'shoe-1',
    name: 'Brown Boots',
    category: 'footwear',
    source: 'https://example.com/shoes.png',
  },
];

describe('experimentalBundle', () => {
  it('keeps the base model as image 1 and garment refs starting at image 2', () => {
    const bundle = buildExperimentalBundleInput('https://example.com/model.png', selections);

    expect(bundle.imageInputs).toEqual([
      'https://example.com/model.png',
      'https://example.com/top.png',
      'https://example.com/shoes.png',
    ]);
    expect(bundle.garments[0]?.imageIndex).toBe(2);
    expect(bundle.garments[1]?.imageIndex).toBe(3);
  });

  it('deduplicates repeated garment ids so the same piece is uploaded once', () => {
    const duplicatedSelections: ExperimentalGarmentSelection[] = [
      selections[0],
      {
        ...selections[0],
        source: 'https://example.com/duplicate-top.png',
      },
      selections[1],
    ];

    const bundle = buildExperimentalBundleInput('https://example.com/model.png', duplicatedSelections);

    expect(bundle.garments).toHaveLength(2);
    expect(bundle.imageInputs).toEqual([
      'https://example.com/model.png',
      'https://example.com/top.png',
      'https://example.com/shoes.png',
    ]);
  });

  it('builds a balanced try-on prompt that preserves the model anchor and garment fidelity', () => {
    const prompt = buildExperimentalBundlePrompt(selections, 'editorial rooftop at sunset');

    expect(prompt).toContain('Image 1 is the base model photo');
    expect(prompt).toContain('Use image 2 (Cream Blazer) as the exact top garment reference');
    expect(prompt).toContain('Use image 3 (Brown Boots) as the exact footwear garment reference');
    expect(prompt).toContain('Preserve the garment color, fabric appearance, silhouette, proportions, pattern, and visible design details');
    expect(prompt).toContain('Remove or replace any conflicting clothing already visible on the model');
    expect(prompt).toContain('editorial rooftop at sunset');
  });

  it('rejects empty garment selections', () => {
    expect(() => buildExperimentalBundleInput('https://example.com/model.png', [])).toThrow(
      'At least one garment selection is required.',
    );
  });
});
