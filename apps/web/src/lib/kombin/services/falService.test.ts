import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateGptExperimentalOutfitImage, generateGptSceneVariation } from './falService';

const okImageResponse = (imageUrl: string) => ({
  ok: true,
  json: async () => ({ imageUrl }),
});

describe('generateGptExperimentalOutfitImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('sends GPT provider options in the secure experimental request payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okImageResponse('https://example.com/gpt-look.png'));
    const normalizeSource = vi.fn(async (source: unknown) => `data:image/png;base64,${String(source)}`);

    await expect(
      generateGptExperimentalOutfitImage(
        {
          baseModelImage: 'model',
          garmentSelections: [
            {
              id: 'top-1',
              name: 'Top One',
              category: 'top',
              source: 'top',
            },
          ],
        },
        fetchImpl as typeof fetch,
        normalizeSource,
      ),
    ).resolves.toBe('https://example.com/gpt-look.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/experimental', expect.objectContaining({ method: 'POST' }));
    const payload = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(payload).toMatchObject({
      provider: 'gpt-image-2',
      imageSize: { width: 1024, height: 1024 },
      quality: 'high',
      maxQueueStatusPolls: expect.any(Number),
    });
  });
});

describe('generateGptSceneVariation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('delegates scene generation to the secure scene request behavior', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okImageResponse('https://example.com/gpt-scene.png'));
    const normalizeBaseImage = vi.fn().mockResolvedValue('data:image/png;base64,look');

    await expect(
      generateGptSceneVariation(
        'https://example.com/look.png',
        'studio',
        'golden hour',
        'fast',
        undefined,
        fetchImpl as typeof fetch,
        normalizeBaseImage,
      ),
    ).resolves.toBe('https://example.com/gpt-scene.png');

    expect(normalizeBaseImage).toHaveBeenCalledWith('https://example.com/look.png');
    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/scene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        baseImage: 'data:image/png;base64,look',
        scene: 'studio',
        lighting: 'golden hour',
        mode: 'fast',
        customPrompt: undefined,
      }),
    });
  });
});
