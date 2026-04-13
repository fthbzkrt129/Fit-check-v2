import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getEntryRedirectIntent,
  getTenantRewritePath,
  isBypassedPath
} from "@/lib/tenant/entryContract";

const ROOT_PASS_PATHS = new Set(["/", "/login"]);
const AUTH_PATH_PREFIXES = ["/auth/callback", "/auth/finish-signup"];
const DEV_WORKSPACE_PREFIX = "/dev/";

const copyCookies = (source: NextResponse, target: NextResponse) => {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
};

const isRootPassPath = (pathname: string) =>
  ROOT_PASS_PATHS.has(pathname) || AUTH_PATH_PREFIXES.some((path) => pathname.startsWith(path));

export async function middleware(request: NextRequest) {
  console.log("[MIDDLEWARE START]", request.nextUrl.pathname, request.headers.get("host"));
  if (isBypassedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Local dev shortcut: /dev/[slug] → /_tenant/[slug]/
  if (request.nextUrl.pathname.startsWith(DEV_WORKSPACE_PREFIX)) {
    const slug = request.nextUrl.pathname.slice(DEV_WORKSPACE_PREFIX.length).split("/")[0];
    if (slug) {
      const { response, user } = await updateSession(request);
      if (!user) {
        const { rootDomain } = getPublicEnv();
        const loginUrl = new URL(`http://${rootDomain}/login`);
        loginUrl.searchParams.set("next", slug);
        return copyCookies(response, NextResponse.redirect(loginUrl));
      }
      const rewrittenUrl = request.nextUrl.clone();
      rewrittenUrl.pathname = getTenantRewritePath(slug, "/");
      return copyCookies(response, NextResponse.rewrite(rewrittenUrl));
    }
  }

  const { rootDomain } = getPublicEnv();
  const host = request.headers.get("host") ?? "";
  
  // Force redirect localhost to lvh.me for full subdomain cookie support
  if ((host.includes("localhost") || host.includes("127.0.0.1")) && rootDomain.includes("lvh.me")) {
    const url = request.nextUrl.clone();
    // Replaces localhost or slug.localhost with lvh.me equivalent
    url.host = host.replace(/localhost|127\.0\.0\.1/, "lvh.me");
    return NextResponse.redirect(url);
  }

  const { response, user } = await updateSession(request);
  const entryIntent = getEntryRedirectIntent({
    host,
    rootDomain,
    pathname: request.nextUrl.pathname,
    isAuthenticated: Boolean(user)
  });

  console.log("[MIDDLEWARE TRACE]", {
    reqHost: host,
    reqPath: request.nextUrl.pathname,
    hasUser: Boolean(user),
    intentKind: entryIntent.kind,
  });

  if (entryIntent.kind === "login-redirect") {
    return copyCookies(response, NextResponse.redirect(entryIntent.loginUrl));
  }

  if (entryIntent.kind === "root-pass") {
    if (isRootPassPath(request.nextUrl.pathname)) {
      return response;
    }
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = getTenantRewritePath(entryIntent.workspaceSlug, entryIntent.pathname);
  
  console.log("[MIDDLEWARE] Rewriting tenant path:", {
    original: request.nextUrl.pathname,
    rewritten: rewrittenUrl.pathname,
    host,
    isAuth: Boolean(user)
  });

  return copyCookies(response, NextResponse.rewrite(rewrittenUrl));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};
