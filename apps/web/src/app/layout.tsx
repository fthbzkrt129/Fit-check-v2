import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "fit-check SaaS",
  description: "Secure multi-tenant fit-check experience powered by a server-side AI platform."
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
