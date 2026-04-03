import { createSupabaseServerClient } from "@/lib/supabase/server";

type WorkspaceAccessResult = {
  userId: string;
  workspaceSlug: string;
};

export const requireWorkspaceAccess = async (workspaceSlug: string): Promise<WorkspaceAccessResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: membership } = await supabase
    .from("workspace_memberships")
    .select("workspace_id, workspaces!inner(slug)")
    .eq("user_id", user.id)
    .eq("workspaces.slug", workspaceSlug)
    .maybeSingle();

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return {
    userId: user.id,
    workspaceSlug
  };
};
