"use client";

import { ClubsitePreview } from "../preview/ClubsitePreview";
import { WEBSITE_TABS } from "../types";
import type { SiteManageController } from "../useSiteManageDraft";
import { BannerCtaPanel } from "./BannerCtaPanel";
import { EventsNewsPanel } from "./EventsNewsPanel";
import { HeaderFooterPanel } from "./HeaderFooterPanel";

type WebsiteAreaProps = Pick<
  SiteManageController,
  | "site"
  | "draft"
  | "events"
  | "eventsLoading"
  | "eventsError"
  | "eventsFetchingMore"
  | "eventsHasMore"
  | "loadMoreEvents"
  | "preview"
  | "selectedEvent"
  | "websitePanel"
  | "setWebsitePanel"
  | "update"
  | "uploadLogo"
  | "clearLogo"
  | "uploadingLogo"
  | "uploadBanner"
  | "clearBannerImage"
  | "uploadingBanner"
  | "saveBannerCta"
  | "isSavingBanner"
  | "saveCategories"
  | "isSavingCategories"
  | "saveHeaderFooter"
  | "isSavingHeader"
  | "addNavItem"
  | "updateNavItem"
  | "removeNavItem"
  | "toggleIncluded"
>;

export function WebsiteArea(props: WebsiteAreaProps) {
  const { draft, preview, websitePanel, setWebsitePanel } = props;

  return (
    <>
      <div className="csp-intro section-heading">
        <div>
          <h2 className="section-title">Website</h2>
          <p className="page-subtitle csp-intro-copy csp-intro-copy--full">
            Edit the header, choose the homepage banner from events or news already on this
            site, and set the CTA. The preview updates as you change things.
          </p>
        </div>
      </div>

      <div className="csp-website">
        <ClubsitePreview
          draft={draft}
          preview={preview}
          onEditHeader={() => setWebsitePanel("header")}
        />

        <div className="csp-controls">
          <div className="form-tabs-bar form-tabs-bar-inline csp-website-tabs">
            <nav className="form-tabs-nav" aria-label="Website sections">
              {WEBSITE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={[
                    "form-tab",
                    websitePanel === tab.id ? "form-tab-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={websitePanel === tab.id ? "page" : undefined}
                  onClick={() => setWebsitePanel(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {websitePanel === "header" ? (
            <HeaderFooterPanel
              draft={props.draft}
              update={props.update}
              uploadLogo={props.uploadLogo}
              clearLogo={props.clearLogo}
              uploadingLogo={props.uploadingLogo}
              saveHeaderFooter={props.saveHeaderFooter}
              isSavingHeader={props.isSavingHeader}
              addNavItem={props.addNavItem}
              updateNavItem={props.updateNavItem}
              removeNavItem={props.removeNavItem}
            />
          ) : null}

          {websitePanel === "feature" ? (
            <BannerCtaPanel
              site={props.site}
              draft={props.draft}
              events={props.events}
              eventsLoading={props.eventsLoading}
              eventsError={props.eventsError}
              eventsFetchingMore={props.eventsFetchingMore}
              eventsHasMore={props.eventsHasMore}
              loadMoreEvents={props.loadMoreEvents}
              selectedEvent={props.selectedEvent}
              preview={props.preview}
              update={props.update}
              uploadBanner={props.uploadBanner}
              clearBannerImage={props.clearBannerImage}
              uploadingBanner={props.uploadingBanner}
              saveBannerCta={props.saveBannerCta}
              isSavingBanner={props.isSavingBanner}
            />
          ) : null}

          {websitePanel === "content-select" ? (
            <EventsNewsPanel
              site={props.site}
              draft={props.draft}
              events={props.events}
              eventsLoading={props.eventsLoading}
              eventsError={props.eventsError}
              eventsFetchingMore={props.eventsFetchingMore}
              eventsHasMore={props.eventsHasMore}
              loadMoreEvents={props.loadMoreEvents}
              update={props.update}
              toggleIncluded={props.toggleIncluded}
              saveCategories={props.saveCategories}
              isSavingCategories={props.isSavingCategories}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
