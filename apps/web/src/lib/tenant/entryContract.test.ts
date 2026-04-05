import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateSession } = vi.hoisted(() => ({
  updateSession: vi.fn()
}));

vi.mock("@/lib/env", () => ({
  getPublicEnv: () => ({
    rootDomain: "fitcheck.app"
  })
}));

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession
}));

vi.mock("@/lib/tenant/entryContract", async () => import("./entryContract"));

import {
  getEntryRedirectIntent,
  getTenantRewritePath,
  isBypassedPath
} from "./entryContract";
import { config, middleware } from "../../../middleware";

describe("entry middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes root marketing and auth routes through without tenant rewrite", async () => {
    updateSession.mockResolvedValue({ response: NextResponse.next(), user: null });

    const marketingResponse = await middleware(
      new NextRequest("https://fitcheck.app/", {
        headers: { host: "fitcheck.app" }
      })
    );

    const loginResponse = await middleware(
      new NextRequest("https://fitcheck.app/login", {
        headers: { host: "fitcheck.app" }
      })
    );

    expect(marketingResponse.headers.get("x-middleware-rewrite")).toBeNull();
    expect(marketingResponse.headers.get("location")).toBeNull();
    expect(loginResponse.headers.get("x-middleware-rewrite")).toBeNull();
    expect(loginResponse.headers.get("location")).toBeNull();
  });

  it("redirects anonymous tenant traffic to the root login route", async () => {
    updateSession.mockResolvedValue({ response: NextResponse.next(), user: null });

    const response = await middleware(
      new NextRequest("https://styling.fitcheck.app/closet", {
        headers: { host: "styling.fitcheck.app" }
      })
    );

    expect(response.headers.get("location")).toBe("https://fitcheck.app/login?next=styling");
  });

  it("rewrites authenticated tenant traffic into the tenant shell path", async () => {
    updateSession.mockResolvedValue({ response: NextResponse.next(), user: { id: "user-1" } });

    const response = await middleware(
      new NextRequest("https://styling.fitcheck.app/outfits", {
        headers: { host: "styling.fitcheck.app" }
      })
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://styling.fitcheck.app/_tenant/styling/outfits"
    );
  });

  it("excludes api, static assets, and metadata files from the matcher", () => {
    expect(config.matcher).toEqual([
      "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]);
  });
});

describe("entry contract", () => {
  it("keeps root hosts on the shared surface", () => {
    expect(
      getEntryRedirectIntent({
        host: "fitcheck.app",
        rootDomain: "fitcheck.app",
        pathname: "/",
        isAuthenticated: false
      })
    ).toEqual({ kind: "root-pass" });

    expect(
      getEntryRedirectIntent({
        host: "www.fitcheck.app",
        rootDomain: "fitcheck.app",
        pathname: "/login",
        isAuthenticated: false
      })
    ).toEqual({ kind: "root-pass" });

    expect(
      getEntryRedirectIntent({
        host: "localhost:3000",
        rootDomain: "localhost:3000",
        pathname: "/",
        isAuthenticated: false
      })
    ).toEqual({ kind: "root-pass" });
  });

  it("redirects anonymous tenant traffic to canonical root login with workspace intent", () => {
    expect(
      getEntryRedirectIntent({
        host: "styling.fitcheck.app",
        rootDomain: "fitcheck.app",
        pathname: "/closet",
        isAuthenticated: false
      })
    ).toEqual({
      kind: "login-redirect",
      workspaceSlug: "styling",
      loginUrl: "https://fitcheck.app/login?next=styling"
    });

    expect(
      getEntryRedirectIntent({
        host: "styling.localhost:3000",
        rootDomain: "localhost:3000",
        pathname: "/closet",
        isAuthenticated: false
      })
    ).toEqual({
      kind: "login-redirect",
      workspaceSlug: "styling",
      loginUrl: "http://localhost:3000/login?next=styling"
    });
  });

  it("returns tenant rewrite intent for authenticated tenant hosts including preview hosts", () => {
    expect(
      getEntryRedirectIntent({
        host: "styling---preview.vercel.app",
        rootDomain: "fitcheck.app",
        pathname: "/outfits/look-1",
        isAuthenticated: true
      })
    ).toEqual({
      kind: "tenant-rewrite",
      workspaceSlug: "styling",
      pathname: "/outfits/look-1"
    });

    expect(getTenantRewritePath("styling", "/outfits/look-1")).toBe(
      "/_tenant/styling/outfits/look-1"
    );
    expect(getTenantRewritePath("styling", "/")).toBe("/_tenant/styling");
  });

  it("identifies bypassed asset and metadata paths", () => {
    expect(isBypassedPath("/api/upload")).toBe(true);
    expect(isBypassedPath("/_next/static/chunk.js")).toBe(true);
    expect(isBypassedPath("/_next/image")).toBe(true);
    expect(isBypassedPath("/favicon.ico")).toBe(true);
    expect(isBypassedPath("/sitemap.xml")).toBe(true);
    expect(isBypassedPath("/robots.txt")).toBe(true);
    expect(isBypassedPath("/login")).toBe(false);
  });
});
