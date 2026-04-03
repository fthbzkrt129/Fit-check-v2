import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import { resolveTenantHost } from "@/lib/tenant/resolveTenantHost";

const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest) {
  const { rootDomain } = getPublicEnv();
  const tenantHost = resolveTenantHost(request.headers.get("host") ?? "", rootDomain);
  const { response, user } = await updateSession(request);

  if (!tenantHost.isTenant) {
    return response;
  }

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
