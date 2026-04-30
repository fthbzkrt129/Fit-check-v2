import { describe, expect, it, vi } from 'vitest';

const requireWorkspaceAccessMock = vi.fn();
const listWorkspacePinnedWardrobeMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('@/lib/wardrobe/pinnedServer', () => ({
  listWorkspacePinnedWardrobe: (...args: unknown[]) => listWorkspacePinnedWardrobeMock(...args),
}));

import { GET } from './route';

describe('GET /api/wardrobe/pinned', () => {
  it('returns workspace pinned items', async () => {
    requireWorkspaceAccessMock.mockResolvedValue({ userId: 'user-1', workspaceSlug: 'demo', workspaceId: 'workspace-1' });
    listWorkspacePinnedWardrobeMock.mockResolvedValue([
      { id: 'pinned:1', name: 'Shirt', url: 'https://example.com/shirt.png', category: 'top', source: 'user', isPinned: true },
    ]);
    const response = await GET(new Request('http://localhost/api/wardrobe/pinned?workspaceSlug=demo'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(listWorkspacePinnedWardrobeMock).toHaveBeenCalledWith('workspace-1');
    expect(body).toEqual({
      items: [{ id: 'pinned:1', name: 'Shirt', url: 'https://example.com/shirt.png', category: 'top', source: 'user', isPinned: true }],
    });
  });
});
