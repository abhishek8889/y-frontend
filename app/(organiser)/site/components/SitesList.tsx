"use client";

import { useMemo, useState } from "react";
import {
  formatDomainStatusLabel,
  isApiSiteId,
  usePublishOrganisationSiteMutation,
  useRefreshOrganisationSiteDomainMutation,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import {
  ActionMenu,
  GridCard,
  StatusBadge,
  type ActionMenuItem,
  type GridCardItem,
} from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import {
  formatDnsStatusLabel,
  formatSiteStatusLabel,
  formatSiteUpdatedAt,
  isSiteBrandingComplete,
  siteDisplayStatus,
  siteDnsStatus,
  siteLifecycleStatus,
} from "../siteMappers";
import type { SiteRecord } from "../siteTypes";
import { SiteDnsRecordsTable } from "./SiteDnsRecordsTable";

function domainStatusBadgeProps(status: string | null | undefined) {
  const raw = String(status ?? "").trim().toLowerCase();
  if (raw === "pending_dns" || raw === "pending") {
    return { status: "pending", label: formatDomainStatusLabel(status) };
  }
  if (raw === "failed" || raw === "error") {
    return { status: "failed", label: formatDomainStatusLabel(status) };
  }
  if (raw === "verified" || raw === "active" || raw === "live") {
    return { status: "active", label: formatDomainStatusLabel(status) };
  }
  return { status: status || "draft", label: formatDomainStatusLabel(status) };
}

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

type SiteCardProps = {
  site: SiteRecord;
  featured?: boolean;
  menuOpen: boolean;
  actions: ActionMenuItem<SiteRecord>[];
  publishing?: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onPublish?: (site: SiteRecord) => void;
};

function SiteCard({
  site,
  featured = false,
  menuOpen,
  actions,
  publishing = false,
  onMenuOpenChange,
  onPublish,
}: SiteCardProps) {
  const domain = domainLabel(site);
  const isDraft = siteLifecycleStatus(site) === "draft";
  const canPublish = isDraft && isSiteBrandingComplete(site);

  return (
    <article className={featured ? "sites-card sites-card--featured" : "sites-card"}>
      <div className="sites-card-main">
        <div className="sites-card-icon" aria-hidden="true">
          {GlobeIcon}
        </div>
        <div className="sites-card-identity">
          <p className="sites-card-kind">Microsite</p>
          <h3 className="sites-card-title">{site.name}</h3>
        </div>
      </div>

      <div className="sites-card-meta">
        <div className="sites-card-meta-item">
          <span className="sites-card-meta-label">Domain</span>
          <span className="sites-card-meta-value">
            {domain}
            {site.domainHostname && siteLifecycleStatus(site) === "live" ? (
              <a
                href={`https://${site.domainHostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sites-card-external"
                aria-label={`Open ${site.domainHostname}`}
              >
                {ExternalIcon}
              </a>
            ) : null}
          </span>
        </div>
        <div className="sites-card-meta-item">
          <span className="sites-card-meta-label">DNS status</span>
          <StatusBadge {...dnsBadgeProps(site)} className="sites-card-status" />
        </div>
        <div className="sites-card-meta-item">
          <span className="sites-card-meta-label">Site status</span>
          <StatusBadge {...siteBadgeProps(site)} className="sites-card-status" />
        </div>
        <div className="sites-card-meta-item">
          <span className="sites-card-meta-label">Last updated</span>
          <span className="sites-card-meta-value">{formatSiteUpdatedAt(site.updatedAt)}</span>
        </div>
      </div>

      <div className="sites-card-actions">
        {isDraft && onPublish ? (
          <Button
            type="button"
            className="sites-card-publish-btn"
            disabled={publishing || !canPublish}
            title={
              canPublish
                ? "Publish site"
                : "Complete branding (logo and navigation) before publishing"
            }
            onClick={() => onPublish(site)}
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        <ActionMenu
          row={site}
          actions={actions}
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          align="right"
          ariaLabel={`Actions for ${site.name}`}
        />
      </div>
    </article>
  );
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
  const [dnsSite, setDnsSite] = useState<SiteRecord | null>(null);
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
      await publishSite(site.id).unwrap();
    } catch {
      // Toast handled by mutation
    } finally {
      setPublishingSiteId(null);
    }
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
        onClick: (row) => setDnsSite(row),
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

  const dnsModalRecords = dnsSite ? dnsFor(dnsSite) : [];
  const dnsModalHostname = dnsSite?.domainHostname || "";
  const dnsModalStatus = dnsSite?.domainStatus || null;

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

      <div className="sites-list-toolbar">
        <div className="sites-list-search">
          <InputField
            id="sites-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sites or domains..."
            labelClassName="input-heading"
          />
        </div>
        <SelectField
          id="sites-status-filter"
          aria-label="Filter by status"
          labelClassName="input-heading"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "live", label: "Live" },
            { value: "draft", label: "Draft" },
            { value: "pending", label: "Pending DNS" },
          ]}
        />
      </div>

      <section className="sites-list-section" aria-label="Microsites">
        <div className="sites-list-section-header">
          <h2 className="section-title">Microsites</h2>
          <span className="sites-list-section-note">{filteredSites.length}</span>
        </div>
        {filteredSites.length ? (
          <div className="sites-list-grid">
            {filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                menuOpen={openMenuId === site.id}
                actions={menuActionsFor(site)}
                publishing={publishingSiteId === site.id}
                onMenuOpenChange={(open) => setOpenMenuId(open ? site.id : null)}
                onPublish={(row) => {
                  void handlePublishSite(row);
                }}
              />
            ))}
          </div>
        ) : (
          <p className="page-subtitle sites-list-empty">
            {sites.length
              ? "No microsites match your filters."
              : "No microsites yet. Create one to get started."}
          </p>
        )}
      </section>

      <OrganiserModal
        open={Boolean(dnsSite)}
        onClose={() => setDnsSite(null)}
        showClose
        titleId="sites-dns-title"
        size="lg"
        panelClassName="sites-dns-modal-panel"
      >
        <div className="sites-dns-modal">
          <header className="sites-dns-modal-header">
            <p className="sites-dns-modal-eyebrow">DNS setup</p>
            <h2 id="sites-dns-title" className="page-title">
              DNS records
            </h2>
            <p className="page-subtitle">
              {dnsModalHostname
                ? `Add these records at your provider for ${dnsModalHostname}.`
                : "DNS records for this site."}
            </p>
            {dnsModalStatus ? (
              <div className="sites-dns-modal-status">
                <StatusBadge
                  {...domainStatusBadgeProps(dnsModalStatus)}
                  className="sites-card-status"
                />
              </div>
            ) : null}
          </header>
          <div className="sites-dns-modal-body">
            <SiteDnsRecordsTable records={dnsModalRecords} />
          </div>
          <div className="sites-dns-modal-footer">
            <Button
              type="button"
              className="form-footer-btn form-footer-btn-secondary"
              onClick={() => setDnsSite(null)}
            >
              Close
            </Button>
            {dnsSite ? (
              <Button
                type="button"
                className="form-footer-btn form-footer-btn-primary"
                onClick={() => {
                  const site = dnsSite;
                  setDnsSite(null);
                  onManageSite(site);
                }}
              >
                Manage site
              </Button>
            ) : null}
          </div>
        </div>
      </OrganiserModal>
    </div>
  );
}
