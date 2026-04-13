import { getPublicEnv } from "@/lib/env";
import { isLocalRootDomain } from "@/lib/tenant/buildWorkspaceUrl";

const stripPort = (value: string) => value.replace(/:\d+$/, "").trim().toLowerCase();

export const getSharedCookieDomain = (rootDomain: string) => {
  const hostname = stripPort(rootDomain);

  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return undefined;
  }

  return `.${hostname}`;
};

export const getSupabaseCookieOptions = (rootDomain = getPublicEnv().rootDomain) => {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: !isLocalRootDomain(rootDomain),
    // Critical: this tells Supabase to allow cookies across *.lvh.me
    domain: isLocalRootDomain(rootDomain) ? ".lvh.me" : getSharedCookieDomain(rootDomain),
  };
};
