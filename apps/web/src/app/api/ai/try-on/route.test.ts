import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireWorkspaceAccessMock = vi.fn();
const generateVirtualTryOnImageMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('@/lib/ai/providers/geminiServer', () => ({
  generateVirtualTryOnImage: (...args: unknown[]) => generateVirtualTryOnImageMock(...args),
}));

import { POST } from './route';

describe('POST /api/ai/try-on', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces workspace access and forwards category length controls to the provider', async () => {
    generateVirtualTryOnImageMock.mockResolvedValueOnce('https://example.com/try-on.png');

    const request = new Request('http://localhost/api/ai/try-on', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        modelImage: 'data:image/png;base64,model',
        garmentImage: 'data:image/png;base64,garment',
        category: 'dress',
        dressLength: 'midi',
      }),
    });

    const response = await POST(request as never);

    expect(requireWorkspaceAccessMock).toHaveBeenCalledWith('demo');
    expect(generateVirtualTryOnImageMock).toHaveBeenCalledWith(
      'data:image/png;base64,model',
      'data:image/png;base64,garment',
      'dress',
      undefined,
      'midi',
      undefined,
    );
    await expect(response.json()).resolves.toEqual({ imageUrl: 'https://example.com/try-on.png' });
  });

  it('returns 400 for malformed category-length payloads', async () => {
    const request = new Request('http://localhost/api/ai/try-on', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        modelImage: 'data:image/png;base64,model',
        garmentImage: 'data:image/png;base64,garment',
        category: 'dress',
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(400);
    expect(requireWorkspaceAccessMock).not.toHaveBeenCalled();
    expect(generateVirtualTryOnImageMock).not.toHaveBeenCalled();
  });
});
