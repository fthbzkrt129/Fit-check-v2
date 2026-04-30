import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __private__, generateExperimentalOutfitImage, generateGptExperimentalOutfitImage, generateGptSceneVariation } from './services/falService';

describe('falService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('posts bundled experimental payloads only to the secure experimental route', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/generated-look.png' }),
    });
    const normalizeImageSource = vi
      .fn()
      .mockResolvedValueOnce('data:image/png;base64,model')
      .mockResolvedValueOnce('data:image/png;base64,top');

    await expect(
      generateExperimentalOutfitImage(
        {
          baseModelImage: 'https://example.com/model.png',
          garmentSelections: [
            {
              id: 'top-1',
              name: 'Cream Blazer',
              category: 'top',
              source: new File(['top'], 'top.png', { type: 'image/png' }),
            },
          ],
        },
        fetchImpl as typeof fetch,
        normalizeImageSource,
      ),
    ).resolves.toBe('https://example.com/generated-look.png');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('/api/ai/experimental');
    expect(fetchImpl.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const requestBody = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      workspaceSlug: 'demo',
      baseModelImage: 'data:image/png;base64,model',
      imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
      garments: [
        {
          id: 'top-1',
          name: 'Cream Blazer',
          category: 'top',
          imageIndex: 2,
        },
      ],
    });
    expect(requestBody.prompt).toContain('Cream Blazer');
    expect(normalizeImageSource).toHaveBeenCalledTimes(2);
  });

  it('posts GPT Image 2 experimental payloads with the GPT provider flag', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/gpt-look.png' }),
    });
    const normalizeImageSource = vi
      .fn()
      .mockResolvedValueOnce('data:image/png;base64,model')
      .mockResolvedValueOnce('data:image/png;base64,bottom');

    await expect(
      generateGptExperimentalOutfitImage(
        {
          baseModelImage: 'https://example.com/model.png',
          garmentSelections: [
            {
              id: 'bottom-1',
              name: 'Black Trousers',
              category: 'bottom',
              source: new File(['bottom'], 'bottom.png', { type: 'image/png' }),
            },
          ],
        },
        fetchImpl as typeof fetch,
        normalizeImageSource,
      ),
    ).resolves.toBe('https://example.com/gpt-look.png');

    const requestBody = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      provider: 'gpt-image-2',
      imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,bottom'],
    });
  });

  it('posts GPT Image 2 scene payloads to the secure scene route with scene instructions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/gpt-scene.png' }),
    });
    const normalizeBaseImage = vi.fn().mockResolvedValue('data:image/png;base64,look');

    await expect(
      generateGptSceneVariation(
        'https://example.com/look.png',
        'street',
        'golden hour',
        'pro',
        'rooftop terrace',
        fetchImpl as typeof fetch,
        normalizeBaseImage,
      ),
    ).resolves.toBe('https://example.com/gpt-scene.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/scene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        provider: 'gpt-image-2',
        baseImage: 'data:image/png;base64,look',
        scene: 'street',
        lighting: 'golden hour',
        mode: 'pro',
        customPrompt: 'rooftop terrace',
      }),
    });
  });

  it('does not retry non-idempotent secure experimental failures automatically', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'temporary failure' });

    await expect(
      generateExperimentalOutfitImage(
        {
          baseModelImage: 'data:image/png;base64,model',
          garmentSelections: [
            {
              id: 'top-1',
              name: 'Cream Blazer',
              category: 'top',
              source: 'data:image/png;base64,top',
            },
          ],
        },
        fetchImpl as typeof fetch,
      ),
    ).rejects.toThrow('temporary failure');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('keeps the secure experimental route error text for non-retryable failures', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bundle payload invalid',
    });

    await expect(
      generateExperimentalOutfitImage(
        {
          baseModelImage: 'data:image/png;base64,model',
          garmentSelections: [
            {
              id: 'top-1',
              name: 'Cream Blazer',
              category: 'top',
              source: 'data:image/png;base64,top',
            },
          ],
        },
        fetchImpl as typeof fetch,
      ),
    ).rejects.toThrow('bundle payload invalid');
  });

  it('resolves the workspace slug from the /dev shortcut for secure experimental requests', () => {
    expect(__private__.resolveWorkspaceSlug({ pathname: '/dev/demo', hostname: 'localhost' } as Location)).toBe('demo');
  });
});
