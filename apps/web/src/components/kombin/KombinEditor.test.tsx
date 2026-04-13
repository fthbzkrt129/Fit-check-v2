import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SessionState } from '@/lib/sessionPersistence';
import type { SessionData } from '@/lib/kombin/sessionStorage';
import type { WardrobeItem } from '@/lib/kombin/types';

const {
  generateVirtualTryOnImageMock,
  generateSceneVariationMock,
  generatePoseVariationMock,
  generateIdentityReferenceImageMock,
  generateModelSwapImageMock,
  getPinnedWardrobeItemsMock,
  restoreSessionStateMock,
  loadSessionMock,
  generateExperimentalOutfitImageMock,
} = vi.hoisted(() => ({
  generateVirtualTryOnImageMock: vi.fn(),
  generateSceneVariationMock: vi.fn(),
  generatePoseVariationMock: vi.fn(),
  generateIdentityReferenceImageMock: vi.fn(),
  generateModelSwapImageMock: vi.fn(),
  getPinnedWardrobeItemsMock: vi.fn<() => WardrobeItem[]>(() => []),
  restoreSessionStateMock: vi.fn<() => SessionState | null>(() => null),
  loadSessionMock: vi.fn<() => SessionData | null>(() => null),
  generateExperimentalOutfitImageMock: vi.fn(),
}));

vi.mock('@/lib/kombin/services/geminiService', () => ({
  generateIdentityReferenceImage: (...args: unknown[]) => generateIdentityReferenceImageMock(...args),
  generateModelImage: vi.fn(),
  generateModelSwapImage: (...args: unknown[]) => generateModelSwapImageMock(...args),
  generatePoseVariation: (...args: unknown[]) => generatePoseVariationMock(...args),
  generateSceneVariation: (...args: unknown[]) => generateSceneVariationMock(...args),
  generateVirtualTryOnImage: (...args: unknown[]) => generateVirtualTryOnImageMock(...args),
}));

vi.mock('@/lib/kombin/services/falService', () => ({
  generateExperimentalOutfitImage: (...args: unknown[]) => generateExperimentalOutfitImageMock(...args),
}));

vi.mock('@/lib/kombin/wardrobe', () => ({ defaultWardrobe: [] }));
vi.mock('@/lib/kombin/pinnedWardrobe', () => ({ addPinnedWardrobeItem: vi.fn(), getPinnedWardrobeItems: () => getPinnedWardrobeItemsMock() }));
vi.mock('@/lib/kombin/sessionStorage', () => ({ saveSession: vi.fn(), loadSession: () => loadSessionMock(), clearSession: vi.fn() }));
vi.mock('@/lib/sessionPersistence', () => ({ saveSessionState: vi.fn(), restoreSessionState: () => restoreSessionStateMock(), clearSessionData: vi.fn() }));
vi.mock('@/lib/kombin/downloadImage', () => ({ downloadImage: vi.fn() }));
vi.mock('@/lib/kombin/imagePersistence', () => ({ blobUrlToDataUrl: vi.fn(), imageUrlToDataUrl: vi.fn(async (value: string) => value) }));

vi.mock('@/components/kombin/StartScreen', () => ({
  default: ({ onModelFinalized, onExperimentalStyling }: { onModelFinalized: (url: string, mode?: 'styling' | 'modelSwap') => void; onExperimentalStyling: (url: string) => void }) => (
    <div>
      <button onClick={() => onModelFinalized('https://example.com/model.png', 'styling')}>start-session</button>
      <button onClick={() => onModelFinalized('https://example.com/model.png', 'modelSwap')}>start-session-model-swap</button>
      <button onClick={() => onExperimentalStyling('https://example.com/model.png')}>experimental-entry</button>
    </div>
  ),
}));

vi.mock('@/components/kombin/Canvas', () => ({
  default: ({ displayImageUrl, onUndo, onRedo, onSelectPose }: { displayImageUrl: string | null; onUndo: () => void; onRedo: () => void; onSelectPose: (index: number) => void }) => (
    <div>
      <div data-testid="display-image">{displayImageUrl}</div>
      <button onClick={onUndo}>Geri Al</button>
      <button onClick={onRedo}>Yinele</button>
      <button onClick={() => onSelectPose(1)}>pose-side</button>
    </div>
  ),
}));

vi.mock('@/components/kombin/UndoRedoBar', () => ({ default: () => null }));
vi.mock('@/components/kombin/OutfitStack', () => ({ default: () => <div>outfit-stack</div> }));
vi.mock('@/components/kombin/ScenePanel', () => ({
  default: ({ onSelectScene, onSelectLighting, onGenerate }: any) => (
    <div>
      <button onClick={() => onSelectScene('studio')}>select-scene</button>
      <button onClick={() => onSelectLighting('golden hour')}>select-lighting</button>
      <button onClick={onGenerate}>generate-scene</button>
    </div>
  ),
}));
vi.mock('@/components/kombin/SceneVariationList', () => ({
  default: ({ variations, selectedVariationId, onSelectVariation }: any) => (
    <div>
      <div data-testid="scene-variation-count">{variations.length}</div>
      <div data-testid="selected-scene-variation">{selectedVariationId ?? 'none'}</div>
      {variations.map((variation: { id: string }) => (
        <button key={variation.id} onClick={() => onSelectVariation(variation.id)}>
          {variation.id}
        </button>
      ))}
      <button onClick={() => onSelectVariation(null)}>clear-scene-selection</button>
    </div>
  ),
}));
vi.mock('@/components/kombin/Footer', () => ({ default: () => <div>footer</div> }));
vi.mock('@/components/kombin/Spinner', () => ({ default: () => <div>spinner</div> }));
vi.mock('@/components/kombin/ModelSwapPanel', () => ({
  default: ({ onSelectFile, onApply }: any) => (
    <div>
      <button onClick={() => onSelectFile(new File(['swap'], 'swap.png', { type: 'image/png' }))}>select-model-swap-file</button>
      <button onClick={onApply}>apply-model-swap</button>
    </div>
  ),
}));

vi.mock('@/components/kombin/CategoryStepPanel', () => ({
  default: ({ activeCategory, selectedTopLength, selectedDressLength, selectedOuterwearLength, onSelectTopLength }: any) => (
    <div>
      <div data-testid="active-category">{activeCategory}</div>
      <div data-testid="selected-top-length">{selectedTopLength ?? 'none'}</div>
      <div data-testid="selected-dress-length">{selectedDressLength ?? 'none'}</div>
      <div data-testid="selected-outerwear-length">{selectedOuterwearLength ?? 'none'}</div>
      <button onClick={() => onSelectTopLength('hip')}>select-top-length</button>
      <button onClick={() => onSelectTopLength('crop')}>select-top-length-crop</button>
    </div>
  ),
}));

vi.mock('@/components/kombin/WardrobeModal', () => ({
  default: ({ onGarmentSelect, onStageGarment, wardrobe, selectionMode }: any) => (
    <div>
      <div data-testid="wardrobe-count">{wardrobe.length}</div>
      <button
        onClick={() =>
          selectionMode === 'experimental'
            ? onStageGarment({
                id: 'top-1',
                name: 'Top One',
                category: 'top',
                source: 'https://example.com/top.png',
              })
            : onGarmentSelect(
                new File(['top'], 'top.png', { type: 'image/png' }),
                {
                  id: 'top-1',
                  name: 'Top One',
                  url: 'https://example.com/top.png',
                  category: 'top',
                  source: 'system',
                },
              )
        }
      >
        pick-top
      </button>
      <button
        onClick={() =>
          onStageGarment({
            id: 'bottom-1',
            name: 'Bottom One',
            category: 'bottom',
            source: 'https://example.com/bottom.png',
          })
        }
      >
        pick-bottom
      </button>
    </div>
  ),
}));

import KombinEditor from './KombinEditor';

describe('KombinEditor', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    getPinnedWardrobeItemsMock.mockReturnValue([]);
    restoreSessionStateMock.mockReturnValue(null);
    loadSessionMock.mockReturnValue(null);
    generateSceneVariationMock.mockReset();
    generatePoseVariationMock.mockReset();
    generateIdentityReferenceImageMock.mockReset();
    generateModelSwapImageMock.mockReset();
    generateExperimentalOutfitImageMock.mockReset();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:preview-model-swap'),
    });
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('advances the category flow, updates the current image, and keeps redo parity after undo', async () => {
    generateVirtualTryOnImageMock.mockResolvedValue('https://example.com/look-top.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    expect(await screen.findByTestId('display-image')).toHaveTextContent('https://example.com/model.png');

    fireEvent.click(screen.getByRole('button', { name: 'select-top-length' }));
    expect(screen.getByTestId('selected-top-length')).toHaveTextContent('hip');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    await waitFor(() => {
      expect(generateVirtualTryOnImageMock).toHaveBeenCalledWith(
        'https://example.com/model.png',
        expect.any(File),
        'top',
        'hip',
        null,
        null,
      );
    });

    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/look-top.png');
    expect(screen.getByTestId('active-category')).toHaveTextContent('bottom');
    expect(screen.getByTestId('selected-top-length')).toHaveTextContent('none');

    fireEvent.click(screen.getByRole('button', { name: 'Geri Al' }));
    expect(screen.getByTestId('active-category')).toHaveTextContent('top');
    expect(screen.getByTestId('selected-top-length')).toHaveTextContent('hip');
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/model.png');

    fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/look-top.png');
    expect(screen.getByTestId('active-category')).toHaveTextContent('bottom');
  });

  it('re-runs try-on when the same garment is selected with a different top length after undo', async () => {
    generateVirtualTryOnImageMock
      .mockResolvedValueOnce('https://example.com/look-top-hip.png')
      .mockResolvedValueOnce('https://example.com/look-top-crop.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-top-length' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    await waitFor(() => {
      expect(generateVirtualTryOnImageMock).toHaveBeenNthCalledWith(
        1,
        'https://example.com/model.png',
        expect.any(File),
        'top',
        'hip',
        null,
        null,
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Geri Al' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-top-length-crop' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    await waitFor(() => {
      expect(generateVirtualTryOnImageMock).toHaveBeenNthCalledWith(
        2,
        'https://example.com/model.png',
        expect.any(File),
        'top',
        'crop',
        null,
        null,
      );
    });

    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/look-top-crop.png');
  });

  it('advances the flow without a new request when reusing the same garment with the same length after undo', async () => {
    generateVirtualTryOnImageMock.mockResolvedValueOnce('https://example.com/look-top-hip.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-top-length' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    await waitFor(() => {
      expect(generateVirtualTryOnImageMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Geri Al' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/look-top-hip.png');
    });

    expect(generateVirtualTryOnImageMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('active-category')).toHaveTextContent('bottom');
    expect(screen.getByTestId('selected-top-length')).toHaveTextContent('none');
  });

  it('deduplicates pinned wardrobe items when both pinned storage and restored session contain the same item', async () => {
    const pinnedItem: WardrobeItem = {
      id: 'pinned-1',
      name: 'Pinned Jacket',
      url: 'https://example.com/jacket.png',
      category: 'outerwear',
      source: 'user',
      isPinned: true,
    };

    getPinnedWardrobeItemsMock.mockReturnValue([pinnedItem]);
    restoreSessionStateMock.mockReturnValue({
      modelImageUrl: 'https://example.com/model.png',
      outfitHistory: [],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [pinnedItem],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'standard',
      stagedExperimentalGarments: [],
    });

    render(<KombinEditor />);

    await waitFor(() => {
      expect(screen.getByTestId('wardrobe-count')).toHaveTextContent('1');
    });
  });

  it('marks all bundled categories as completed after an experimental generation', async () => {
    generateExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));
    fireEvent.click(screen.getByRole('button', { name: /deneysel kombini üret/i }));

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/bundle-look.png');
    });

    expect(screen.getByTestId('active-category')).not.toHaveTextContent('bottom');
  });

  it('forwards the selected scene description into the experimental bundled request', async () => {
    generateExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-scene' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-lighting' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: /deneysel kombini üret/i }));

    await waitFor(() => {
      expect(generateExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      finalSceneDescription: expect.stringContaining('studio'),
    });
  });

  it('restores experimental staged garments from persisted session state', async () => {
    restoreSessionStateMock.mockReturnValue({
      modelImageUrl: 'https://example.com/model.png',
      outfitHistory: [
        {
          garment: null,
          category: 'base',
          poseImages: { front: 'https://example.com/model.png' },
        },
      ],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'experimental',
      stagedExperimentalGarments: [
        {
          id: 'top-1',
          name: 'Top One',
          category: 'top',
          source: 'data:image/png;base64,top',
        },
      ],
    });

    render(<KombinEditor />);

    await waitFor(() => {
      expect(screen.getByText('1 parça hazır')).toBeTruthy();
    });
    expect(screen.getByText('Top One')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Deneysel kombini üret' })).toBeEnabled();
  });

  it('returns from a generated scene variation back to the current styling image', async () => {
    generateSceneVariationMock.mockResolvedValue('https://example.com/scene-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-scene' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-lighting' }));
    fireEvent.click(screen.getByRole('button', { name: 'generate-scene' }));

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/scene-look.png');
    });

    fireEvent.click(screen.getByRole('button', { name: 'clear-scene-selection' }));

    expect(screen.getByTestId('selected-scene-variation')).toHaveTextContent('none');
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/model.png');
  });

  it('uses the selected scene variation as the source when creating a new pose', async () => {
    generateSceneVariationMock.mockResolvedValue('https://example.com/scene-look.png');
    generatePoseVariationMock.mockResolvedValue('https://example.com/scene-side-pose.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-scene' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-lighting' }));
    fireEvent.click(screen.getByRole('button', { name: 'generate-scene' }));

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/scene-look.png');
    });

    fireEvent.click(screen.getByRole('button', { name: 'pose-side' }));

    await waitFor(() => {
      expect(generatePoseVariationMock).toHaveBeenCalledWith(
        'https://example.com/scene-look.png',
        expect.any(String),
      );
    });
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/scene-side-pose.png');
  });

  it('returns to styling with the swapped model image after secure model swap completes', async () => {
    generateIdentityReferenceImageMock.mockResolvedValue('https://example.com/identity-reference.png');
    generateModelSwapImageMock.mockResolvedValue('https://example.com/swapped-model.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session-model-swap' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-model-swap-file' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-model-swap' }));

    await waitFor(() => {
      expect(generateIdentityReferenceImageMock).toHaveBeenCalledTimes(1);
      expect(generateModelSwapImageMock).toHaveBeenCalledWith(
        'https://example.com/model.png',
        'https://example.com/identity-reference.png',
      );
    });

    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/swapped-model.png');
  });

});
