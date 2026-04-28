import { describe, expect, it } from "vitest";

import { buildWorkspaceUrl } from "./buildWorkspaceUrl";
import { resolveTenantHost } from "./resolveTenantHost";

describe("tenant routing", () => {
  it("resolves a workspace subdomain as tenant-scoped", () => {
    expect(resolveTenantHost("styling.fitcheck.app", "fitcheck.app")).toMatchObject({
      kind: "tenant",
      isTenant: true,
      workspaceSlug: "styling"
    });
  });

  it("keeps root hosts on the shared surface", () => {
    expect(resolveTenantHost("fitcheck.app", "fitcheck.app").isTenant).toBe(false);
    expect(resolveTenantHost("www.fitcheck.app", "fitcheck.app").isTenant).toBe(false);
    expect(resolveTenantHost("localhost:3000", "localhost:3000").isTenant).toBe(false);
  });

  it("normalizes local and preview hosts to canonical workspace URLs", () => {
    expect(buildWorkspaceUrl("styling", "fitcheck.app")).toBe("https://styling.fitcheck.app");
    expect(buildWorkspaceUrl("styling", "localhost:3000")).toBe("http://styling.localhost:3000");
    expect(buildWorkspaceUrl("styling", "lvh.me:3000")).toBe("http://lvh.me:3000/workspace/styling");
    expect(buildWorkspaceUrl("styling", "app.test:3000")).toBe("http://styling.app.test:3000");
    expect(buildWorkspaceUrl("styling", "fit-check-utxy.vercel.app")).toBe(
      "https://fit-check-utxy.vercel.app/workspace/styling"
    );
    expect(resolveTenantHost("styling---preview.vercel.app", "fitcheck.app")).toMatchObject({
      kind: "tenant",
      workspaceSlug: "styling"
    });
  });
});
