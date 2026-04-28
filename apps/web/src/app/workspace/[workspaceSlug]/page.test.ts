import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';

const requireWorkspaceAccessMock = vi.fn();
const redirectMock = vi.fn();

vi.mock('@/lib/ai/requireWorkspaceAccess', () => ({
  requireWorkspaceAccess: (...args: unknown[]) => requireWorkspaceAccessMock(...args),
}));

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

vi.mock('@/components/kombin/KombinEditor', () => ({
  default: () => 'KombinEditor',
}));

import TenantPage from './page';

describe('workspace page access guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('React', React);
  });

  it('verifies access before rendering the workspace editor', async () => {
    requireWorkspaceAccessMock.mockResolvedValueOnce({ userId: 'user-1', workspaceSlug: 'demo' });

    await TenantPage({ params: Promise.resolve({ workspaceSlug: 'demo' }) });

    expect(requireWorkspaceAccessMock).toHaveBeenCalledWith('demo');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects stale or forbidden workspace URLs to the signed-in user workspace bootstrap', async () => {
    requireWorkspaceAccessMock.mockRejectedValueOnce(new Error('FORBIDDEN'));

    await TenantPage({ params: Promise.resolve({ workspaceSlug: 'other-workspace' }) });

    expect(redirectMock).toHaveBeenCalledWith('/auth/finish-signup');
  });

  it('redirects unauthenticated workspace visits to login', async () => {
    requireWorkspaceAccessMock.mockRejectedValueOnce(new Error('UNAUTHORIZED'));

    await TenantPage({ params: Promise.resolve({ workspaceSlug: 'demo' }) });

    expect(redirectMock).toHaveBeenCalledWith('/login');
  });
});
