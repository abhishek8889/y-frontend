"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  extractOrganisationSites,
  useGetOrganisationSiteListQuery,
} from "@/apis/organisation/siteApi";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { SiteWorkspace } from "../components/SiteWorkspace";
import { mapOrganisationSite } from "../siteMappers";
import { writeSitesStore } from "../siteStorage";
import type { SiteRecord } from "../siteTypes";

function resolveSiteKey(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return decodeURIComponent(raw[0] ?? "").trim();
  return decodeURIComponent(String(raw ?? "")).trim();
}

export default function ManageSitePage() {
  const router = useRouter();
  const params = useParams<{ uniqueId?: string }>();
  const uniqueKey = resolveSiteKey(params?.uniqueId);

  const { data, isLoading, isError, isFetching } = useGetOrganisationSiteListQuery();
  const [localSite, setLocalSite] = useState<SiteRecord | null>(null);

  const sites = useMemo(
    () => extractOrganisationSites(data).map(mapOrganisationSite),
    [data],
  );

  const siteFromList = useMemo(() => {
    if (!uniqueKey) return null;
    return (
      sites.find((item) => item.uniqueId === uniqueKey) ||
      sites.find((item) => item.id === uniqueKey) ||
      null
    );
  }, [sites, uniqueKey]);

  const site = localSite?.uniqueId === uniqueKey || localSite?.id === uniqueKey
    ? localSite
    : siteFromList;

  useEffect(() => {
    if (siteFromList) {
      setLocalSite(siteFromList);
      writeSitesStore({
        version: 1,
        sites,
        activeSiteId: siteFromList.id,
      });
    }
  }, [siteFromList, sites]);

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (!uniqueKey) {
      router.replace("/site");
      return;
    }
    if (isError) return;
    if (sites.length > 0 && !siteFromList) {
      router.replace("/site");
    }
  }, [isLoading, isFetching, isError, uniqueKey, sites.length, siteFromList, router]);

  function backToList() {
    router.push("/site");
  }

  function handleSiteUpdated(next: SiteRecord) {
    setLocalSite(next);
    writeSitesStore({
      version: 1,
      sites: sites.map((item) => (item.id === next.id ? next : item)),
      activeSiteId: next.id,
    });
  }

  function publishSiteLocal(next: SiteRecord) {
    const updatedAt = new Date().toISOString();
    const published: SiteRecord = {
      ...next,
      status: next.status === "draft" ? "active" : next.status || "active",
      updatedAt,
      brandingComplete: true,
      vercelAdded: next.vercelAdded || next.dnsRecords.length > 0,
    };
    setLocalSite(published);
    writeSitesStore({
      version: 1,
      sites: sites.map((item) => (item.id === published.id ? published : item)),
      activeSiteId: published.id,
    });
  }

  if (isLoading && !site) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="site-loading">Loading site…</div>
      </DashboardShell>
    );
  }

  if (isError && !site) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="page-content site-page-empty">
          <p className="site-loading">Couldn’t load this site. Try again.</p>
          <button
            type="button"
            className="page-secondary-button"
            onClick={backToList}
          >
            ← Sites
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (!site) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="site-loading">Opening site…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
      fillHeight={false}
    >
      <SiteWorkspace
        site={site}
        onBackToList={backToList}
        onPublishedLocal={publishSiteLocal}
        onSiteUpdated={handleSiteUpdated}
      />
    </DashboardShell>
  );
}
