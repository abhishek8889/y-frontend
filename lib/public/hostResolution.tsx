"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  HostResolutionPayload,
  HostType,
  ResolvedBanner,
  ResolvedNavigationItem,
} from "@/apis/public/resolveHostnameApi";

export type HostResolutionState = {
  status: "ready" | "missing";
  resolution: HostResolutionPayload | null;
};

const HostResolutionContext = createContext<HostResolutionState>({
  status: "ready",
  resolution: null,
});

export function HostResolutionProvider({
  resolution,
  missing = false,
  children,
}: {
  resolution: HostResolutionPayload | null;
  /** True when a custom host could not be resolved (show not-found). */
  missing?: boolean;
  children: ReactNode;
}) {
  const value = useMemo<HostResolutionState>(
    () => ({
      status: missing ? "missing" : "ready",
      resolution,
    }),
    [missing, resolution],
  );

  return (
    <HostResolutionContext.Provider value={value}>{children}</HostResolutionContext.Provider>
  );
}

export function useHostResolution(): HostResolutionState {
  return useContext(HostResolutionContext);
}

export function useHostType(): HostType {
  return useHostResolution().resolution?.host_type ?? "public";
}

export function useIsMicrosite(): boolean {
  return useHostType() === "microsite";
}

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
