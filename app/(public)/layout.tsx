import { headers } from "next/headers";
import {
  fetchResolveHostname,
  normalizeHostnameParam,
} from "@/apis/public/resolveHostnameApi";
import { CustomerSiteShell } from "@/components/public/CustomerSiteShell";
import {
  HostResolutionProvider,
  publicFallbackResolution,
} from "@/lib/public/hostResolution";
import {
  isLikelyMarketplaceHostname,
  resolveRequestHostname,
} from "@/lib/public/resolveRequestHostname";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const hostname = normalizeHostnameParam(
    resolveRequestHostname(headerStore.get("host"), headerStore.get("x-forwarded-host")),
  );

  const resolved = await fetchResolveHostname(hostname);

  let missing = false;
  let resolution = resolved;

  if (!resolution) {
    if (isLikelyMarketplaceHostname(hostname)) {
      resolution = publicFallbackResolution(hostname);
    } else {
      missing = true;
      resolution = publicFallbackResolution(hostname);
    }
  }

  return (
    <HostResolutionProvider resolution={resolution} missing={missing}>
      <CustomerSiteShell>{children}</CustomerSiteShell>
    </HostResolutionProvider>
  );
}
