type TenantPageProps = {
  params: Promise<{ workspaceSlug: string }>;
};

const TenantPage = async ({ params }: TenantPageProps) => {
  const { workspaceSlug } = await params;

  return (
    <section className="card">
      <h2>{workspaceSlug} workspace shell</h2>
      <p>Bu shell, auth cookie ve hostname tabanli tenant routing dogrulandiktan sonra dolacak.</p>
    </section>
  );
};

export default TenantPage;
