type BuildWorkspaceUrlOptions = {
  protocol?: "http" | "https";
  pathname?: string;
  search?: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const buildWorkspaceUrl = (
  workspaceSlug: string,
  rootDomain: string,
  options: BuildWorkspaceUrlOptions = {}
) => {
  const protocol = options.protocol ?? (rootDomain.includes("localhost") ? "http" : "https");
  const pathname = options.pathname ? `/${trimSlashes(options.pathname)}` : "";
  const search = options.search ?? "";

  return `${protocol}://${workspaceSlug}.${rootDomain}${pathname}${search}`;
};
