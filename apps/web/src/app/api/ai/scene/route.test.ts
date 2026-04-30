import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireWorkspaceAccessMock = vi.fn();
const generateGptSceneVariationMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('@/lib/ai/providers/falServer', () => ({
  generateGptSceneVariation: (...args: unknown[]) => generateGptSceneVariationMock(...args),
}));

import { POST } from './route';

describe('POST /api/ai/scene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires workspace access and forwards scene generation to fal GPT provider', async () => {
    generateGptSceneVariationMock.mockResolvedValueOnce('https://example.com/gpt-scene.png');

    const response = await POST(
      new Request('http://localhost/api/ai/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          baseImage: 'data:image/png;base64,look',
          scene: 'studio',
          lighting: 'golden hour',
          mode: 'fast',
        }),
      }) as never,
    );

    expect(requireWorkspaceAccessMock).toHaveBeenCalledWith('demo');
    expect(generateGptSceneVariationMock).toHaveBeenCalledWith(
      'data:image/png;base64,look',
      'studio',
      'golden hour',
      'fast',
      undefined,
    );
    await expect(response.json()).resolves.toEqual({ imageUrl: 'https://example.com/gpt-scene.png' });
  });
});
