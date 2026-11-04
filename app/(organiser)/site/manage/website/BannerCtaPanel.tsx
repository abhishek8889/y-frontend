"use client";

import { eventMeta, type FeatureKind } from "../../workspace/siteManageState";
import { ImageDropzone } from "../ui/ImageDropzone";
import type { SiteManageController } from "../useSiteManageDraft";

type BannerCtaPanelProps = Pick<
  SiteManageController,
  | "draft"
  | "events"
  | "selectedEvent"
  | "preview"
  | "update"
  | "uploadImage"
  | "createArticle"
>;

export function BannerCtaPanel({
  draft,
  events,
  selectedEvent,
  preview,
  update,
  uploadImage,
  createArticle,
}: BannerCtaPanelProps) {
  const isCustom = draft.featureKind === "custom";
  const showBannerUpload = isCustom || draft.bannerSource === "upload";

  return (
    <section className="csp-panel">
      <div className="csp-panel-head">
        <h2 className="section-title">Banner & CTA</h2>
      </div>
      <div className="csp-panel-body">
        <div>
          <span className="input-heading">What would you like to feature?</span>
          <div className="csp-segment" role="group" aria-label="Feature type">
            {(
              [
                ["event", "Event"],
                ["news", "News"],
                ["custom", "Custom"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={draft.featureKind === id}
                onClick={() =>
                  update({
                    featureKind: id as FeatureKind,
                    ...(id === "custom" ? { bannerSource: "upload" as const } : {}),
                  })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {draft.featureKind === "event" ? (
          <div
            className={[
              "csp-choice-list",
              events.length > 4 ? "csp-choice-list--scroll" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                className="csp-choice"
                aria-pressed={draft.selectedEventId === event.id}
                onClick={() =>
                  update({
                    selectedEventId: event.id,
                    bannerSource: "feature",
                    ctaLabel: draft.ctaLabel || event.cta,
                    ctaRedirectLink: draft.ctaRedirectLink || event.path,
                  })
                }
              >
                <span className="csp-choice-radio" aria-hidden="true" />
                <span>
                  <strong>{event.title}</strong>
                  <span>{eventMeta(event)}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {draft.featureKind === "news" ? (
          draft.articles.length ? (
            <div
              className={[
                "csp-choice-list",
                draft.articles.length > 4 ? "csp-choice-list--scroll" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {draft.articles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className="csp-choice"
                  aria-pressed={draft.selectedArticleId === article.id}
                  onClick={() =>
                    update({
                      selectedArticleId: article.id,
                      bannerSource: article.imageDataUrl
                        ? "feature"
                        : draft.bannerSource,
                      ctaLabel: draft.ctaLabel || "Read article",
                      ctaRedirectLink:
                        draft.ctaRedirectLink || `/news/${article.id}`,
                    })
                  }
                >
                  <span className="csp-choice-radio" aria-hidden="true" />
                  <span>
                    <strong>{article.headline || "Untitled story"}</strong>
                    <span>
                      {article.status === "published" ? "Published" : "Draft"}
                      {article.imageDataUrl ? " · Has image" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="csp-empty">
              <p>No news yet.</p>
              <button
                type="button"
                className="page-secondary-button csp-btn-compact"
                onClick={createArticle}
              >
                Write a story
              </button>
            </div>
          )
        ) : null}

        {isCustom ? (
          <label>
            <span className="input-heading">Campaign headline</span>
            <input
              className="csp-input"
              value={draft.customHeadline}
              onChange={(event) => update({ customHeadline: event.target.value })}
            />
          </label>
        ) : null}

        <div>
          <span className="input-heading">Banner image</span>
          {!isCustom ? (
            <div
              className="csp-segment csp-segment--2"
              role="group"
              aria-label="Banner source"
            >
              <button
                type="button"
                aria-pressed={draft.bannerSource === "feature"}
                onClick={() => update({ bannerSource: "feature" })}
              >
                From feature
              </button>
              <button
                type="button"
                aria-pressed={draft.bannerSource === "upload"}
                onClick={() => update({ bannerSource: "upload" })}
              >
                Upload
              </button>
            </div>
          ) : null}

          {showBannerUpload ? (
            <ImageDropzone
              id="csp-banner-upload"
              previewUrl={draft.bannerImageDataUrl || undefined}
              emptyTitle="Upload banner"
              filledTitle="Change banner"
              hint="JPG, PNG or WebP · under 5 MB · left 50% of homepage"
              previewAlt="Banner preview"
              previewShape="banner"
              onFiles={(files) => {
                void uploadImage(files, (bannerImageDataUrl) =>
                  update({
                    bannerImageDataUrl,
                    bannerSource: "upload",
                    toast: "Banner updated in preview.",
                  }),
                );
              }}
              onClear={() =>
                update({
                  bannerImageDataUrl: "",
                  bannerSource: "upload",
                  toast: "Banner removed.",
                })
              }
            />
          ) : null}
        </div>

        <div className="csp-form-grid-2">
          <label>
            <span className="input-heading">CTA button label</span>
            <input
              className="csp-input"
              value={draft.ctaLabel}
              placeholder={
                draft.featureKind === "event"
                  ? selectedEvent.cta
                  : draft.featureKind === "news"
                    ? "Read article"
                    : "Learn more"
              }
              onChange={(event) => update({ ctaLabel: event.target.value })}
            />
          </label>
          <label>
            <span className="input-heading">CTA redirect link</span>
            <input
              className="csp-input"
              value={draft.ctaRedirectLink}
              placeholder={preview.heroCtaLink}
              onChange={(event) => update({ ctaRedirectLink: event.target.value })}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
