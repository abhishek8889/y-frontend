import type {
  HostResolutionPayload,
  ResolvedBanner,
  ResolvedNavigationItem,
} from "@/apis/public/resolveHostnameApi";

export function siteLogoUrl(resolution: HostResolutionPayload | null | undefined): string | null {
  const siteLogo = resolution?.site?.logo?.url?.trim();
  if (siteLogo) return siteLogo;
  const orgLogo = resolution?.organisation?.logo?.url?.trim();
  return orgLogo || null;
}

export function siteDisplayName(resolution: HostResolutionPayload | null | undefined): string {
  return (
    resolution?.site?.name?.trim() ||
    resolution?.organisation?.name?.trim() ||
    "Site"
  );
}

export function siteNavigation(
  resolution: HostResolutionPayload | null | undefined,
): ResolvedNavigationItem[] {
  const items = resolution?.site?.navigation;
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.name?.trim() && item?.redirect_link?.trim());
}

export function primaryBanner(
  resolution: HostResolutionPayload | null | undefined,
): ResolvedBanner | null {
  const banners = resolution?.banners;
  if (!Array.isArray(banners) || !banners.length) return null;
  return banners[0] ?? null;
}

/** Default marketplace resolution when server fetch fails on a known public host. */
export function publicFallbackResolution(hostname: string): HostResolutionPayload {
  return {
    host_type: "public",
    hostname,
    organisation: null,
    site: null,
    domain: null,
    banners: [],
  };
}
