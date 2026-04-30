import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SessionState } from '@/lib/sessionPersistence';
import type { SessionData } from '@/lib/kombin/sessionStorage';
import type { WardrobeItem } from '@/lib/kombin/types';

const {
  generateVirtualTryOnImageMock,
  generateGptSceneVariationMock,
  generatePoseVariationMock,
  generateIdentityReferenceImageMock,
  generateModelSwapImageMock,
  getPinnedWardrobeItemsMock,
  restoreSessionStateMock,
  loadSessionMock,
  generateExperimentalOutfitImageMock,
  generateGptExperimentalOutfitImageMock,
  canvasLoadingMessages,
} = vi.hoisted(() => ({
  generateVirtualTryOnImageMock: vi.fn(),
  generateGptSceneVariationMock: vi.fn(),
  generatePoseVariationMock: vi.fn(),
  generateIdentityReferenceImageMock: vi.fn(),
  generateModelSwapImageMock: vi.fn(),
  getPinnedWardrobeItemsMock: vi.fn<() => WardrobeItem[]>(() => []),
  restoreSessionStateMock: vi.fn<() => SessionState | null>(() => null),
  loadSessionMock: vi.fn<() => SessionData | null>(() => null),
  generateExperimentalOutfitImageMock: vi.fn(),
  generateGptExperimentalOutfitImageMock: vi.fn(),
  canvasLoadingMessages: [] as string[],
}));

vi.mock('@/lib/kombin/services/geminiService', () => ({
  generateIdentityReferenceImage: (...args: unknown[]) => generateIdentityReferenceImageMock(...args),
  generateModelImage: vi.fn(),
  generateModelSwapImage: (...args: unknown[]) => generateModelSwapImageMock(...args),
  generatePoseVariation: (...args: unknown[]) => generatePoseVariationMock(...args),
  generateVirtualTryOnImage: (...args: unknown[]) => generateVirtualTryOnImageMock(...args),
}));

vi.mock('@/lib/kombin/services/falService', () => ({
  generateExperimentalOutfitImage: (...args: unknown[]) => generateExperimentalOutfitImageMock(...args),
  generateGptExperimentalOutfitImage: (...args: unknown[]) => generateGptExperimentalOutfitImageMock(...args),
  generateGptSceneVariation: (...args: unknown[]) => generateGptSceneVariationMock(...args),
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
  default: ({ displayImageUrl, loadingMessage, onUndo, onRedo, onSelectPose }: { displayImageUrl: string | null; loadingMessage?: string; onUndo: () => void; onRedo: () => void; onSelectPose: (index: number) => void }) => {
    canvasLoadingMessages.push(loadingMessage ?? '');

    return (
      <div>
        <div data-testid="display-image">{displayImageUrl}</div>
        <div data-testid="canvas-loading-message">{loadingMessage ?? ''}</div>
        <button onClick={onUndo}>Geri Al</button>
        <button onClick={onRedo}>Yinele</button>
        <button onClick={() => onSelectPose(1)}>pose-side</button>
      </div>
    );
  },
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
      <div data-testid="scene-variation-count">scene-variation-count {variations.length}</div>
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
      <div data-testid="active-category">active-category {activeCategory}</div>
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
      <div data-testid="wardrobe-count">wardrobe-count {wardrobe.length}</div>
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

const getSidePanelText = () => {
  const sidePanel = document.querySelector('.kombin-side-panel');
  expect(sidePanel).toBeTruthy();

  return sidePanel?.textContent ?? '';
};

const expectTextOrder = (containerText: string, orderedText: string[]) => {
  const indexes = orderedText.map((text) => containerText.indexOf(text));

  indexes.forEach((index) => expect(index).toBeGreaterThanOrEqual(0));

  for (let i = 0; i < indexes.length - 1; i += 1) {
    expect(indexes[i]).toBeLessThan(indexes[i + 1]);
  }
};

describe('KombinEditor', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    getPinnedWardrobeItemsMock.mockReturnValue([]);
    restoreSessionStateMock.mockReturnValue(null);
    loadSessionMock.mockReturnValue(null);
    generateGptSceneVariationMock.mockReset();
    generatePoseVariationMock.mockReset();
    generateIdentityReferenceImageMock.mockReset();
    generateModelSwapImageMock.mockReset();
    generateExperimentalOutfitImageMock.mockReset();
    generateGptExperimentalOutfitImageMock.mockReset();
    canvasLoadingMessages.length = 0;
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

  it('renders core styling sections after the base area in side panel order', async () => {
    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    expectTextOrder(getSidePanelText(), [
      'outfit-stack',
      'active-category',
      'wardrobe-count',
      'select-scene',
      'scene-variation-count',
    ]);
  });

  it('renders the experimental card within the core side panel order', async () => {
    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    expectTextOrder(getSidePanelText(), [
      'outfit-stack',
      'Deneysel mod',
      'active-category',
      'wardrobe-count',
      'select-scene',
      'scene-variation-count',
    ]);
  });

  it('keeps the footer on the start screen but removes it from the dressing screen', async () => {
    render(<KombinEditor />);

    expect(screen.getByText('Created by')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    expect(screen.queryByText('Created by')).toBeNull();
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

  it('uses the single experimental GPT generate action after staging garments', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));

    expect(screen.queryByRole('button', { name: 'Deneysel kombini üret' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'GPT ile üret' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalled());
    expect(generateExperimentalOutfitImageMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/bundle-look.png');
    });

    expect(screen.getByTestId('active-category')).not.toHaveTextContent('bottom');
  });

  it('removes a staged experimental garment before generation', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Top One ürününü sil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => {
      expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateGptExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      garmentSelections: [
        expect.objectContaining({
          id: 'bottom-1',
          category: 'bottom',
        }),
      ],
    });
  });

  it('shows a collapsible experimental panel above the category flow without clearing staged garments', async () => {
    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));

    const experimentalHeading = screen.getByText('Deneysel mod');
    const categoryFlow = screen.getByTestId('active-category');
    expect(Boolean(experimentalHeading.compareDocumentPosition(categoryFlow) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /deneysel modu kapat/i }));

    expect(screen.getByText('1 parça hazır')).toBeInTheDocument();
    expect(screen.queryByText('Top One')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Üret' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /deneysel modu aç/i }));

    expect(screen.getByText('Top One')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Üret' })).toBeEnabled();
  });

  it('generates the staged experimental bundle with GPT Image 2 from the side button', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/gpt-bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => {
      expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateExperimentalOutfitImageMock).not.toHaveBeenCalled();
    expect(generateGptExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      baseModelImage: 'https://example.com/model.png',
      garmentSelections: [expect.objectContaining({ id: 'bottom-1', category: 'bottom' })],
    });
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/gpt-bundle-look.png');
  });

  it('adds staged garment detail instructions before experimental generation', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/detail-bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));
    fireEvent.change(screen.getByLabelText('Bottom One detay talimatı'), {
      target: { value: 'Paçalarında birer cm yırtmaç olsun' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => {
      expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateGptExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      garmentSelections: [
        expect.objectContaining({
          id: 'bottom-1',
          detailInstruction: 'Paçalarında birer cm yırtmaç olsun',
        }),
      ],
    });
  });

  it('forwards the selected scene description into the experimental bundled request', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-scene' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-lighting' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => {
      expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateGptExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      finalSceneDescription: expect.stringContaining('studio'),
    });
  });

  it('uses the base model image as the experimental base image', async () => {
    generateGptExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/bundle-look.png');
    restoreSessionStateMock.mockReturnValue({
      modelImageUrl: 'https://example.com/model.png',
      outfitHistory: [
        {
          garment: null,
          category: 'base',
          baseSourceImageUrl: 'https://example.com/model.png',
          poseImages: { 'Full frontal view, hands on hips': 'https://example.com/model.png' },
        },
        {
          garment: {
            id: 'top-existing',
            name: 'Existing Top',
            url: 'https://example.com/look-top.png',
            category: 'top',
            source: 'user',
          },
          category: 'top',
          poseImages: { 'Full frontal view, hands on hips': 'https://example.com/look-top.png' },
        },
      ],
      currentOutfitIndex: 1,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'bottom',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'experimental',
      stagedExperimentalGarments: [],
    });

    render(<KombinEditor />);

    await screen.findByText('Deneysel mod');
    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    await waitFor(() => {
      expect(generateGptExperimentalOutfitImageMock).toHaveBeenCalledTimes(1);
    });

    expect(generateGptExperimentalOutfitImageMock.mock.calls[0]?.[0]).toMatchObject({
      baseModelImage: 'https://example.com/model.png',
    });
  });

  it('keeps experimental loading stable while rapid status updates arrive', async () => {
    let statusUpdate: ((message: string) => void) | undefined;
    let resolveGeneration: ((url: string) => void) | undefined;
    generateGptExperimentalOutfitImageMock.mockImplementationOnce(
      ({ onStatusUpdate }: { onStatusUpdate?: (message: string) => void }) =>
        new Promise<string>((resolve) => {
          statusUpdate = onStatusUpdate;
          resolveGeneration = resolve;
        }),
    );

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'pick-top' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-bottom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üret' }));

    expect(screen.getByTestId('canvas-loading-message')).toHaveTextContent('Deneysel kombin hazırlanıyor...');

    await act(async () => {
      statusUpdate?.('Uploading garments...');
      statusUpdate?.('Composing outfit...');
      statusUpdate?.('Rendering final look...');
    });

    expect(screen.getByTestId('canvas-loading-message')).toHaveTextContent('Deneysel kombin hazırlanıyor...');
    expect(canvasLoadingMessages).not.toContain('Uploading garments...');
    expect(canvasLoadingMessages).not.toContain('Composing outfit...');

    await waitFor(() => {
      expect(screen.getByTestId('canvas-loading-message')).toHaveTextContent('Rendering final look...');
    });

    await act(async () => {
      resolveGeneration?.('https://example.com/bundle-look.png');
    });

    await waitFor(() => {
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/bundle-look.png');
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
    expect(screen.getByRole('button', { name: 'Üret' })).toBeEnabled();
  });

  it('returns from a generated scene variation back to the current styling image', async () => {
    generateGptSceneVariationMock.mockResolvedValue('https://example.com/scene-look.png');

    render(<KombinEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'start-session' }));
    await screen.findByTestId('display-image');

    fireEvent.click(screen.getByRole('button', { name: 'select-scene' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-lighting' }));
    fireEvent.click(screen.getByRole('button', { name: 'generate-scene' }));

    expect(screen.getByTestId('canvas-loading-message')).toHaveTextContent('Generating GPT scene variation...');

    await waitFor(() => {
      expect(generateGptSceneVariationMock).toHaveBeenCalledWith(expect.any(String), 'studio', 'golden hour', 'fast', undefined);
      expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/scene-look.png');
    });

    fireEvent.click(screen.getByRole('button', { name: 'clear-scene-selection' }));

    expect(screen.getByTestId('selected-scene-variation')).toHaveTextContent('none');
    expect(screen.getByTestId('display-image')).toHaveTextContent('https://example.com/model.png');
  });

  it('uses the selected scene variation as the source when creating a new pose', async () => {
    generateGptSceneVariationMock.mockResolvedValue('https://example.com/scene-look.png');
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
