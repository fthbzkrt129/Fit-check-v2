import { beforeEach, describe, expect, it, vi } from 'vitest';
import { imageUrlToDataUrl } from './imagePersistence';

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
});
