"use client";

import { useState } from "react";
import {
  isApiSiteId,
  usePublishOrganisationSiteMutation,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import AboutUsTab from "../tabs/AboutUsTab";
import BrandingTab from "../tabs/BrandingTab";
import ContactUsTab from "../tabs/ContactUsTab";
import DomainTab from "../tabs/DomainTab";
import EventsTab from "../tabs/EventsTab";
import HeroSectionTab from "../tabs/HeroSectionTab";
import NewsTab from "../tabs/NewsTab";
import {
  isSiteBrandingComplete,
  siteDisplayStatus,
  siteLifecycleStatus,
} from "../siteMappers";
import { SITE_SECTIONS, type SiteRecord, type SiteSection } from "../siteTypes";

type SiteWorkspaceProps = {
  site: SiteRecord;
  activeSection: SiteSection;
  connectedDomain: string;
  dnsRecords: SiteDnsRecord[];
  domainNotice: string;
  pageNotice: string;
  onBackToList?: () => void;
  onSelectSection: (section: SiteSection) => void;
  onConnectedDomain: (
    domain: string,
    dnsRecords: SiteDnsRecord[],
    siteId?: string | null,
    domainStatus?: string | null,
  ) => void;
  onPageNotice: (notice: string) => void;
  onDomainNotice: (notice: string) => void;
  onPublished?: (site: SiteRecord) => void;
};

const VisitIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
    <path
      d="M6 3.5H3.5A1.5 1.5 0 0 0 2 5v7.5A1.5 1.5 0 0 0 3.5 14H11a1.5 1.5 0 0 0 1.5-1.5V10M9.5 2H14v4.5M8 8l6-6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function ConnectivityStatus({
  connectedDomain,
  displayStatus,
}: {
  connectedDomain: string;
  displayStatus: string;
}) {
  const isLive =
    displayStatus === "live" ||
    displayStatus === "verified" ||
    displayStatus === "active";
  const isPending =
    displayStatus === "pending" ||
    displayStatus === "pending_dns" ||
    Boolean(connectedDomain && !isLive);

  const label = isLive ? "Live" : isPending ? "Pending" : "Offline";

  return (
    <span className="site-connectivity" role="status" aria-label={label}>
      <span
        className={[
          "site-status-dot",
          isLive
            ? "site-status-dot-ok site-status-dot-live"
            : isPending
              ? "site-status-dot-warn"
              : "site-status-dot-bad",
        ].join(" ")}
        aria-hidden="true"
      />
      <span className={isLive ? "site-connectivity-live-label" : undefined}>
        {label}
      </span>
    </span>
  );
}

export function SiteWorkspace({
  site,
  activeSection,
  connectedDomain,
  dnsRecords,
  domainNotice,
  pageNotice,
  onBackToList,
  onSelectSection,
  onConnectedDomain,
  onPageNotice,
  onDomainNotice: _onDomainNotice,
  onPublished,
}: SiteWorkspaceProps) {
  const [publishing, setPublishing] = useState(false);
  const [publishSite] = usePublishOrganisationSiteMutation();
  const kindLabel = site.kind === "main" ? "Clubsite" : "White label";
  const hostname = connectedDomain || site.domainHostname || "";
  const displayStatus = siteDisplayStatus({
    ...site,
    domainHostname: hostname || site.domainHostname,
  });
  const isDraft = siteLifecycleStatus(site) === "draft";
  const isPublished = siteLifecycleStatus(site) === "live";
  const isLive =
    displayStatus === "live" ||
    displayStatus === "verified" ||
    displayStatus === "active";
  const brandingComplete = isSiteBrandingComplete(site);
  const canPublish = isDraft && brandingComplete;
  const canPreview = Boolean(hostname);
  const showVisit = isPublished && isLive && Boolean(hostname);

  function handlePreview() {
    if (!canPreview) {
      onPageNotice("Connect a domain before previewing the site.");
      return;
    }
    window.open(`https://${hostname}`, "_blank", "noopener,noreferrer");
  }

  function handleVisit() {
    if (!showVisit) return;
    window.open(`https://${hostname}`, "_blank", "noopener,noreferrer");
  }

  async function handlePublish() {
    if (!isDraft || publishing) return;

    if (!brandingComplete) {
      onPageNotice("Complete branding first: save logo & favicon, header, and footer.");
      return;
    }

    if (!isApiSiteId(site.id)) {
      onPublished?.(site);
      onPageNotice("Site published.");
      return;
    }

    setPublishing(true);
    try {
      await publishSite(site.id).unwrap();
      onPublished?.(site);
      onPageNotice("Site published.");
    } catch {
      // Toast handled by mutation
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="site-workspace">
      <aside className="site-sidebar" aria-label="Site sections">
        <nav className="site-sidebar-nav">
          {onBackToList ? (
            <button type="button" className="site-sidebar-back" onClick={onBackToList}>
              ← All sites
            </button>
          ) : null}
          {SITE_SECTIONS.map((section) => (
            <button
              key={section}
              type="button"
              aria-current={activeSection === section ? "page" : undefined}
              onClick={() => onSelectSection(section)}
              className={[
                "site-sidebar-item",
                activeSection === section ? "site-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <div className="site-main">
        <header className="site-toolbar">
          <div className="site-toolbar-identity page-header-text">
            <div className="site-toolbar-heading-row">
              <h1 className="page-title">{kindLabel}</h1>
              {site.kind === "whitelabel" ? (
                <span className="site-kind-badge site-kind-badge--whitelabel">White label</span>
              ) : null}
            </div>
            <p className="page-subtitle">{site.name}</p>
          </div>

          <div className="site-toolbar-actions">
            <ConnectivityStatus
              connectedDomain={hostname}
              displayStatus={displayStatus}
            />
            <Button
              type="button"
              onClick={handlePreview}
              className="page-secondary-button site-toolbar-preview"
            >
              Preview
            </Button>
            {isDraft ? (
              <Button
                type="button"
                className="page-primary-button-action"
                disabled={publishing || !canPublish}
                title={
                  canPublish
                    ? "Publish site"
                    : "Complete branding (logo & favicon, header, footer) before publishing"
                }
                onClick={() => {
                  void handlePublish();
                }}
              >
                {publishing ? "Publishing…" : "Publish"}
              </Button>
            ) : null}
            {showVisit ? (
              <button
                type="button"
                className="site-toolbar-visit"
                onClick={handleVisit}
                aria-label={`Visit ${hostname}`}
                title={`Visit ${hostname}`}
              >
                {VisitIcon}
              </button>
            ) : null}
          </div>
        </header>

        <section
          className="site-panel"
          aria-label={
            activeSection === "News"
              ? "Site news"
              : activeSection === "Contact"
                ? "Site contact page"
                : `Site ${activeSection}`
          }
        >
          <div className="site-mobile-nav">
            <SelectField
              id="site-section-select"
              aria-label="Site section"
              labelClassName="input-heading"
              value={activeSection}
              onChange={(event) => onSelectSection(event.target.value as SiteSection)}
              options={SITE_SECTIONS.map((section) => ({ value: section, label: section }))}
            />
          </div>

          {pageNotice ? (
            <p role="status" className="site-notice">
              {pageNotice}
            </p>
          ) : null}

          <div hidden={activeSection !== "Domain"}>
            <DomainTab
              siteId={site.id}
              siteName={site.name}
              connectedDomain={connectedDomain}
              dnsRecords={dnsRecords}
              onConnected={onConnectedDomain}
              notice={domainNotice}
            />
          </div>
          <div hidden={activeSection !== "Branding"}>
            <BrandingTab site={site} />
          </div>
          <div hidden={activeSection !== "Hero Section"}>
            <HeroSectionTab />
          </div>
          <div hidden={activeSection !== "About Us"}>
            <AboutUsTab />
          </div>
          <div hidden={activeSection !== "Events"}>
            <EventsTab />
          </div>
          <div hidden={activeSection !== "News"}>
            <NewsTab />
          </div>
          <div hidden={activeSection !== "Contact"}>
            <ContactUsTab />
          </div>
        </section>
      </div>
    </div>
  );
}
