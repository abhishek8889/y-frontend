"use client";

import type { SiteManageController } from "../useSiteManageDraft";

type ReviewPanelProps = Pick<
  SiteManageController,
  | "draft"
  | "preview"
  | "checklist"
  | "setReviewOpen"
  | "publishWebsite"
  | "isPublishing"
>;

export function ReviewPanel({
  draft,
  preview,
  checklist,
  setReviewOpen,
  publishWebsite,
  isPublishing,
}: ReviewPanelProps) {
  return (
    <section className="csp-review" aria-label="Review before publish">
      <h2 className="csp-review-title">Review before publish</h2>
      <ul className="csp-review-list">
        <li>
          Identity:{" "}
          {checklist.identityDone
            ? preview.brandName
            : "Add a public name under Header & footer"}
        </li>
        <li>
          Branding:{" "}
          {checklist.brandingDone
            ? `${draft.navItems.length} nav items · logo set`
            : "Save logo and navigation under Header & footer"}
        </li>
        <li>
          Domain:{" "}
          {checklist.domainDone
            ? draft.domainInput
            : "Add a domain under Domain & Identity"}
        </li>
        <li>
          Homepage: {preview.heroTitle} · CTA “{preview.heroCta}” → {preview.heroCtaLink}
        </li>
        <li>
          On this site: {preview.visibleEvents.length} events ·{" "}
          {preview.newsForPreview.length} published news
        </li>
      </ul>
      <div className="csp-review-actions">
        <button
          type="button"
          className="page-secondary-button"
          disabled={isPublishing}
          onClick={() => setReviewOpen(false)}
        >
          Keep editing
        </button>
        <button
          type="button"
          className="page-primary-button-action"
          disabled={!checklist.readyToPublish || isPublishing}
          onClick={() => {
            void publishWebsite();
          }}
        >
          {isPublishing ? "Publishing…" : "Publish website"}
        </button>
      </div>
    </section>
  );
}
