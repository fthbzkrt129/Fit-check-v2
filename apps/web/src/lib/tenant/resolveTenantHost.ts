const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin"]);

export type ResolvedTenantHost =
  | {
      kind: "root";
      isTenant: false;
      workspaceSlug: null;
      hostname: string;
      rootHost: string;
    }
  | {
      kind: "tenant";
      isTenant: true;
      workspaceSlug: string;
      hostname: string;
      rootHost: string;
    };

const normalizeHostname = (host: string) => host.trim().toLowerCase().split(":")[0];

const extractVercelPreviewSlug = (hostname: string) => {
  if (!hostname.endsWith(".vercel.app") || !hostname.includes("---")) {
    return null;
  }

  const candidate = hostname.split("---")[0];
  return candidate && !RESERVED_SUBDOMAINS.has(candidate) ? candidate : null;
};

export const resolveTenantHost = (host: string, rootDomain: string): ResolvedTenantHost => {
  const hostname = normalizeHostname(host);
  const rootHost = normalizeHostname(rootDomain);

  if (!hostname || !rootHost) {
    return {
      kind: "root",
      isTenant: false,
      workspaceSlug: null,
      hostname,
      rootHost
    };
  }

  const previewSlug = extractVercelPreviewSlug(hostname);
  if (previewSlug) {
    return {
      kind: "tenant",
      isTenant: true,
      workspaceSlug: previewSlug,
      hostname,
      rootHost
    };
  }

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === rootHost || hostname === `www.${rootHost}`) {
    return {
      kind: "root",
      isTenant: false,
      workspaceSlug: null,
      hostname,
      rootHost
    };
  }

  if (hostname.endsWith(`.${rootHost}`)) {
    const candidate = hostname.slice(0, -(rootHost.length + 1));
    if (candidate && !candidate.includes(".") && !RESERVED_SUBDOMAINS.has(candidate)) {
      return {
        kind: "tenant",
        isTenant: true,
        workspaceSlug: candidate,
        hostname,
        rootHost
      };
    }
  }

  if (hostname.endsWith(".localhost")) {
    const candidate = hostname.replace(/\.localhost$/, "");
    if (candidate && !candidate.includes(".") && !RESERVED_SUBDOMAINS.has(candidate)) {
      return {
        kind: "tenant",
        isTenant: true,
        workspaceSlug: candidate,
        hostname,
        rootHost
      };
    }
  }

  return {
    kind: "root",
    isTenant: false,
    workspaceSlug: null,
    hostname,
    rootHost
  };
};
