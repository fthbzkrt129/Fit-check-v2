import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

describe('pinnedStorage', () => {
  it('builds a workspace-scoped storage path', async () => {
    const { __private__ } = await import('./pinnedStorage');
    expect(__private__.buildPinnedStoragePath('workspace-1', 'abc123')).toBe('workspace/workspace-1/pinned/abc123.png');
  });
});
