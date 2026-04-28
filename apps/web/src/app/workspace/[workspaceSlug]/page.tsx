import KombinEditor from "@/components/kombin/KombinEditor";
import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { redirect } from "next/navigation";

type TenantPageProps = {
  params: Promise<{ workspaceSlug: string }>;
};

const TenantPage = async ({ params }: TenantPageProps) => {
  const { workspaceSlug } = await params;

  try {
    await requireWorkspaceAccess(workspaceSlug);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return redirect("/login");
    }

    return redirect("/auth/finish-signup");
  }

  return <KombinEditor />;
};

export default TenantPage;
