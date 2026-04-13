import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { WardrobeItem } from '@/lib/kombin/types';
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
    cleanup();
    vi.restoreAllMocks();
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:uploaded-garment'),
    });
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

  it('converts uploaded experimental garments into persistable data urls before staging', async () => {
    const onGarmentSelect = vi.fn();
    const onStageGarment = vi.fn();

    class UploadFileReader {
      public onload: (() => void) | null = null;
      public result: string | null = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,uploaded-garment';
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal('FileReader', UploadFileReader as unknown as typeof FileReader);

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

    const input = document.querySelector('#custom-garment-upload') as HTMLInputElement;
    const file = new File(['upload'], 'upload-top.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onStageGarment).toHaveBeenCalledWith(expect.objectContaining({
        category: 'top',
        source: 'data:image/png;base64,uploaded-garment',
      }));
    });
    expect(onGarmentSelect).not.toHaveBeenCalled();
  });

  it('normalizes blob-backed wardrobe items before staging them in experimental mode', async () => {
    const onStageGarment = vi.fn();

    render(
      <WardrobePanel
        onGarmentSelect={vi.fn()}
        onStageGarment={onStageGarment}
        onPinItem={vi.fn()}
        activeGarmentIds={[]}
        isLoading={false}
        wardrobe={[{ ...wardrobe[0], source: 'user', url: 'blob:http://localhost/uploaded-top' }]}
        activeCategory="top"
        selectionMode="experimental"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Top One' }));

    await waitFor(() => {
      expect(onStageGarment).toHaveBeenCalledWith(expect.objectContaining({
        source: expect.stringContaining('data:image/png;base64,'),
      }));
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

    vi.doMock('@/lib/kombin/services/geminiService', () => ({
      generateModelImage: vi.fn(),
      generatePoseVariation: vi.fn(),
      generateSceneVariation: vi.fn(),
      generateIdentityReferenceImage: vi.fn(),
      generateModelSwapImage: vi.fn(),
      generateVirtualTryOnImage,
    }));

    vi.doMock('@/lib/kombin/services/falService', () => ({
      generateExperimentalOutfitImage,
    }));

    vi.doMock('@/lib/kombin/wardrobe', () => ({ defaultWardrobe: wardrobe }));
    vi.doMock('@/lib/kombin/pinnedWardrobe', () => ({ addPinnedWardrobeItem: vi.fn(), getPinnedWardrobeItems: () => [] }));
    vi.doMock('@/lib/kombin/sessionStorage', () => ({ saveSession: vi.fn(), loadSession: () => null, clearSession: vi.fn() }));
    vi.doMock('@/lib/sessionPersistence', () => ({ saveSessionState: vi.fn(), restoreSessionState: () => null, clearSessionData: vi.fn() }));
    vi.doMock('@/lib/kombin/downloadImage', () => ({ downloadImage: vi.fn() }));

    vi.doMock('@/components/kombin/StartScreen', () => ({
      default: ({ onModelFinalized, onExperimentalStyling }: { onModelFinalized: (url: string) => void; onExperimentalStyling: (url: string) => void }) => (
        <div>
          <button onClick={() => onModelFinalized('https://example.com/model.png')}>standard-entry</button>
          <button onClick={() => onExperimentalStyling('https://example.com/model.png')}>experimental-entry</button>
        </div>
      ),
    }));

    vi.doMock('@/components/kombin/Canvas', () => ({ default: () => <div>canvas</div> }));
    vi.doMock('@/components/kombin/UndoRedoBar', () => ({ default: () => <div>undo-redo</div> }));
    vi.doMock('@/components/kombin/OutfitStack', () => ({ default: () => <div>outfit-stack</div> }));
    vi.doMock('@/components/kombin/CategoryStepPanel', () => ({ default: () => <div>category-panel</div> }));
    vi.doMock('@/components/kombin/ScenePanel', () => ({ default: () => <div>scene-panel</div> }));
    vi.doMock('@/components/kombin/SceneVariationList', () => ({ default: () => <div>scene-variation-list</div> }));
    vi.doMock('@/components/kombin/Footer', () => ({ default: () => <div>footer</div> }));
    vi.doMock('@/components/kombin/Spinner', () => ({ default: () => <div>spinner</div> }));
    vi.doMock('@/components/kombin/ModelSwapPanel', () => ({ default: () => <div>model-swap-panel</div> }));
    vi.doMock('@/components/kombin/WardrobeModal', () => ({
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

    const { default: App } = await import('./KombinEditor');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'experimental-entry' }));
    fireEvent.click(await screen.findByRole('button', { name: 'pick-top-1' }));
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
      expect(screen.getAllByText('Deneysel kombin üretilemedi.').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));

    await waitFor(() => {
      expect(generateExperimentalOutfitImage).toHaveBeenCalledTimes(2);
    });
  });
});
