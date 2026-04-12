import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bootstrapWorkspaceForUser } from "@/lib/tenant/bootstrapWorkspace";
import { buildWorkspaceUrl } from "@/lib/tenant/buildWorkspaceUrl";
import { getPublicEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const workspace = await bootstrapWorkspaceForUser({
      userId: user.id,
      email: user.email,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null
    });

    const { rootDomain } = getPublicEnv();

    return NextResponse.redirect(buildWorkspaceUrl(workspace.workspaceSlug, rootDomain));
  } catch (err) {
    console.error("[finish-signup] bootstrap error for user", user.id, err);
    return NextResponse.redirect(new URL("/login?error=setup_failed", request.url));
  }
}
