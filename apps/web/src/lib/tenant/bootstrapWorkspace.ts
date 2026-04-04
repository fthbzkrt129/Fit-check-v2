import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";

type BootstrapInput = {
  userId: string;
  email: string;
  fullName?: string | null;
};

type ExistingOrganization = {
  id: string;
  slug: string;
};

type ExistingWorkspace = {
  id: string;
  slug: string;
  organization_id: string;
  organizations: ExistingOrganization | ExistingOrganization[];
};

type ExistingMembership = {
  id: string;
  role: "owner" | "member";
  workspace_id: string;
  workspaces: ExistingWorkspace | ExistingWorkspace[] | null;
};

export type BootstrapWorkspaceResult = {
  organizationId: string;
  organizationSlug: string;
  workspaceId: string;
  workspaceSlug: string;
  membershipId: string;
  role: "owner";
  created: boolean;
};

export const bootstrapWorkspaceForUser = async ({ userId, email, fullName }: BootstrapInput): Promise<BootstrapWorkspaceResult> => {
  const admin = createSupabaseAdminClient();

  const { data: existingMembership, error: membershipError } = (await admin
    .from("workspace_memberships")
    .select("id, role, workspace_id, workspaces(id, slug, organization_id, organizations(id, slug))")
    .eq("user_id", userId)
    .maybeSingle()) as { data: ExistingMembership | null; error: Error | null };

  if (membershipError) {
    throw membershipError;
  }

  if (existingMembership?.workspaces && !Array.isArray(existingMembership.workspaces)) {
    const workspace = existingMembership.workspaces;
    const organization = Array.isArray(workspace.organizations) ? workspace.organizations[0] : workspace.organizations;

    return {
      organizationId: organization.id,
      organizationSlug: organization.slug,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      membershipId: existingMembership.id,
      role: "owner",
      created: false
    };
  }

  const baseSlug = slugify(fullName || email.split("@")[0] || userId.slice(0, 8));
  const organizationSlug = `${baseSlug}-org`;
  const workspaceSlug = baseSlug;
  const organizationName = fullName?.trim() || email;

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({
      slug: organizationSlug,
      name: organizationName,
      owner_user_id: userId
    })
    .select("id, slug")
    .single();

  if (organizationError) {
    throw organizationError;
  }

  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      organization_id: organization.id,
      slug: workspaceSlug,
      name: `${organizationName} Workspace`
    })
    .select("id, slug")
    .single();

  if (workspaceError) {
    throw workspaceError;
  }

  const { data: membership, error: insertMembershipError } = await admin
    .from("workspace_memberships")
    .insert({
      user_id: userId,
      workspace_id: workspace.id,
      role: "owner"
    })
    .select("id")
    .single();

  if (insertMembershipError) {
    throw insertMembershipError;
  }

  return {
    organizationId: organization.id,
    organizationSlug: organization.slug,
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    membershipId: membership.id,
    role: "owner",
    created: true
  };
};
