import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireWorkspaceAccessMock = vi.fn();
const generateExperimentalOutfitImageMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('@/lib/ai/providers/falServer', () => ({
  generateExperimentalOutfitImage: (...args: unknown[]) => generateExperimentalOutfitImageMock(...args),
}));

import { POST } from './route';

describe('POST /api/ai/experimental', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires workspace access and forwards the validated bundle payload', async () => {
    const payload = {
      workspaceSlug: 'demo',
      baseModelImage: 'data:image/png;base64,model',
      imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
      garments: [{ id: 'top-1', name: 'Cream Blazer', category: 'top', imageIndex: 2 }],
      prompt: 'bundle prompt',
    };
    generateExperimentalOutfitImageMock.mockResolvedValueOnce('https://example.com/look.png');

    const response = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }) as never,
    );

    expect(requireWorkspaceAccessMock).toHaveBeenCalledWith('demo');
    expect(generateExperimentalOutfitImageMock).toHaveBeenCalledWith(payload);
    await expect(response.json()).resolves.toEqual({ imageUrl: 'https://example.com/look.png' });
  });

  it('returns 400 for malformed experimental bundle payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          imageInputs: [],
          garments: [],
          prompt: '',
        }),
      }) as never,
    );

    expect(response.status).toBe(400);
    expect(requireWorkspaceAccessMock).not.toHaveBeenCalled();
    expect(generateExperimentalOutfitImageMock).not.toHaveBeenCalled();
  });

  it('maps workspace authorization and provider failures to stable HTTP statuses', async () => {
    requireWorkspaceAccessMock.mockRejectedValueOnce(new Error('FORBIDDEN'));

    const forbiddenResponse = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          baseModelImage: 'data:image/png;base64,model',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          garments: [{ id: 'top-1', name: 'Cream Blazer', category: 'top', imageIndex: 2 }],
          prompt: 'bundle prompt',
        }),
      }) as never,
    );

    expect(forbiddenResponse.status).toBe(403);

    requireWorkspaceAccessMock.mockResolvedValueOnce(undefined);
    generateExperimentalOutfitImageMock.mockRejectedValueOnce(new Error('fal.ai deneysel kombin istegi tamamlanamadi.'));

    const providerResponse = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          baseModelImage: 'data:image/png;base64,model',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          garments: [{ id: 'top-1', name: 'Cream Blazer', category: 'top', imageIndex: 2 }],
          prompt: 'bundle prompt',
        }),
      }) as never,
    );

    expect(providerResponse.status).toBe(502);
  });

  it('returns 502 for generic internal failures that are not validation or auth errors', async () => {
    requireWorkspaceAccessMock.mockResolvedValueOnce(undefined);
    generateExperimentalOutfitImageMock.mockRejectedValueOnce(new Error('Unexpected server crash'));

    const response = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          baseModelImage: 'data:image/png;base64,model',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          garments: [{ id: 'top-1', name: 'Cream Blazer', category: 'top', imageIndex: 2 }],
          prompt: 'bundle prompt',
        }),
      }) as never,
    );

    expect(response.status).toBe(502);
  });

  it('returns 400 when garment imageIndex does not reference an uploaded image input', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai/experimental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug: 'demo',
          baseModelImage: 'data:image/png;base64,model',
          imageInputs: ['data:image/png;base64,model'],
          garments: [{ id: 'top-1', name: 'Cream Blazer', category: 'top', imageIndex: 2 }],
          prompt: 'bundle prompt',
        }),
      }) as never,
    );

    expect(response.status).toBe(400);
  });
});
