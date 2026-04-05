import { resolveTenantHost } from "./resolveTenantHost";

type EntryRedirectIntentArgs = {
  host: string;
  rootDomain: string;
  pathname: string;
  isAuthenticated: boolean;
};

type RootPassIntent = { kind: "root-pass" };

type LoginRedirectIntent = {
  kind: "login-redirect";
  loginUrl: string;
  workspaceSlug: string;
};

type TenantRewriteIntent = {
  kind: "tenant-rewrite";
  workspaceSlug: string;
  pathname: string;
};

export type EntryRedirectIntent = RootPassIntent | LoginRedirectIntent | TenantRewriteIntent;

const ROOT_LOGIN_PATH = "/login";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
};

const buildRootLoginUrl = (rootDomain: string, workspaceSlug: string) => {
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  const url = new URL(`${protocol}://${rootDomain}${ROOT_LOGIN_PATH}`);
  url.searchParams.set("next", workspaceSlug);
  return url.toString();
};

export const isBypassedPath = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);

  return (
    normalizedPathname.startsWith("/api") ||
    normalizedPathname.startsWith("/_next/static") ||
    normalizedPathname.startsWith("/_next/image") ||
    normalizedPathname === "/favicon.ico" ||
    normalizedPathname === "/sitemap.xml" ||
    normalizedPathname === "/robots.txt"
  );
};

export const getTenantRewritePath = (workspaceSlug: string, pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);
  return trimTrailingSlash(`/_tenant/${workspaceSlug}${normalizedPathname}`);
};

export const getEntryRedirectIntent = ({
  host,
  rootDomain,
  pathname,
  isAuthenticated
}: EntryRedirectIntentArgs): EntryRedirectIntent => {
  const resolvedHost = resolveTenantHost(host, rootDomain);

  if (!resolvedHost.isTenant) {
    return { kind: "root-pass" };
  }

  if (!isAuthenticated) {
    return {
      kind: "login-redirect",
      workspaceSlug: resolvedHost.workspaceSlug,
      loginUrl: buildRootLoginUrl(rootDomain, resolvedHost.workspaceSlug)
    };
  }

  return {
    kind: "tenant-rewrite",
    workspaceSlug: resolvedHost.workspaceSlug,
    pathname: normalizePathname(pathname)
  };
};
