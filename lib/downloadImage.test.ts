import { describe, expect, it, vi, beforeEach } from 'vitest';
import { downloadImage } from './downloadImage';

describe('downloadImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a temporary anchor and clicks it for a valid image url', async () => {
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: async () => new Blob(['image'], { type: 'image/png' }),
    } as Response);
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback: TimerHandler) => {
      if (typeof callback === 'function') callback();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });

    await downloadImage('https://example.com/look.png', 'look.png');

    expect(fetch).toHaveBeenCalledWith('https://example.com/look.png');
    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('does nothing when image url is missing', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    downloadImage(null, 'look.png');

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
