"use client";

import type { ReactNode } from "react";
import { MicrositeFooter } from "@/components/microsite/MicrositeFooter";
import { MicrositeHeader } from "@/components/microsite/MicrositeHeader";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useHostResolution, useIsMicrosite } from "@/lib/public/hostResolution";

function SiteMissing({ hostname }: { hostname?: string }) {
  return (
    <div className="public-site flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <h1 className="font-heading text-[28px] uppercase tracking-[0.06em]">Site not found</h1>
      <p className="mt-3 max-w-md text-[14px] leading-5 text-black/70">
        No published microsite is connected
        {hostname ? ` to ${hostname}` : " to this domain"}.
      </p>
    </div>
  );
}

/**
 * Picks public vs microsite chrome from resolve-hostname.
 */
export function CustomerSiteShell({ children }: { children: ReactNode }) {
  const { status, resolution } = useHostResolution();
  const isMicrosite = useIsMicrosite();

  if (status === "missing") {
    return <SiteMissing hostname={resolution?.hostname} />;
  }

  if (isMicrosite) {
    return (
      <div className="public-site microsite-site flex min-h-screen flex-col bg-white text-black">
        <MicrositeHeader />
        <div className="flex flex-col">{children}</div>
        <MicrositeFooter />
      </div>
    );
  }

  return (
    <div className="public-site flex min-h-screen flex-col bg-white text-black">
      <PublicSiteHeader />
      <div className="flex flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
