"use client";

import { useEffect, useState } from "react";
import {
  extractCreatedSiteId,
  extractDnsRecords,
  extractHostname,
  extractOrganisationSites,
  useCreateOrganisationSiteMutation,
  useGetOrganisationSiteListQuery,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { CreateMicrositeDialog } from "./components/CreateMicrositeDialog";
import { SiteEmptyState } from "./components/SiteEmptyState";
import { SitesList } from "./components/SitesList";
import { SiteWorkspace } from "./components/SiteWorkspace";
import { mapOrganisationSite } from "./siteMappers";
import {
  clearSitesStore,
  getActiveSite,
  writeSitesStore,
} from "./siteStorage";
import type { SiteRecord, SitesStore } from "./siteTypes";

function emptyStore(): SitesStore {
  return { version: 1, sites: [], activeSiteId: null };
}

export default function SitePage() {
  const { data, isLoading, isError } = useGetOrganisationSiteListQuery();
  const [createSite, { isLoading: isCreating }] = useCreateOrganisationSiteMutation();
  const [store, setStore] = useState<SitesStore>(emptyStore);
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"list" | "manage">("list");
  const [dnsRecordsBySiteId, setDnsRecordsBySiteId] = useState<
    Record<string, SiteDnsRecord[]>
  >({});

  const apiSites = extractOrganisationSites(data);

  useEffect(() => {
    if (isLoading) return;

    const list = apiSites;

    if (list.length > 0) {
      const sites = list.map(mapOrganisationSite);
      setStore((prev) => {
        const next: SitesStore = {
          version: 1,
          sites,
          activeSiteId:
            prev.activeSiteId && sites.some((s) => s.id === prev.activeSiteId)
              ? prev.activeSiteId
              : sites[0]?.id ?? null,
        };
        writeSitesStore(next);
        return next;
      });
      setDnsRecordsBySiteId((prev) => {
        const next = { ...prev };
        for (const site of sites) {
          if (site.dnsRecords.length && !next[site.id]?.length) {
            next[site.id] = site.dnsRecords;
          }
        }
        return next;
      });
      return;
    }

    // Keep optimistic create until list refetch lands; only clear a truly empty start.
    setStore((prev) => {
      if (prev.sites.length > 0) return prev;
      clearSitesStore();
      return emptyStore();
    });
  }, [apiSites, isLoading]);

  const mappedList = apiSites.map(mapOrganisationSite);
  const activeSite = getActiveSite(store);

  function persist(next: SitesStore) {
    writeSitesStore(next);
    setStore(next);
  }

  function openCreate() {
    setCreateOpen(true);
  }

  function openWorkspace(siteId: string, site?: SiteRecord) {
    const records = dnsRecordsBySiteId[siteId]?.length
      ? dnsRecordsBySiteId[siteId]
      : site?.dnsRecords ?? [];
    if (records.length && siteId) {
      setDnsRecordsBySiteId((prev) =>
        prev[siteId]?.length ? prev : { ...prev, [siteId]: records },
      );
    }
    setView("manage");
  }

  async function createMicrosite(name: string, domain: string) {
    try {
      const result = await createSite({
        name,
        hostname: domain,
        template_id: null,
      }).unwrap();
      const createdId = extractCreatedSiteId(result);
      const createdSite = result.data?.site
        ? mapOrganisationSite(result.data.site)
        : null;
      const records = extractDnsRecords(result);
      const hostname = extractHostname(result, domain);
      setCreateOpen(false);

      if (createdId && createdSite) {
        const siteWithDomain: SiteRecord = {
          ...createdSite,
          domainHostname: createdSite.domainHostname || hostname,
          dnsRecords: createdSite.dnsRecords.length ? createdSite.dnsRecords : records,
        };
        const withoutDup = store.sites.filter((item) => item.id !== createdId);
        persist({
          version: 1,
          sites: [...withoutDup, siteWithDomain],
          activeSiteId: createdId,
        });
        if (records.length) {
          setDnsRecordsBySiteId((prev) => ({ ...prev, [createdId]: records }));
        }
        openWorkspace(createdId, siteWithDomain);
        return;
      }

      if (createdId) {
        persist({ ...store, activeSiteId: createdId });
      }
      setView("list");
    } catch {
      // Toast handled by mutation — keep dialog open so the user can fix validation errors.
    }
  }

  function manageSite(site: SiteRecord) {
    persist({
      ...store,
      activeSiteId: site.id,
    });
    openWorkspace(site.id, site);
  }

  function publishSiteLocal(site: SiteRecord) {
    const updatedAt = new Date().toISOString();
    persist({
      ...store,
      sites: store.sites.map((item) =>
        item.id === site.id
          ? { ...item, status: "active", updatedAt, brandingComplete: true }
          : item,
      ),
    });
  }

  function handleSiteUpdated(site: SiteRecord) {
    persist({
      ...store,
      sites: store.sites.map((item) => (item.id === site.id ? site : item)),
      activeSiteId: site.id,
    });
  }

  function backToList() {
    setView("list");
  }

  if (isLoading) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="site-loading">Loading sites…</div>
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="page-content site-page-empty">
          <p className="site-loading">Couldn’t load sites. Try again.</p>
        </div>
      </DashboardShell>
    );
  }

  const visibleSites = mappedList.length ? mappedList : store.sites;
  const hasSites = visibleSites.length > 0;

  if (view === "manage" && activeSite) {
    return (
      <DashboardShell
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        fillHeight={false}
      >
        <SiteWorkspace
          site={activeSite}
          onBackToList={backToList}
          onPublishedLocal={publishSiteLocal}
          onSiteUpdated={handleSiteUpdated}
        />
      </DashboardShell>
    );
  }

  if (!hasSites) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="page-content site-page-empty">
          <SiteEmptyState onSetup={openCreate} />
          <CreateMicrositeDialog
            open={createOpen}
            creating={isCreating}
            onClose={() => {
              if (!isCreating) setCreateOpen(false);
            }}
            onCreate={createMicrosite}
          />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <SitesList
        sites={visibleSites}
        dnsRecordsBySiteId={dnsRecordsBySiteId}
        onManageSite={manageSite}
        onCreateSite={openCreate}
        onPublishSite={publishSiteLocal}
      />
      <CreateMicrositeDialog
        open={createOpen}
        creating={isCreating}
        onClose={() => {
          if (!isCreating) setCreateOpen(false);
        }}
        onCreate={createMicrosite}
      />
    </DashboardShell>
  );
}
