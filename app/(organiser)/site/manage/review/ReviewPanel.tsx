"use client";

import type { SiteManageController } from "../useSiteManageDraft";

type ReviewPanelProps = Pick<
  SiteManageController,
  | "draft"
  | "preview"
  | "checklist"
  | "setReviewOpen"
  | "publishWebsite"
>;

export function ReviewPanel({
  draft,
  preview,
  checklist,
  setReviewOpen,
  publishWebsite,
}: ReviewPanelProps) {
  return (
    <section className="csp-review" aria-label="Review before publish">
      <h2 className="csp-review-title">Review before publish</h2>
      <ul className="csp-review-list">
        <li>
          Identity:{" "}
          {checklist.identityDone
            ? `${preview.brandName} · ${draft.publicContactEmail}`
            : "Add public name and contact email"}
        </li>
        <li>
          Header: {draft.navItems.length} nav items
          {draft.logoDataUrl ? " · logo set" : " · default mark"}
          {" · Login"}
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
          onClick={() => setReviewOpen(false)}
        >
          Keep editing
        </button>
        <button
          type="button"
          className="page-primary-button-action"
          disabled={!checklist.readyToPublish}
          onClick={publishWebsite}
        >
          Publish website
        </button>
      </div>
    </section>
  );
}
