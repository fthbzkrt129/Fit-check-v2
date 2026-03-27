import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blobUrlToDataUrl } from './imagePersistence';

describe('blobUrlToDataUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('converts a blob url into a data url', async () => {
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

    await expect(blobUrlToDataUrl('blob:http://localhost/example')).resolves.toBe('data:image/png;base64,converted-image');
  });
});
