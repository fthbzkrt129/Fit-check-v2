import { describe, expect, it, vi, beforeEach } from "vitest";

const maybeSingle = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq, single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ select, insert }));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from
  })
}));

import { bootstrapWorkspaceForUser } from "./bootstrapWorkspace";

describe("bootstrapWorkspaceForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates one organization, workspace, and owner membership for first login", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    single
      .mockResolvedValueOnce({ data: { id: "org-1", slug: "jane-org" }, error: null })
      .mockResolvedValueOnce({ data: { id: "ws-1", slug: "jane" }, error: null })
      .mockResolvedValueOnce({ data: { id: "membership-1" }, error: null });

    const result = await bootstrapWorkspaceForUser({
      userId: "user-1",
      email: "jane@example.com",
      fullName: "Jane"
    });

    expect(result).toMatchObject({
      organizationId: "org-1",
      workspaceId: "ws-1",
      membershipId: "membership-1",
      workspaceSlug: "jane",
      role: "owner",
      created: true
    });
  });

  it("is idempotent when the user already has a workspace membership", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        id: "membership-1",
        role: "owner",
        workspace_id: "ws-1",
        workspaces: {
          id: "ws-1",
          slug: "jane",
          organization_id: "org-1",
          organizations: {
            id: "org-1",
            slug: "jane-org"
          }
        }
      },
      error: null
    });

    const result = await bootstrapWorkspaceForUser({
      userId: "user-1",
      email: "jane@example.com"
    });

    expect(result.created).toBe(false);
    expect(insert).not.toHaveBeenCalled();
    expect(result.workspaceSlug).toBe("jane");
  });
});
