"use client";

import { ClubsitePreview } from "../preview/ClubsitePreview";
import { WEBSITE_TABS } from "../types";
import type { SiteManageController } from "../useSiteManageDraft";
import { BannerCtaPanel } from "./BannerCtaPanel";
import { EventsNewsPanel } from "./EventsNewsPanel";
import { HeaderFooterPanel } from "./HeaderFooterPanel";

type WebsiteAreaProps = Pick<
  SiteManageController,
  | "draft"
  | "events"
  | "preview"
  | "selectedEvent"
  | "websitePanel"
  | "setWebsitePanel"
  | "update"
  | "uploadImage"
  | "uploadLogo"
  | "clearLogo"
  | "uploadingLogo"
  | "saveHeaderFooter"
  | "isSavingHeader"
  | "addNavItem"
  | "updateNavItem"
  | "removeNavItem"
  | "toggleIncluded"
  | "createArticle"
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
              draft={props.draft}
              events={props.events}
              selectedEvent={props.selectedEvent}
              preview={props.preview}
              update={props.update}
              uploadImage={props.uploadImage}
              createArticle={props.createArticle}
            />
          ) : null}

          {websitePanel === "content-select" ? (
            <EventsNewsPanel
              draft={props.draft}
              events={props.events}
              update={props.update}
              toggleIncluded={props.toggleIncluded}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
