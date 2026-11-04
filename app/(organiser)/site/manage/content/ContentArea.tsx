"use client";

import { CONTENT_NAV } from "../types";
import type { SiteManageController } from "../useSiteManageDraft";
import { NewsPanel } from "./NewsPanel";
import { SupportContactsPanel } from "./SupportContactsPanel";

type ContentAreaProps = Pick<
  SiteManageController,
  | "site"
  | "draft"
  | "editingAbout"
  | "contentPanel"
  | "setContentPanel"
  | "update"
>;

export function ContentArea({
  site,
  draft,
  editingAbout,
  contentPanel,
  setContentPanel,
  update,
}: ContentAreaProps) {
  return (
    <>
      <div className="csp-intro section-heading">
        <div>
          <h2 className="section-title">Content</h2>
          <p className="page-subtitle csp-intro-copy">
            Manage news, About pages and support contacts for this microsite.
          </p>
        </div>
      </div>

      <div className="csp-split">
        <nav className="csp-side-nav" aria-label="Content">
          {CONTENT_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "site-sidebar-item",
                contentPanel === item.id ? "site-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={contentPanel === item.id ? "page" : undefined}
              onClick={() => setContentPanel(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="csp-panel">
          {contentPanel === "news" ? <NewsPanel siteId={site.id} /> : null}

          {contentPanel === "about" ? (
            <>
              <div className="csp-panel-head">
                <h2 className="section-title">About</h2>
              </div>
              <div className="csp-panel-body">
                <p className="csp-panel-lead">
                  Prepared About grid. Edit each content box. Large banner stays optional.
                </p>
                <div className="csp-about-grid">
                  {draft.aboutBoxes.map((box) => (
                    <button
                      key={box.id}
                      type="button"
                      className={`csp-about-card${
                        draft.editingAboutId === box.id ? " is-editing" : ""
                      }`}
                      onClick={() => update({ editingAboutId: box.id })}
                    >
                      <strong>{box.title}</strong>
                      <span>
                        {box.body.trim().length > 40 ? "Edited" : "Needs content"}
                      </span>
                    </button>
                  ))}
                </div>
                {editingAbout ? (
                  <label>
                    <span className="input-heading">{editingAbout.title}</span>
                    <textarea
                      className="csp-textarea"
                      value={editingAbout.body}
                      onChange={(event) =>
                        update({
                          aboutBoxes: draft.aboutBoxes.map((item) =>
                            item.id === editingAbout.id
                              ? { ...item, body: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </label>
                ) : null}
              </div>
            </>
          ) : null}

          {contentPanel === "contact" ? (
            <SupportContactsPanel siteId={site.id} />
          ) : null}
        </section>
      </div>
    </>
  );
}
