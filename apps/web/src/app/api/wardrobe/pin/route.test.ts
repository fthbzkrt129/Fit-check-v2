import { describe, expect, it, vi } from 'vitest';

const requireWorkspaceAccessMock = vi.fn();
const createOrReuseWorkspacePinnedWardrobeItemMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('@/lib/wardrobe/pinnedServer', () => ({
  createOrReuseWorkspacePinnedWardrobeItem: (...args: unknown[]) => createOrReuseWorkspacePinnedWardrobeItemMock(...args),
}));

import { POST } from './route';

describe('POST /api/wardrobe/pin', () => {
  it('returns the created pinned item', async () => {
    requireWorkspaceAccessMock.mockResolvedValue({ userId: 'user-1', workspaceSlug: 'demo', workspaceId: 'workspace-1' });
    createOrReuseWorkspacePinnedWardrobeItemMock.mockResolvedValue({
      id: 'pinned:1',
      name: 'Uploaded Tee',
      url: 'https://example.com/pinned-tee.png',
      category: 'top',
      source: 'user',
      isPinned: true,
    });
    const response = await POST(new Request('http://localhost/api/wardrobe/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        name: 'Uploaded Tee',
        category: 'top',
        sourceKind: 'uploaded',
        imageDataUrl: 'data:image/png;base64,abc123',
      }),
    }));

    expect(response.status).toBe(200);
    expect(createOrReuseWorkspacePinnedWardrobeItemMock).toHaveBeenCalledWith(
      { userId: 'user-1', workspaceSlug: 'demo', workspaceId: 'workspace-1' },
      expect.objectContaining({ sourceKind: 'uploaded', name: 'Uploaded Tee' }),
    );
  });
});
