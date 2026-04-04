import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import { resolveTenantHost } from "@/lib/tenant/resolveTenantHost";

const LOGIN_PATH = "/login";
const AUTH_PATH_PREFIXES = ["/auth/callback", "/auth/finish-signup"];

export async function middleware(request: NextRequest) {
  const { rootDomain } = getPublicEnv();
  const tenantHost = resolveTenantHost(request.headers.get("host") ?? "", rootDomain);

  if (!tenantHost.isTenant) {
    if (AUTH_PATH_PREFIXES.some((path) => request.nextUrl.pathname.startsWith(path))) {
      const { response } = await updateSession(request);
      return response;
    }

    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.hostname = rootDomain.split(":")[0];
    loginUrl.port = rootDomain.includes(":") ? rootDomain.split(":")[1] ?? "" : "";
    loginUrl.searchParams.set("next", tenantHost.workspaceSlug);
    return NextResponse.redirect(loginUrl);
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = `/_tenant/${tenantHost.workspaceSlug}${request.nextUrl.pathname}`;

  return NextResponse.rewrite(rewrittenUrl, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
