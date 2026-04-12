import type { ReactNode } from "react";

type TenantLayoutProps = Readonly<{
  children: ReactNode;
}>;

const TenantLayout = ({ children }: TenantLayoutProps) => {
  return <>{children}</>;
};

export default TenantLayout;
