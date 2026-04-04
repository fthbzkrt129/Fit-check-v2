import type { ReactNode } from "react";

type TenantLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}>;

const TenantLayout = async ({ children, params }: TenantLayoutProps) => {
  const { workspaceSlug } = await params;

  return (
    <main className="shell">
      <div className="shell__inner tenant-shell">
        <header className="tenant-shell__header">
          <span className="eyebrow">Workspace</span>
          <h1>{workspaceSlug}</h1>
        </header>
        {children}
      </div>
    </main>
  );
};

export default TenantLayout;
