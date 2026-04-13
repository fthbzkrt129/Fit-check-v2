import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateModelImageMock = vi.fn();
const requireWorkspaceAccessMock = vi.fn();

vi.mock('@/lib/ai/providers/geminiServer', () => ({
  generateModelImage: (...args: unknown[]) => generateModelImageMock(...args),
}));

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

import { POST } from './route';

describe('POST /api/ai/model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires workspace access for base model generation requests', async () => {
    generateModelImageMock.mockResolvedValueOnce('https://example.com/generated-model.png');

    const request = new Request('http://localhost/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });

    const response = await POST(request as never);

    expect(requireWorkspaceAccessMock).toHaveBeenCalledWith('demo');
    expect(response.status).toBe(200);
  });

  it('returns the provider error text in the response body when generation fails', async () => {
    generateModelImageMock.mockRejectedValueOnce(new Error('Unsupported image format.'));

    const request = new Request('http://localhost/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });

    const response = await POST(request as never);

    expect(response.ok).toBe(false);
    await expect(response.text()).resolves.toBe('Unsupported image format.');
  });

  it('returns 502 for provider-side failures', async () => {
    generateModelImageMock.mockRejectedValueOnce(new Error('Gemini request failed.'));

    const request = new Request('http://localhost/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(502);
  });

  it('maps workspace authorization errors to 401 and 403', async () => {
    requireWorkspaceAccessMock.mockRejectedValueOnce(new Error('UNAUTHORIZED'));

    const unauthorizedRequest = new Request('http://localhost/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });

    const unauthorizedResponse = await POST(unauthorizedRequest as never);

    expect(unauthorizedResponse.status).toBe(401);

    requireWorkspaceAccessMock.mockRejectedValueOnce(new Error('FORBIDDEN'));

    const forbiddenRequest = new Request('http://localhost/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });

    const forbiddenResponse = await POST(forbiddenRequest as never);

    expect(forbiddenResponse.status).toBe(403);
  });
});
