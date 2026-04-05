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

const copyCookies = (source: NextResponse, target: NextResponse) => {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
};

const isRootPassPath = (pathname: string) =>
  ROOT_PASS_PATHS.has(pathname) || AUTH_PATH_PREFIXES.some((path) => pathname.startsWith(path));

export async function middleware(request: NextRequest) {
  if (isBypassedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { rootDomain } = getPublicEnv();
  const host = request.headers.get("host") ?? "";
  const rootIntent = getEntryRedirectIntent({
    host,
    rootDomain,
    pathname: request.nextUrl.pathname,
    isAuthenticated: false
  });

  if (rootIntent.kind === "root-pass") {
    if (isRootPassPath(request.nextUrl.pathname)) {
      const { response } = await updateSession(request);
      return response;
    }

    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const entryIntent = getEntryRedirectIntent({
    host,
    rootDomain,
    pathname: request.nextUrl.pathname,
    isAuthenticated: Boolean(user)
  });

  if (entryIntent.kind === "login-redirect") {
    return copyCookies(response, NextResponse.redirect(entryIntent.loginUrl));
  }

  if (entryIntent.kind === "root-pass") {
    return response;
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = getTenantRewritePath(entryIntent.workspaceSlug, entryIntent.pathname);

  return copyCookies(response, NextResponse.rewrite(rewrittenUrl));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};
