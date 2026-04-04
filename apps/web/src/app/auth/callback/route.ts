import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildWorkspaceUrl } from "@/lib/tenant/buildWorkspaceUrl";
import { getPublicEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextWorkspace = request.nextUrl.searchParams.get("next");
  const { rootDomain } = getPublicEnv();

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const workspaceSlug = nextWorkspace ?? user?.user_metadata?.workspace_slug ?? null;
  if (!workspaceSlug) {
    return NextResponse.redirect(new URL("/auth/finish-signup", request.url));
  }

  return NextResponse.redirect(buildWorkspaceUrl(workspaceSlug, rootDomain));
}
