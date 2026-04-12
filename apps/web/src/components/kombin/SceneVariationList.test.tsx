import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SceneVariationList from './SceneVariationList';
import type { SceneVariation } from '@/lib/kombin/types';

const variations: SceneVariation[] = [
  {
    id: 'scene-1',
    outfitIndex: 1,
    scene: 'street' as const,
    lighting: 'golden hour' as const,
    imageUrl: 'https://example.com/scene-1.jpg',
    sourcePose: 'Full frontal view, hands on hips',
    createdAt: 1,
  },
  {
    id: 'scene-2',
    outfitIndex: 1,
    scene: 'studio' as const,
    lighting: 'editorial' as const,
    imageUrl: 'https://example.com/scene-2.jpg',
    sourcePose: 'Full frontal view, hands on hips',
    createdAt: 2,
  },
];

describe('SceneVariationList', () => {
  it('renders previews and allows selecting a variation', () => {
    const onSelectVariation = vi.fn();

    render(
      <SceneVariationList
        variations={variations}
        selectedVariationId="scene-1"
        onSelectVariation={onSelectVariation}
        isLoading={false}
      />
    );

    expect(screen.getByText('Street')).toBeInTheDocument();
    expect(screen.getByText('Golden Hour')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Editorial')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Studio Editorial/i }));
    expect(onSelectVariation).toHaveBeenCalledWith('scene-2');
  });
});
