import { describe, expect, it } from 'vitest';

import type { ExperimentalGarmentSelection } from '../types';
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

  it('builds a deterministic prompt that references image ordering and the final scene', () => {
    const prompt = buildExperimentalBundlePrompt(selections, 'editorial rooftop at sunset');

    expect(prompt).toContain('image 1');
    expect(prompt).toContain('Take the element from image 2');
    expect(prompt).toContain('Take the element from image 3');
    expect(prompt).toContain('editorial rooftop at sunset');
  });

  it('rejects empty garment selections', () => {
    expect(() => buildExperimentalBundleInput('https://example.com/model.png', [])).toThrow(
      'At least one garment selection is required.',
    );
  });
});
