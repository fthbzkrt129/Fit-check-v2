import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureMinimumImageAreaDataUrl, imageUrlToDataUrl } from './imagePersistence';

describe('imageUrlToDataUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a data url unchanged', async () => {
    const dataUrl = 'data:image/png;base64,already-inline';

    await expect(imageUrlToDataUrl(dataUrl)).resolves.toBe(dataUrl);
  });

  it('converts a remote or blob url into a data url', async () => {
    const blob = new Blob(['image-bytes'], { type: 'image/png' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: async () => blob,
    } as Response);

    class MockFileReader {
      result: string | null = null;
      onload: null | (() => void) = null;
      onerror: null | ((error: unknown) => void) = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,converted-image';
        this.onload?.();
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);

    await expect(imageUrlToDataUrl('https://example.com/look.png')).resolves.toBe('data:image/png;base64,converted-image');
  });

  it('upscales image data urls below the minimum area', async () => {
    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      width = 666;
      height = 668;

      set src(_value: string) {
        this.onload?.();
      }
    }

    const drawImage = vi.fn();
    const toDataURL = vi.fn(() => 'data:image/png;base64,upscaled-image');
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toDataURL,
    };
    vi.stubGlobal('Image', MockImage);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);

    await expect(ensureMinimumImageAreaDataUrl('data:image/png;base64,small-image')).resolves.toBe(
      'data:image/png;base64,upscaled-image',
    );

    expect(canvas.width * canvas.height).toBeGreaterThanOrEqual(589824);
    expect(drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, canvas.width, canvas.height);
  });
});
