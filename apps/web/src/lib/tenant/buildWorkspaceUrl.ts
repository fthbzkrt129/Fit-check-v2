type BuildWorkspaceUrlOptions = {
  protocol?: "http" | "https";
  pathname?: string;
  search?: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const stripPort = (value: string) => value.replace(/:\d+$/, "");

export const isLocalRootDomain = (rootDomain: string) => {
  const hostname = stripPort(rootDomain).toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".lvh.me") ||
    hostname === "lvh.me"
  );
};

export const buildWorkspaceUrl = (
  workspaceSlug: string,
  rootDomain: string,
  options: BuildWorkspaceUrlOptions = {}
) => {
  const protocol = options.protocol ?? (isLocalRootDomain(rootDomain) ? "http" : "https");
  const pathname = options.pathname ? `/${trimSlashes(options.pathname)}` : "";
  const search = options.search ?? "";

  const domain = workspaceSlug ? `${workspaceSlug}.${rootDomain}` : rootDomain;

  return `${protocol}://${domain}${pathname}${search}`;
};
