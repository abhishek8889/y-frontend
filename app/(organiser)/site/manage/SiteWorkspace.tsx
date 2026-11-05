"use client";

import { StatusBadge } from "@/components/common";
import { SiteDnsInstructionsModal } from "../components/SiteDnsInstructionsModal";
import {
  formatDnsStatusLabel,
  siteDnsStatus,
} from "../siteMappers";
import type { SiteRecord } from "../siteTypes";
import "../workspace/site-manage.css";
import { ContentArea } from "./content/ContentArea";
import { ReviewPanel } from "./review/ReviewPanel";
import { SettingsArea } from "./settings/SettingsArea";
import { MAIN_TABS } from "./types";
import { useSiteManageDraft } from "./useSiteManageDraft";
import { WebsiteArea } from "./website/WebsiteArea";

type SiteWorkspaceProps = {
  site: SiteRecord;
  onBackToList?: () => void;
  onPublishedLocal?: (site: SiteRecord) => void;
  onSiteUpdated?: (site: SiteRecord) => void;
};

function domainStatusBadgeProps(site: SiteRecord) {
  const dns = siteDnsStatus(site);
  if (dns === "pending" || dns === "pending_verification") {
    return { status: "pending", label: formatDnsStatusLabel(dns) };
  }
  if (dns === "failed") {
    return { status: "failed", label: formatDnsStatusLabel(dns) };
  }
  if (dns === "active" || dns === "verified") {
    return { status: "active", label: formatDnsStatusLabel(dns) };
  }
  if (dns === "not_connected") {
    return { status: "draft", label: formatDnsStatusLabel(dns) };
  }
  return { status: "draft", label: formatDnsStatusLabel(dns) };
}

export function SiteWorkspace({
  site,
  onBackToList,
  onPublishedLocal,
  onSiteUpdated,
}: SiteWorkspaceProps) {
  const manage = useSiteManageDraft(site, onPublishedLocal, onSiteUpdated);
  const {
    preview,
    checklist,
    mainTab,
    setMainTab,
    reviewOpen,
    setReviewOpen,
    publishWebsite,
    isPublishing,
    dnsModal,
    closeDnsModal,
  } = manage;

  const domainBadge = domainStatusBadgeProps(manage.site);

  return (
    <div className="csp csp-surface">
      <header className="site-toolbar csp-toolbar">
        <div className="site-toolbar-identity page-header-text">
          {onBackToList ? (
            <button
              type="button"
              className="csp-toolbar-back"
              onClick={onBackToList}
            >
              ← Sites
            </button>
          ) : null}
          <div className="site-toolbar-heading-row">
            <h1 className="page-title">Microsite</h1>
            <StatusBadge
              status={domainBadge.status}
              label={domainBadge.label}
              className="csp-toolbar-domain-status"
            />
          </div>
          <p className="page-subtitle csp-toolbar-brand">{preview.brandName}</p>
        </div>
        <div className="site-toolbar-actions">
          <button
            type="button"
            className="page-primary-button-action"
            disabled={isPublishing}
            onClick={() => {
              void publishWebsite();
            }}
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      <div className="form-tabs-bar csp-tabs-bar csp-tabs-bar--sticky">
        <nav className="form-tabs-nav" aria-label="Microsite areas">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={["form-tab", mainTab === tab ? "form-tab-active" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-current={mainTab === tab ? "page" : undefined}
              onClick={() => {
                setMainTab(tab);
                setReviewOpen(false);
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="csp-body site-panel">
        {mainTab === "Website" ? (
          <WebsiteArea
            site={manage.site}
            draft={manage.draft}
            events={manage.events}
            eventsLoading={manage.eventsLoading}
            eventsError={manage.eventsError}
            eventsFetchingMore={manage.eventsFetchingMore}
            eventsHasMore={manage.eventsHasMore}
            loadMoreEvents={manage.loadMoreEvents}
            preview={manage.preview}
            selectedEvent={manage.selectedEvent}
            websitePanel={manage.websitePanel}
            setWebsitePanel={manage.setWebsitePanel}
            update={manage.update}
            uploadLogo={manage.uploadLogo}
            clearLogo={manage.clearLogo}
            uploadingLogo={manage.uploadingLogo}
            uploadBanner={manage.uploadBanner}
            clearBannerImage={manage.clearBannerImage}
            uploadingBanner={manage.uploadingBanner}
            saveBannerCta={manage.saveBannerCta}
            isSavingBanner={manage.isSavingBanner}
            saveCategories={manage.saveCategories}
            isSavingCategories={manage.isSavingCategories}
            saveHeaderFooter={manage.saveHeaderFooter}
            isSavingHeader={manage.isSavingHeader}
            addNavItem={manage.addNavItem}
            updateNavItem={manage.updateNavItem}
            removeNavItem={manage.removeNavItem}
            toggleIncluded={manage.toggleIncluded}
          />
        ) : null}

        {mainTab === "Content" ? (
          <ContentArea
            site={manage.site}
            draft={manage.draft}
            editingAbout={manage.editingAbout}
            contentPanel={manage.contentPanel}
            setContentPanel={manage.setContentPanel}
            update={manage.update}
          />
        ) : null}

        {mainTab === "Domain & Identity" ? (
          <SettingsArea
            site={manage.site}
            draft={manage.draft}
            update={manage.update}
            saveDomain={manage.saveDomain}
            isSavingDomain={manage.isSavingDomain}
          />
        ) : null}

        {reviewOpen ? (
          <ReviewPanel
            draft={manage.draft}
            preview={manage.preview}
            checklist={manage.checklist}
            setReviewOpen={manage.setReviewOpen}
            publishWebsite={manage.publishWebsite}
            isPublishing={manage.isPublishing}
          />
        ) : null}
      </div>

      <SiteDnsInstructionsModal
        open={Boolean(dnsModal)}
        hostname={dnsModal?.hostname}
        status={dnsModal?.status}
        records={dnsModal?.records ?? []}
        notice="After closing this popup, you can see your DNS records in Domain & Identity on this site."
        primaryLabel="Open Domain & Identity"
        onPrimary={() => {
          closeDnsModal();
          setMainTab("Domain & Identity");
          setReviewOpen(false);
        }}
        onClose={closeDnsModal}
      />
    </div>
  );
}
