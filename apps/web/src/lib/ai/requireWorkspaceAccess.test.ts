import { beforeEach, describe, expect, it, vi } from "vitest";

const createSupabaseServerClientMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: (...args: unknown[]) => createSupabaseServerClientMock(...args)
}));

import { requireWorkspaceAccess } from "./requireWorkspaceAccess";

describe("requireWorkspaceAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a read-only server client for workspace page access checks", async () => {
    createSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1"
            }
          }
        })
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  workspace_id: "workspace-1",
                  workspaces: {
                    slug: "demo"
                  }
                }
              })
            })
          })
        })
      })
    });

    await requireWorkspaceAccess("demo");

    expect(createSupabaseServerClientMock).toHaveBeenCalledWith({ allowCookieWrites: false });
  });
});
