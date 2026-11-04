"use client";

import { isSystemNavItem } from "../../workspace/siteManageState";
import { ImageDropzone } from "../ui/ImageDropzone";
import { PlusIcon, TrashIcon } from "../ui/icons";
import type { SiteManageController } from "../useSiteManageDraft";

type HeaderFooterPanelProps = Pick<
  SiteManageController,
  | "draft"
  | "update"
  | "uploadLogo"
  | "clearLogo"
  | "uploadingLogo"
  | "saveHeaderFooter"
  | "isSavingHeader"
  | "addNavItem"
  | "updateNavItem"
  | "removeNavItem"
>;

export function HeaderFooterPanel({
  draft,
  update,
  uploadLogo,
  clearLogo,
  uploadingLogo,
  saveHeaderFooter,
  isSavingHeader,
  addNavItem,
  updateNavItem,
  removeNavItem,
}: HeaderFooterPanelProps) {
  const busy = uploadingLogo || isSavingHeader;

  return (
    <section className="csp-panel">
      <div className="csp-panel-head">
        <h2 className="section-title">Header & footer</h2>
      </div>
      <div className="csp-panel-body">
        <label>
          <span className="input-heading">Public name *</span>
          <input
            className="csp-input"
            value={draft.publicName}
            placeholder="e.g. Calm International"
            disabled={busy}
            onChange={(event) => update({ publicName: event.target.value })}
          />
        </label>

        <div>
          <span className="input-heading">Logo</span>
          <ImageDropzone
            id="csp-logo-upload"
            previewUrl={draft.logoDataUrl || undefined}
            emptyTitle={uploadingLogo ? "Uploading…" : "Add logo"}
            filledTitle="Change logo"
            hint="JPG, PNG or WebP · under 5 MB"
            previewAlt="Logo preview"
            onFiles={(files) => {
              void uploadLogo(files);
            }}
            onClear={() => {
              if (!busy) clearLogo();
            }}
          />
        </div>

        <div className="csp-nav-editor">
          <div className="csp-panel-head csp-panel-head--inner">
            <h3 className="section-title">Navigation</h3>
            <button
              type="button"
              className="page-primary-button-action csp-icon-btn csp-icon-btn--label"
              aria-label="Add navigation item"
              disabled={busy}
              onClick={addNavItem}
            >
              {PlusIcon}
              <span>Add item</span>
            </button>
          </div>
          {draft.navItems.length > 0 ? (
            <div className="csp-nav-columns" aria-hidden="true">
              <span className="input-heading">Name</span>
              <span className="input-heading">Redirect link</span>
              <span />
            </div>
          ) : null}
          {draft.navItems.map((item) => {
            const locked = isSystemNavItem(item);
            return (
              <div key={item.id} className="csp-nav-row">
                <input
                  className="csp-input"
                  value={item.name}
                  placeholder="Menu label"
                  aria-label="Name"
                  disabled={busy}
                  onChange={(event) =>
                    updateNavItem(item.id, { name: event.target.value })
                  }
                />
                <input
                  className="csp-input"
                  value={item.redirect_link}
                  placeholder="/events"
                  aria-label="Redirect link"
                  disabled={busy || locked}
                  title={
                    locked
                      ? "This link is fixed to a site page and cannot be changed."
                      : undefined
                  }
                  onChange={(event) =>
                    updateNavItem(item.id, {
                      redirect_link: event.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="csp-delete-btn"
                  aria-label={`Remove ${item.name || "navigation item"}`}
                  disabled={busy || locked}
                  title={
                    locked
                      ? "Events, News and About us cannot be removed."
                      : undefined
                  }
                  onClick={() => removeNavItem(item.id)}
                >
                  {TrashIcon}
                </button>
              </div>
            );
          })}
        </div>

        <div className="csp-panel-actions">
          <button
            type="button"
            className="page-primary-button-action"
            disabled={busy}
            onClick={() => {
              void saveHeaderFooter();
            }}
          >
            {isSavingHeader ? "Saving…" : uploadingLogo ? "Uploading…" : "Save header"}
          </button>
        </div>
      </div>
    </section>
  );
}
