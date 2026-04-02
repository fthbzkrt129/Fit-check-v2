import { describe, expect, it } from "vitest";

import { getPublicEnv, getServerEnv } from "./env";

describe("env contract", () => {
  it("fails fast when required public vars are missing", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        NEXT_PUBLIC_ROOT_DOMAIN: ""
      })
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_ROOT_DOMAIN/);
  });

  it("fails fast when required server vars are missing", () => {
    expect(() =>
      getServerEnv({
        SUPABASE_SERVICE_ROLE_KEY: "",
        GEMINI_API_KEY: "",
        FAL_KEY: ""
      })
    ).toThrowError(/SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, FAL_KEY/);
  });

  it("documents downstream scripts in the app manifest", async () => {
    const { default: packageJson } = await import("../../package.json", {
      with: { type: "json" }
    });

    expect(packageJson.scripts.dev).toBeTruthy();
    expect(packageJson.scripts.build).toBeTruthy();
    expect(packageJson.scripts.test).toBeTruthy();
    expect(packageJson.scripts.typecheck).toBeTruthy();
    expect(packageJson.scripts["test:db"]).toBeTruthy();
  });
});
