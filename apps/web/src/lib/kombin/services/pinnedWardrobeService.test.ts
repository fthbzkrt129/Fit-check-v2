import { describe, expect, it, vi } from 'vitest';

import { listPinnedWardrobeItems, pinWardrobeItem } from './pinnedWardrobeService';

describe('pinnedWardrobeService', () => {
  it('requests the workspace pinned list', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await listPinnedWardrobeItems('demo', fetchImpl as typeof fetch);

    expect(fetchImpl).toHaveBeenCalledWith('/api/wardrobe/pinned?workspaceSlug=demo');
  });

  it('posts a pin request payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'pinned:1',
        name: 'Pinned Tee',
        url: 'https://example.com/pinned.png',
        category: 'top',
        source: 'user',
        isPinned: true,
      }),
    });

    await pinWardrobeItem({ workspaceSlug: 'demo', name: 'Pinned Tee', category: 'top', sourceKind: 'uploaded', imageDataUrl: 'data:image/png;base64,abc123' }, fetchImpl as typeof fetch);

    expect(fetchImpl).toHaveBeenCalledWith('/api/wardrobe/pin', expect.objectContaining({ method: 'POST' }));
  });
});
