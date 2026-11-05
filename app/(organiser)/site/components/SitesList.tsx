"use client";

import { useMemo, useState } from "react";
import {
  extractDnsRecords,
  isApiSiteId,
  usePublishOrganisationSiteMutation,
  useRefreshOrganisationSiteDomainMutation,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import {
  ActionMenu,
  DataTable,
  GridCard,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
  type GridCardItem,
} from "@/components/common";
import { Button } from "@/components/ui/Button";
import {
  formatDnsStatusLabel,
  formatSiteStatusLabel,
  formatSiteUpdatedAt,
  isSiteBrandingComplete,
  mapOrganisationSite,
  siteDisplayStatus,
  siteDnsStatus,
  siteLifecycleStatus,
} from "../siteMappers";
import type { SiteRecord } from "../siteTypes";
import { SiteDnsInstructionsModal } from "./SiteDnsInstructionsModal";

function dnsBadgeProps(site: SiteRecord) {
  const dns = siteDnsStatus(site);
  if (dns === "pending" || dns === "pending_verification") {
    return { status: "pending", label: formatDnsStatusLabel(dns) };
  }
  if (dns === "failed") return { status: "failed", label: formatDnsStatusLabel(dns) };
  if (dns === "active" || dns === "verified") {
    return { status: "active", label: formatDnsStatusLabel(dns) };
  }
  return { status: "draft", label: formatDnsStatusLabel(dns) };
}

function siteBadgeProps(site: SiteRecord) {
  const lifecycle = siteLifecycleStatus(site);
  if (lifecycle === "live") return { status: "active", label: formatSiteStatusLabel(lifecycle) };
  return { status: "draft", label: formatSiteStatusLabel(lifecycle) };
}

type SitesListProps = {
  sites: SiteRecord[];
  dnsRecordsBySiteId?: Record<string, SiteDnsRecord[]>;
  onManageSite: (site: SiteRecord) => void;
  onCreateSite: () => void;
  /** Local-only fallback when the site is not yet backed by the API. */
  onPublishSite?: (site: SiteRecord) => void;
};

const GlobeIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M4 12h16M12 4c2.5 2.8 3.8 5.4 3.8 8s-1.3 5.2-3.8 8c-2.5-2.8-3.8-5.4-3.8-8s1.3-5.2 3.8-8Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

const ExternalIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="12" height="12">
    <path
      d="M6 3.5H3.5A1.5 1.5 0 0 0 2 5v7.5A1.5 1.5 0 0 0 3.5 14H11a1.5 1.5 0 0 0 1.5-1.5V10M9.5 2H14v4.5M8 8l6-6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">
    <path
      d="M13.5 8a5.5 5.5 0 1 1-1.4-3.6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M13.5 3.5v3h-3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PublishIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">
    <path
      d="M8 11.5V3.5M8 3.5 5.25 6.25M8 3.5l2.75 2.75"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function domainLabel(site: SiteRecord) {
  return site.domainHostname?.trim() || "Domain not connected";
}

export function SitesList({
  sites,
  dnsRecordsBySiteId = {},
  onManageSite,
  onCreateSite,
  onPublishSite,
}: SitesListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dnsModal, setDnsModal] = useState<{
    site: SiteRecord;
    records: SiteDnsRecord[];
    fromPublish: boolean;
  } | null>(null);
  const [refreshingSiteId, setRefreshingSiteId] = useState<string | null>(null);
  const [publishingSiteId, setPublishingSiteId] = useState<string | null>(null);
  const [refreshDomain] = useRefreshOrganisationSiteDomainMutation();
  const [publishSite] = usePublishOrganisationSiteMutation();

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sites.filter((site) => {
      const status = siteDisplayStatus(site);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        site.name.toLowerCase().includes(q) ||
        (site.domainHostname ?? "").toLowerCase().includes(q)
      );
    });
  }, [sites, search, statusFilter]);

  const liveCount = sites.filter((site) => siteDisplayStatus(site) === "live").length;
  const draftCount = sites.filter((site) => siteDisplayStatus(site) === "draft").length;
  const domainIssues = sites.filter((site) => {
    const status = siteDisplayStatus(site);
    return status === "pending" || !site.domainHostname;
  }).length;

  const overviewItems: GridCardItem[] = [
    { id: "total", label: "Total sites", value: String(sites.length) },
    { id: "live", label: "Live sites", value: String(liveCount) },
    { id: "draft", label: "Draft sites", value: String(draftCount) },
    { id: "issues", label: "Domain issues", value: String(domainIssues) },
  ];

  const hasListFilters = Boolean(search.trim()) || statusFilter !== "all";

  function dnsFor(site: SiteRecord) {
    const cached = dnsRecordsBySiteId[site.id];
    if (cached?.length) return cached;
    return site.dnsRecords ?? [];
  }

  async function handleRefreshDomain(site: SiteRecord) {
    if (!isApiSiteId(site.id) || refreshingSiteId) return;
    setRefreshingSiteId(site.id);
    try {
      await refreshDomain(site.id).unwrap();
    } catch {
      // Toast handled by mutation
    } finally {
      setRefreshingSiteId(null);
    }
  }

  async function handlePublishSite(site: SiteRecord) {
    if (siteLifecycleStatus(site) !== "draft" || publishingSiteId) return;
    if (!isSiteBrandingComplete(site)) return;

    if (!isApiSiteId(site.id)) {
      onPublishSite?.(site);
      return;
    }

    setPublishingSiteId(site.id);
    try {
      const result = await publishSite(site.id).unwrap();
      const records = extractDnsRecords(result);
      const mapped = result.data?.site
        ? mapOrganisationSite(result.data.site)
        : site;
      const nextSite: SiteRecord = {
        ...mapped,
        status: mapped.status || "active",
        dnsRecords: records.length ? records : mapped.dnsRecords,
        vercelAdded: records.length ? true : mapped.vercelAdded,
      };
      onPublishSite?.(nextSite);
      setDnsModal({
        site: nextSite,
        records: nextSite.dnsRecords,
        fromPublish: true,
      });
    } catch {
      // Toast handled by mutation
    } finally {
      setPublishingSiteId(null);
    }
  }

  function openDnsModal(site: SiteRecord, fromPublish = false) {
    setDnsModal({
      site,
      records: dnsFor(site),
      fromPublish,
    });
  }

  function menuActionsFor(site: SiteRecord): ActionMenuItem<SiteRecord>[] {
    const records = dnsFor(site);
    const isDraft = siteLifecycleStatus(site) === "draft";
    const isPublished = siteLifecycleStatus(site) === "live";
    const brandingComplete = isSiteBrandingComplete(site);
    const canViewDns = isPublished && (Boolean(site.domainHostname) || records.length > 0);
    const canRefreshDomain = isPublished && isApiSiteId(site.id) && !refreshingSiteId;
    const canViewWebsite = isPublished && Boolean(site.domainHostname);
    const isPublishing = publishingSiteId === site.id;

    return [
      {
        key: "manage",
        label: "Manage site",
        icon: GlobeIcon,
        onClick: (row) => onManageSite(row),
      },
      {
        key: "publish",
        label: isPublishing
          ? "Publishing…"
          : brandingComplete
            ? "Publish"
            : "Publish (branding incomplete)",
        icon: PublishIcon,
        hidden: !isDraft,
        disabled: isPublishing || !brandingComplete,
        onClick: (row) => {
          void handlePublishSite(row);
        },
      },
      {
        key: "dns",
        label: "View DNS",
        icon: GlobeIcon,
        disabled: !canViewDns,
        onClick: (row) => openDnsModal(row),
      },
      {
        key: "refresh",
        label: refreshingSiteId === site.id ? "Refreshing…" : "Refresh domain",
        icon: RefreshIcon,
        disabled: !canRefreshDomain,
        hidden: !isApiSiteId(site.id),
        onClick: (row) => {
          void handleRefreshDomain(row);
        },
      },
      {
        key: "view",
        label: "View website",
        icon: ExternalIcon,
        disabled: !canViewWebsite,
        onClick: (row) => {
          if (!row.domainHostname || siteLifecycleStatus(row) !== "live") return;
          window.open(`https://${row.domainHostname}`, "_blank", "noopener,noreferrer");
        },
      },
    ];
  }

  const columns = useMemo<DataTableColumn<SiteRecord>[]>(
    () => [
      {
        id: "name",
        header: "MICROSITE",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="datatable-venue-cell">
            <div className="datatable-venue-thumb sites-list-thumb" aria-hidden="true">
              {GlobeIcon}
            </div>
            <span className="datatable-venue-name">{row.name}</span>
          </div>
        ),
      },
      {
        id: "domain",
        header: "DOMAIN",
        cell: ({ row }) => {
          const domain = domainLabel(row);
          const isLive = siteLifecycleStatus(row) === "live" && Boolean(row.domainHostname);

          return (
            <span className="sites-list-domain-cell">
              <span className="text-[12px] font-normal leading-5 text-black">{domain}</span>
              {isLive ? (
                <a
                  href={`https://${row.domainHostname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sites-list-domain-link"
                  aria-label={`Open ${row.domainHostname}`}
                >
                  {ExternalIcon}
                </a>
              ) : null}
            </span>
          );
        },
      },
      {
        id: "dnsStatus",
        header: "DNS STATUS",
        cell: ({ row }) => (
          <StatusBadge {...dnsBadgeProps(row)} className="datatable-status" />
        ),
      },
      {
        id: "siteStatus",
        header: "SITE STATUS",
        cell: ({ row }) => (
          <StatusBadge {...siteBadgeProps(row)} className="datatable-status" />
        ),
      },
      {
        id: "updatedAt",
        header: "LAST UPDATED",
        cell: ({ row }) => (
          <span className="text-[12px] font-normal leading-5 text-black">
            {formatSiteUpdatedAt(row.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "ACTION",
        align: "center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={menuActionsFor(row)}
            open={openMenuId === row.id}
            onOpenChange={(open) => setOpenMenuId(open ? row.id : null)}
            ariaLabel={`Actions for ${row.name}`}
          />
        ),
      },
    ],
    // menuActionsFor closes over publish/refresh/dns state — refresh columns when those change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openMenuId, publishingSiteId, refreshingSiteId, dnsRecordsBySiteId],
  );

  return (
    <div className="page-content sites-list-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Sites</h1>
          <p className="page-subtitle">Manage your microsites.</p>
        </div>
        <Button type="button" className="page-primary-button-action" onClick={onCreateSite}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="12" height="12">
            <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Create microsite
        </Button>
      </div>

      <div className="sites-list-overview">
        <GridCard items={overviewItems} columns={4} />
      </div>

      <DataTable
        columns={columns}
        data={filteredSites}
        getRowId={(row) => row.id}
        features={{
          search: true,
          filters: true,
          pagination: false,
          pageSize: false,
        }}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search sites or domains...",
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            value: statusFilter,
            options: [
              { value: "all", label: "All statuses" },
              { value: "live", label: "Live" },
              { value: "draft", label: "Draft" },
              { value: "pending", label: "Pending DNS" },
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value);
        }}
        emptyState={{
          title: hasListFilters ? "NO MICROSITES FOUND" : "NO MICROSITES YET",
          subtitle: hasListFilters
            ? "Try adjusting your search or filters."
            : "Create one to get started.",
          showButton: !hasListFilters,
          buttonLabel: "+ CREATE MICROSITE",
          onButtonClick: onCreateSite,
        }}
        bodyHeightClassName={false}
      />

      <SiteDnsInstructionsModal
        open={Boolean(dnsModal)}
        hostname={dnsModal?.site.domainHostname}
        status={dnsModal?.site.domainStatus}
        records={dnsModal?.records ?? []}
        notice={
          dnsModal?.fromPublish
            ? "After closing this popup, you can see your DNS records in Domain & Identity on the site detail page."
            : null
        }
        primaryLabel={dnsModal ? "Manage site" : undefined}
        onPrimary={
          dnsModal
            ? () => {
                const site = dnsModal.site;
                setDnsModal(null);
                onManageSite(site);
              }
            : undefined
        }
        onClose={() => setDnsModal(null)}
      />
    </div>
  );
}
