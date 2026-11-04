"use client";

import { eventMeta, type SiteManageDraft } from "../../workspace/siteManageState";
import type { ClubsitePreviewModel } from "../previewModel";

type ClubsitePreviewProps = {
  draft: SiteManageDraft;
  preview: ClubsitePreviewModel;
  onEditHeader: () => void;
};

function LogoMark({
  logoDataUrl,
  brandInitial,
  className = "",
}: {
  logoDataUrl: string;
  brandInitial: string;
  className?: string;
}) {
  if (logoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoDataUrl} alt="" className={`csp-logo-img ${className}`.trim()} />
    );
  }
  return <div className={`csp-site-logo ${className}`.trim()}>{brandInitial}</div>;
}

export function ClubsitePreview({
  draft,
  preview,
  onEditHeader,
}: ClubsitePreviewProps) {
  return (
    <div className="csp-preview" aria-label="Public homepage preview">
      <div className="csp-preview-bar">
        <p className="csp-preview-url">{preview.previewUrl}</p>
        <button
          type="button"
          className="page-secondary-button csp-btn-compact"
          onClick={onEditHeader}
        >
          Edit header
        </button>
      </div>

      <div className="csp-preview-frame">
        <div className="csp-site-header csp-site-header--balanced">
          <ul className="csp-site-nav csp-site-nav--left">
            {draft.navItems.map((item) => (
              <li key={item.id} title={item.redirect_link}>
                {item.name || "Untitled"}
              </li>
            ))}
          </ul>
          <div className="csp-site-brand csp-site-brand--center">
            <LogoMark
              logoDataUrl={draft.logoDataUrl}
              brandInitial={preview.brandInitial}
            />
            {!draft.logoDataUrl ? (
              <p className="csp-site-name">{preview.brandName}</p>
            ) : null}
          </div>
          <div className="csp-site-header-right">
            <span className="csp-login-chip">Login</span>
          </div>
        </div>

        <div className="csp-hero">
          <div
            className={[
              "csp-hero-media",
              preview.heroImage ? "csp-hero-media--image" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              preview.heroImage
                ? { backgroundImage: `url(${preview.heroImage})` }
                : undefined
            }
          >
            <p className="csp-hero-media-label">
              {preview.heroImage
                ? "Banner image"
                : draft.featureKind === "event"
                  ? "Event artwork"
                  : "Select or upload a banner"}
            </p>
          </div>
          <div className="csp-hero-copy">
            <p className="csp-hero-kicker">
              {draft.featureKind === "event"
                ? "Featured event"
                : draft.featureKind === "news"
                  ? "Featured story"
                  : "Campaign"}
            </p>
            <h2 className="csp-hero-title">{preview.heroTitle}</h2>
            <p className="csp-hero-meta">{preview.heroMeta}</p>
            <span className="csp-hero-cta" title={preview.heroCtaLink}>
              {preview.heroCta}
            </span>
          </div>
        </div>

        <div className="csp-feed">
          {draft.showEvents ? (
            <div className="csp-feed-block">
              <h3 className="csp-feed-heading">Upcoming events</h3>
              {preview.visibleEvents.length ? (
                preview.visibleEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="csp-feed-item">
                    <strong>{event.title}</strong>
                    <span>{eventMeta(event)}</span>
                  </div>
                ))
              ) : (
                <div className="csp-feed-item">
                  <strong>No events selected</strong>
                  <span>Choose events in Website controls</span>
                </div>
              )}
            </div>
          ) : null}
          {draft.showNews ? (
            <div className="csp-feed-block">
              <h3 className="csp-feed-heading">Latest news</h3>
              {preview.newsForPreview.length ? (
                preview.newsForPreview.map((article) => (
                  <div key={article.id} className="csp-feed-item csp-feed-item--news">
                    {article.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.imageDataUrl}
                        alt=""
                        className="csp-feed-thumb"
                      />
                    ) : (
                      <span
                        className="csp-feed-thumb csp-feed-thumb--empty"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      <strong>{article.headline || "Untitled story"}</strong>
                      <span>Published</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="csp-feed-item">
                  <strong>No published news selected</strong>
                  <span>Publish stories in Content, then select them here</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="csp-site-footer csp-site-footer--branded">
          <div className="csp-footer-brand">
            <LogoMark
              logoDataUrl={draft.logoDataUrl}
              brandInitial={preview.brandInitial}
              className="csp-logo-img--footer"
            />
            <span>{preview.brandName}</span>
          </div>
          <span>
            {draft.publicContactEmail || "Contact"} · Account · My Tickets
          </span>
        </div>
      </div>
    </div>
  );
}
