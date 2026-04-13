import { describe, expect, it } from "vitest";

import { getSharedCookieDomain, getSupabaseCookieOptions } from "./cookieOptions";

describe("supabase cookie options", () => {
  it("shares auth cookies across non-local subdomains", () => {
    expect(getSharedCookieDomain("app.test:3000")).toBe(".app.test");
    expect(getSharedCookieDomain("fitcheck.app")).toBe(".fitcheck.app");
  });

  it("avoids domain scoping for localhost-style roots", () => {
    expect(getSharedCookieDomain("localhost:3000")).toBeUndefined();
    expect(getSharedCookieDomain("127.0.0.1:3000")).toBeUndefined();
  });

  it("marks local roots as non-secure so http dev cookies still work", () => {
    expect(getSupabaseCookieOptions("app.test:3000")).toMatchObject({
      domain: ".app.test",
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });
});
