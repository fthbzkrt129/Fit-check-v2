import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({ falKey: 'test-fal-key' }),
}));

import { generateExperimentalOutfitImage, generateGptSceneVariation } from './falServer';

describe('falServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the GPT Image 2 edit endpoint when provider is gpt-image-2', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ images: [{ url: 'https://example.com/gpt-look.png' }] }),
    });

    await expect(
      generateExperimentalOutfitImage(
        {
          provider: 'gpt-image-2',
          prompt: 'create a look',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          imageSize: { width: 1024, height: 1024 },
          quality: 'high',
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/gpt-look.png');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://queue.fal.run/openai/gpt-image-2/edit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'create a look',
          image_urls: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          image_size: { width: 1024, height: 1024 },
          quality: 'high',
          num_images: 1,
          output_format: 'png',
        }),
      }),
    );
  });

  it('defaults missing provider to the GPT Image 2 edit endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ images: [{ url: 'https://example.com/default-gpt-look.png' }] }),
    });

    await expect(
      generateExperimentalOutfitImage(
        {
          prompt: 'create a look',
          imageInputs: ['data:image/png;base64,model'],
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/default-gpt-look.png');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://queue.fal.run/openai/gpt-image-2/edit',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body).toMatchObject({
      prompt: 'create a look',
      image_urls: ['data:image/png;base64,model'],
      quality: 'low',
      output_format: 'png',
    });
  });

  it('generates scene variations through the GPT edit endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ images: [{ url: 'https://example.com/gpt-scene.png' }] }),
    });

    await expect(
      generateGptSceneVariation(
        'data:image/png;base64,look',
        'studio',
        'golden hour',
        'fast',
        undefined,
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/gpt-scene.png');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://queue.fal.run/openai/gpt-image-2/edit',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body.prompt).toContain('fashion editorial photographer');
    expect(body.image_urls).toEqual(['data:image/png;base64,look']);
  });
});
