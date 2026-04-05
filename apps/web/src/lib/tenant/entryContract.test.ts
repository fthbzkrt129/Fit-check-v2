import { describe, expect, it } from "vitest";

import {
  getEntryRedirectIntent,
  getTenantRewritePath,
  isBypassedPath
} from "./entryContract";

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
