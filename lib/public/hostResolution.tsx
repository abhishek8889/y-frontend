"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { HostResolutionPayload, HostType } from "@/apis/public/resolveHostnameApi";

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

export {
  primaryBanner,
  publicFallbackResolution,
  siteDisplayName,
  siteLogoUrl,
  siteNavigation,
} from "@/lib/public/hostResolutionUtils";
