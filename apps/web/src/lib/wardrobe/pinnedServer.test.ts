import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseAdminClientMock, createPinnedImageSignedUrlMock, uploadPinnedImageMock, deletePinnedImageMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createPinnedImageSignedUrlMock: vi.fn(),
  uploadPinnedImageMock: vi.fn(),
  deletePinnedImageMock: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: (...args: unknown[]) => createSupabaseAdminClientMock(...args),
}));

vi.mock('./pinnedStorage', () => ({
  createPinnedImageSignedUrl: (...args: unknown[]) => createPinnedImageSignedUrlMock(...args),
  uploadPinnedImage: (...args: unknown[]) => uploadPinnedImageMock(...args),
  deletePinnedImage: (...args: unknown[]) => deletePinnedImageMock(...args),
}));

import { __private__, createOrReuseWorkspacePinnedWardrobeItem, listWorkspacePinnedWardrobe } from './pinnedServer';

describe('pinnedServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a stable dedupe key for system items', () => {
    expect(
      __private__.buildDedupeKey({
        sourceKind: 'system',
        systemItemId: 'shirt-1',
        sourceUrl: 'https://cdn.example/shirt.jpg',
      }),
    ).toBe('system:shirt-1');
  });

  it('falls back to normalized source url when a system item id is missing', () => {
    expect(
      __private__.buildDedupeKey({
        sourceKind: 'system',
        sourceUrl: 'https://cdn.example/shirt.jpg?x=1',
      }),
    ).toBe('system-url:https://cdn.example/shirt.jpg?x=1');
  });

  it('maps uploaded storage rows to signed client urls', async () => {
    createPinnedImageSignedUrlMock.mockResolvedValue('https://signed.example/pinned.png');
    createSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{
                id: 'row-1',
                name: 'Pinned Tee',
                category: 'top',
                source_kind: 'uploaded',
                storage_path: 'workspace/workspace-1/pinned/hash.png',
                source_url: null,
              }],
              error: null,
            }),
          }),
        }),
      }),
    });

    await expect(listWorkspacePinnedWardrobe('workspace-1')).resolves.toEqual([
      {
        id: 'pinned:row-1',
        name: 'Pinned Tee',
        category: 'top',
        source: 'user',
        url: 'https://signed.example/pinned.png',
        isPinned: true,
      },
    ]);
  });

  it('returns an existing item when the same uploaded garment is already pinned', async () => {
    createPinnedImageSignedUrlMock.mockResolvedValue('https://signed.example/pinned.png');
    createSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'row-1',
                  name: 'Pinned Tee',
                  category: 'top',
                  source_kind: 'uploaded',
                  storage_path: 'workspace/workspace-1/pinned/hash.png',
                  source_url: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    await expect(createOrReuseWorkspacePinnedWardrobeItem(
      { userId: 'user-1', workspaceId: 'workspace-1', workspaceSlug: 'demo' },
      {
        workspaceSlug: 'demo',
        name: 'Pinned Tee',
        category: 'top',
        sourceKind: 'uploaded',
        imageDataUrl: 'data:image/png;base64,Zm9v',
      },
    )).resolves.toEqual({
      id: 'pinned:row-1',
      name: 'Pinned Tee',
      category: 'top',
      source: 'user',
      url: 'https://signed.example/pinned.png',
      isPinned: true,
    });

    expect(uploadPinnedImageMock).not.toHaveBeenCalled();
  });

  it('deletes the orphaned uploaded object when a duplicate insert loses the race', async () => {
    uploadPinnedImageMock.mockResolvedValue('workspace/workspace-1/pinned/hash.png');
    createPinnedImageSignedUrlMock.mockResolvedValue('https://signed.example/pinned.png');

    const fromMock = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('duplicate key value violates unique constraint') }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'row-1',
                  name: 'Pinned Tee',
                  category: 'top',
                  source_kind: 'uploaded',
                  storage_path: 'workspace/workspace-1/pinned/hash.png',
                  source_url: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

    createSupabaseAdminClientMock.mockReturnValue({ from: fromMock });

    await expect(createOrReuseWorkspacePinnedWardrobeItem(
      { userId: 'user-1', workspaceId: 'workspace-1', workspaceSlug: 'demo' },
      {
        workspaceSlug: 'demo',
        name: 'Pinned Tee',
        category: 'top',
        sourceKind: 'uploaded',
        imageDataUrl: 'data:image/png;base64,Zm9v',
      },
    )).resolves.toEqual({
      id: 'pinned:row-1',
      name: 'Pinned Tee',
      category: 'top',
      source: 'user',
      url: 'https://signed.example/pinned.png',
      isPinned: true,
    });

    expect(deletePinnedImageMock).toHaveBeenCalledWith('workspace/workspace-1/pinned/hash.png');
  });
});
