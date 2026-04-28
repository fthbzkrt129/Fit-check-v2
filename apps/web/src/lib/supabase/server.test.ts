import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClientMock = vi.fn();
const cookiesMock = vi.fn();
const getSupabasePublicEnvMock = vi.fn();
const getSupabaseCookieOptionsMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => createServerClientMock(...args)
}));

vi.mock("next/headers", () => ({
  cookies: (...args: unknown[]) => cookiesMock(...args)
}));

vi.mock("@/lib/env", () => ({
  getSupabasePublicEnv: (...args: unknown[]) => getSupabasePublicEnvMock(...args)
}));

vi.mock("@/lib/supabase/cookieOptions", () => ({
  getSupabaseCookieOptions: (...args: unknown[]) => getSupabaseCookieOptionsMock(...args)
}));

import { createSupabaseServerClient } from "./server";

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabasePublicEnvMock.mockReturnValue({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key"
    });
    getSupabaseCookieOptionsMock.mockReturnValue({ path: "/" });
  });

  it("skips cookie writes for read-only server component usage", async () => {
    const getAll = vi.fn().mockReturnValue([]);
    const set = vi.fn();

    cookiesMock.mockResolvedValue({ getAll, set });
    createServerClientMock.mockReturnValue({ client: true });

    await createSupabaseServerClient({ allowCookieWrites: false });

    const [, , options] = createServerClientMock.mock.calls[0] ?? [];
    options.cookies.setAll([{ name: "sb-test", value: "123", options: { path: "/" } }]);

    expect(set).not.toHaveBeenCalled();
  });
});
