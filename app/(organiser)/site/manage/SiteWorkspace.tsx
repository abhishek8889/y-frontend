"use client";

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

export function SiteWorkspace({
  site,
  onBackToList,
  onPublishedLocal,
  onSiteUpdated,
}: SiteWorkspaceProps) {
  const manage = useSiteManageDraft(site, onPublishedLocal, onSiteUpdated);
  const {
    draft,
    preview,
    checklist,
    mainTab,
    setMainTab,
    reviewOpen,
    setReviewOpen,
    publishWebsite,
  } = manage;

  return (
    <div className="csp csp-surface">
      <header className="site-toolbar csp-toolbar">
        <div className="site-toolbar-identity page-header-text">
          <div className="site-toolbar-heading-row">
            {onBackToList ? (
              <button
                type="button"
                className="page-secondary-button"
                onClick={onBackToList}
              >
                ← Sites
              </button>
            ) : null}
            <h1 className="page-title">Microsite</h1>
            <span
              className={`csp-badge${draft.siteStatus === "draft" ? " csp-badge--draft" : ""}`}
            >
              {draft.siteStatus === "draft" ? "Draft" : "Published"}
            </span>
          </div>
          <p className="page-subtitle">{preview.brandName}</p>
        </div>
        <div className="site-toolbar-actions">
          <button
            type="button"
            className="page-secondary-button"
            onClick={() => setReviewOpen(true)}
          >
            Review
          </button>
          <button
            type="button"
            className="page-primary-button-action"
            onClick={() => {
              if (!checklist.readyToPublish) {
                setReviewOpen(true);
                return;
              }
              publishWebsite();
            }}
          >
            Publish
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
            draft={manage.draft}
            events={manage.events}
            preview={manage.preview}
            selectedEvent={manage.selectedEvent}
            websitePanel={manage.websitePanel}
            setWebsitePanel={manage.setWebsitePanel}
            update={manage.update}
            uploadImage={manage.uploadImage}
            uploadLogo={manage.uploadLogo}
            clearLogo={manage.clearLogo}
            uploadingLogo={manage.uploadingLogo}
            saveHeaderFooter={manage.saveHeaderFooter}
            isSavingHeader={manage.isSavingHeader}
            addNavItem={manage.addNavItem}
            updateNavItem={manage.updateNavItem}
            removeNavItem={manage.removeNavItem}
            toggleIncluded={manage.toggleIncluded}
            createArticle={manage.createArticle}
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
            draft={manage.draft}
            update={manage.update}
            toast={manage.toast}
          />
        ) : null}

        {reviewOpen ? (
          <ReviewPanel
            draft={manage.draft}
            preview={manage.preview}
            checklist={manage.checklist}
            setReviewOpen={manage.setReviewOpen}
            publishWebsite={manage.publishWebsite}
          />
        ) : null}
      </div>
    </div>
  );
}
