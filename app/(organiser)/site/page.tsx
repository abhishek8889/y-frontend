"use client";

import { useEffect, useState } from "react";
import {
  extractCreatedSiteId,
  extractDnsRecords,
  extractHostname,
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
  createWhitelabelSite,
  getActiveSite,
  getMainSite,
  writeSitesStore,
} from "./siteStorage";
import type { SiteKind, SiteRecord, SiteSection, SitesStore } from "./siteTypes";

function emptyStore(): SitesStore {
  return { version: 1, sites: [], activeSiteId: null };
}

export default function SitePage() {
  const { data, isLoading, isError } = useGetOrganisationSiteListQuery();
  const [createSite, { isLoading: isCreating }] = useCreateOrganisationSiteMutation();
  const [store, setStore] = useState<SitesStore>(emptyStore);
  const [createOpen, setCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<SiteKind>("main");
  const [view, setView] = useState<"list" | "manage">("list");
  const [activeSection, setActiveSection] = useState<SiteSection>("Domain");
  const [connectedDomain, setConnectedDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<SiteDnsRecord[]>([]);
  const [dnsRecordsBySiteId, setDnsRecordsBySiteId] = useState<
    Record<string, SiteDnsRecord[]>
  >({});
  const [domainNotice, setDomainNotice] = useState("");
  const [pageNotice, setPageNotice] = useState("");

  const apiSites = data?.data;

  useEffect(() => {
    if (isLoading) return;

    const list = Array.isArray(apiSites) ? apiSites : [];

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

  const list = Array.isArray(apiSites) ? apiSites : [];
  const mappedList = list.map(mapOrganisationSite);
  const activeSite = getActiveSite(store);
  const mainSite = getMainSite(store);
  const hasApiSites = list.length > 0;

  function persist(next: SitesStore) {
    writeSitesStore(next);
    setStore(next);
  }

  function selectSection(section: SiteSection) {
    setActiveSection(section);
    setDomainNotice("");
    setPageNotice("");
  }

  function openCreate() {
    setCreateKind(mainSite || hasApiSites ? "whitelabel" : "main");
    setCreateOpen(true);
  }

  function openWorkspace(siteId: string, site?: SiteRecord) {
    const records = dnsRecordsBySiteId[siteId]?.length
      ? dnsRecordsBySiteId[siteId]
      : site?.dnsRecords ?? [];
    setConnectedDomain(site?.domainHostname ?? "");
    setDnsRecords(records);
    setDomainNotice(
      records.length ? "Add these DNS records at your domain provider." : "",
    );
    setPageNotice("");
    setActiveSection("Domain");
    setView("manage");
  }

  async function createMicrosite(name: string, domain: string) {
    if (createKind === "main") {
      if (mainSite || hasApiSites) return;
      try {
        const result = await createSite({
          name,
          domain,
          site_type: "club",
          site_template_id: null,
        }).unwrap();
        const createdId = extractCreatedSiteId(result);
        const createdSite = result.data?.site
          ? mapOrganisationSite(result.data.site, 0)
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
          persist({
            version: 1,
            sites: [siteWithDomain],
            activeSiteId: createdId,
          });
          if (records.length) {
            setDnsRecordsBySiteId((prev) => ({ ...prev, [createdId]: records }));
          }
          openWorkspace(createdId, siteWithDomain);
          setConnectedDomain(hostname);
          if (records.length) {
            setDnsRecords(records);
            setDomainNotice("Add these DNS records at your domain provider.");
          }
        } else if (createdId) {
          persist({ ...store, activeSiteId: createdId });
          setView("list");
        } else {
          setView("list");
        }
      } catch {
        // Toast handled by mutation middleware.
      }
      return;
    }

    // White label create UI — local draft until WL create API exists.
    const site = createWhitelabelSite(name);
    const next: SitesStore = {
      version: 1,
      sites: [...store.sites, site],
      activeSiteId: site.id,
    };
    persist(next);
    setCreateOpen(false);
    openWorkspace(site.id, { ...site, domainHostname: domain });
    setConnectedDomain(domain);
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

  function backToList() {
    setView("list");
    setPageNotice("");
    setDomainNotice("");
  }

  function handleConnectedDomain(
    domain: string,
    records: SiteDnsRecord[],
    siteId?: string | null,
    domainStatus?: string | null,
  ) {
    setConnectedDomain(domain);
    if (records.length) {
      setDnsRecords(records);
      setDomainNotice("Add these DNS records at your domain provider.");
      if (siteId) {
        setDnsRecordsBySiteId((prev) => ({ ...prev, [siteId]: records }));
      }
    }
    if (siteId) {
      setStore((prev) => {
        const next = {
          ...prev,
          activeSiteId: siteId,
          sites: prev.sites.map((item) =>
            item.id === siteId
              ? {
                  ...item,
                  domainHostname: domain,
                  domainStatus: domainStatus ?? item.domainStatus,
                  dnsRecords: records.length ? records : item.dnsRecords,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        };
        writeSitesStore(next);
        return next;
      });
    }
    setView("manage");
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
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <SiteWorkspace
          site={activeSite}
          activeSection={activeSection}
          connectedDomain={connectedDomain || activeSite.domainHostname || ""}
          dnsRecords={dnsRecords.length ? dnsRecords : activeSite.dnsRecords}
          domainNotice={domainNotice}
          pageNotice={pageNotice}
          onBackToList={hasApiSites ? backToList : undefined}
          onSelectSection={selectSection}
          onConnectedDomain={handleConnectedDomain}
          onPageNotice={setPageNotice}
          onDomainNotice={setDomainNotice}
          onPublished={publishSiteLocal}
        />
      </DashboardShell>
    );
  }

  if (!hasSites) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="page-content site-page-empty">
          <SiteEmptyState onSetup={() => {
            setCreateKind("main");
            setCreateOpen(true);
          }} />
          <CreateMicrositeDialog
            open={createOpen}
            kind={createKind}
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
        kind={createKind}
        creating={isCreating}
        onClose={() => {
          if (!isCreating) setCreateOpen(false);
        }}
        onCreate={createMicrosite}
      />
    </DashboardShell>
  );
}
