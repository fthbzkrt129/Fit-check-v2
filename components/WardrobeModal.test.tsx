import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { WardrobeItem } from '../types';
import WardrobePanel from './WardrobeModal';

const wardrobe: WardrobeItem[] = [
  {
    id: 'top-1',
    name: 'Top One',
    url: 'https://example.com/top-1.jpg',
    category: 'top',
    source: 'system',
  },
  {
    id: 'top-2',
    name: 'Top Two',
    url: 'https://example.com/top-2.jpg',
    category: 'top',
    source: 'system',
  },
  {
    id: 'shoe-1',
    name: 'Shoe One',
    url: 'https://example.com/shoe-1.jpg',
    category: 'footwear',
    source: 'system',
  },
];

const originalCreateElement = document.createElement.bind(document);

class MockImage {
  naturalWidth = 512;
  naturalHeight = 512;
  onload: (() => void) | null = null;
  onerror: ((error: string) => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }

  setAttribute() {}
}

describe('WardrobePanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (callback: BlobCallback) => callback?.(new Blob(['mock-image'], { type: 'image/png' })),
        } as unknown as HTMLCanvasElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);
  });

  it('keeps immediate garment application in standard mode', async () => {
    const onGarmentSelect = vi.fn();
    const onStageGarment = vi.fn();

    render(
      <WardrobePanel
        onGarmentSelect={onGarmentSelect}
        onStageGarment={onStageGarment}
        onPinItem={vi.fn()}
        activeGarmentIds={[]}
        isLoading={false}
        wardrobe={wardrobe}
        activeCategory="top"
        selectionMode="standard"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Top One' }));

    await waitFor(() => {
      expect(onGarmentSelect).toHaveBeenCalledTimes(1);
    });
    expect(onStageGarment).not.toHaveBeenCalled();
    expect(onGarmentSelect.mock.calls[0]?.[1]).toMatchObject({ id: 'top-1', category: 'top' });
  });

  it('stages garments instead of calling the standard renderer in experimental mode', async () => {
    const onGarmentSelect = vi.fn();
    const onStageGarment = vi.fn();

    render(
      <WardrobePanel
        onGarmentSelect={onGarmentSelect}
        onStageGarment={onStageGarment}
        onPinItem={vi.fn()}
        activeGarmentIds={[]}
        isLoading={false}
        wardrobe={wardrobe}
        activeCategory="top"
        selectionMode="experimental"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Top One' }));

    await waitFor(() => {
      expect(onStageGarment).toHaveBeenCalledTimes(1);
    });
    expect(onGarmentSelect).not.toHaveBeenCalled();
    expect(onStageGarment.mock.calls[0]?.[0]).toMatchObject({
      id: 'top-1',
      name: 'Top One',
      category: 'top',
    });
  });
});

describe('App experimental styling flow', () => {
  it('submits one bundled fal request, shows retry UI after failure, and blocks duplicate submits while pending', async () => {
    vi.resetModules();

    const generateVirtualTryOnImage = vi.fn().mockResolvedValue('https://example.com/standard-look.png');
    let rejectDeferred: ((reason?: unknown) => void) | undefined;
    const deferred = new Promise<string>((_resolve, reject) => {
      rejectDeferred = reject;
    });
    const generateExperimentalOutfitImage = vi
      .fn<() => Promise<string>>()
      .mockReturnValueOnce(deferred)
      .mockResolvedValueOnce('https://example.com/experimental-look.png');

    vi.doMock('../services/geminiService', () => ({
      generateModelImage: vi.fn(),
      generatePoseVariation: vi.fn(),
      generateSceneVariation: vi.fn(),
      generateVirtualTryOnImage,
    }));

    vi.doMock('../services/falService', () => ({
      getExperimentalFalModel: vi.fn(() => 'wan/v2.6/image-to-image'),
      generateExperimentalOutfitImage,
    }));

    vi.doMock('../wardrobe', () => ({ defaultWardrobe: wardrobe }));
    vi.doMock('../lib/pinnedWardrobe', () => ({ addPinnedWardrobeItem: vi.fn(), getPinnedWardrobeItems: () => [] }));
    vi.doMock('../lib/sessionStorage', () => ({ saveSession: vi.fn(), loadSession: () => null, clearSession: vi.fn() }));
    vi.doMock('../src/lib/sessionPersistence', () => ({ saveSessionState: vi.fn(), restoreSessionState: () => null, clearSessionData: vi.fn() }));
    vi.doMock('../lib/downloadImage', () => ({ downloadImage: vi.fn() }));

    vi.doMock('../components/StartScreen', () => ({
      default: ({ onModelFinalized, onExperimentalStyling }: { onModelFinalized: (url: string) => void; onExperimentalStyling: (url: string) => void }) => (
        <div>
          <button onClick={() => onModelFinalized('https://example.com/model.png')}>standard-entry</button>
          <button onClick={() => onExperimentalStyling('https://example.com/model.png')}>experimental-entry</button>
        </div>
      ),
    }));

    vi.doMock('../components/Canvas', () => ({ default: () => <div>canvas</div> }));
    vi.doMock('../components/UndoRedoBar', () => ({ default: () => <div>undo-redo</div> }));
    vi.doMock('../components/OutfitStack', () => ({ default: () => <div>outfit-stack</div> }));
    vi.doMock('../components/CategoryStepPanel', () => ({ default: () => <div>category-panel</div> }));
    vi.doMock('../components/ScenePanel', () => ({ default: () => <div>scene-panel</div> }));
    vi.doMock('../components/SceneVariationList', () => ({ default: () => <div>scene-variation-list</div> }));
    vi.doMock('../components/Footer', () => ({ default: () => <div>footer</div> }));
    vi.doMock('../components/Spinner', () => ({ default: () => <div>spinner</div> }));
    vi.doMock('../components/WardrobeModal', () => ({
      default: ({ selectionMode, onGarmentSelect, onStageGarment, isLoading }: any) => (
        <div>
          <button
            disabled={isLoading}
            onClick={() =>
              selectionMode === 'experimental'
                ? onStageGarment({
                    id: 'top-1',
                    name: 'Top One',
                    category: 'top',
                    source: new File(['top-1'], 'top-1.png', { type: 'image/png' }),
                  })
                : onGarmentSelect(
                    new File(['top-1'], 'top-1.png', { type: 'image/png' }),
                    wardrobe[0],
                  )
            }
          >
            pick-top-1
          </button>
          <button
            disabled={isLoading}
            onClick={() =>
              selectionMode === 'experimental'
                ? onStageGarment({
                    id: 'top-2',
                    name: 'Top Two',
                    category: 'top',
                    source: new File(['top-2'], 'top-2.png', { type: 'image/png' }),
                  })
                : onGarmentSelect(
                    new File(['top-2'], 'top-2.png', { type: 'image/png' }),
                    wardrobe[1],
                  )
            }
          >
            pick-top-2
          </button>
        </div>
      ),
    }));

    const { default: App } = await import('../App');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'pick-top-2' }));

    const submitButton = screen.getByRole('button', { name: 'Deneysel kombini üret' });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(generateExperimentalOutfitImage).toHaveBeenCalledTimes(1);
    });

    expect(generateVirtualTryOnImage).not.toHaveBeenCalled();
    const firstRequest = (generateExperimentalOutfitImage as any).mock.calls[0]?.[0] as {
      baseModelImage: string;
      garmentSelections: Array<{ id: string; category: string }>;
    };

    expect(firstRequest).toMatchObject({
      baseModelImage: 'https://example.com/model.png',
      garmentSelections: [
        expect.objectContaining({ id: 'top-2', category: 'top' }),
      ],
    });
    expect(screen.getByText('Deneysel kombin hazırlanıyor...')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Deneysel kombini üret' })).toBeDisabled();

    rejectDeferred?.(new Error('fal request failed'));

    await waitFor(() => {
      expect(screen.getByText('Deneysel kombin üretilemedi.')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));

    await waitFor(() => {
      expect(generateExperimentalOutfitImage).toHaveBeenCalledTimes(2);
    });
  });
});
