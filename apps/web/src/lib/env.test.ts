import { describe, expect, it } from "vitest";

import { getPublicEnv, getServerEnv, getSupabaseAdminEnv, getSupabasePublicEnv } from "./env";

describe("getSupabaseAdminEnv", () => {
  it("succeeds with only SUPABASE_SERVICE_ROLE_KEY — GEMINI_API_KEY and FAL_KEY are not required", () => {
    const result = getSupabaseAdminEnv({ SUPABASE_SERVICE_ROLE_KEY: "test-service-key" });
    expect(result.supabaseServiceRoleKey).toBe("test-service-key");
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    expect(() => getSupabaseAdminEnv({})).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });
});

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

  it("returns normalized key names for downstream auth modules", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_ROOT_DOMAIN: "fitcheck.app"
      })
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabaseAnonKey: "anon-key",
      rootDomain: "fitcheck.app"
    });

    expect(
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
      })
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabaseAnonKey: "anon-key"
    });

    expect(
      getServerEnv({
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
        GEMINI_API_KEY: "gemini-key",
        FAL_KEY: "fal-key"
      })
    ).toEqual({
      supabaseServiceRoleKey: "service-role",
      geminiApiKey: "gemini-key",
      falKey: "fal-key"
    });
  });

  it("allows Supabase public env usage without root domain", () => {
    expect(
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
      })
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabaseAnonKey: "anon-key"
    });
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
