"use client";

import { eventMeta } from "../../workspace/siteManageState";
import { Switch } from "../ui/Switch";
import type { SiteManageController } from "../useSiteManageDraft";

type EventsNewsPanelProps = Pick<
  SiteManageController,
  "draft" | "events" | "update" | "toggleIncluded"
>;

export function EventsNewsPanel({
  draft,
  events,
  update,
  toggleIncluded,
}: EventsNewsPanelProps) {
  return (
    <section className="csp-panel">
      <div className="csp-panel-head">
        <h2 className="section-title">Events & news on this site</h2>
      </div>
      <div className="csp-panel-body">
        <p className="csp-panel-lead">
          Select categories and the related records that appear on your landing page.
        </p>

        <div className="csp-toggle-row">
          <span>Show events section</span>
          <Switch
            checked={draft.showEvents}
            label="Toggle events section"
            onChange={() => update({ showEvents: !draft.showEvents })}
          />
        </div>
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
              aria-pressed={draft.includedEventIds.includes(event.id)}
              onClick={() => toggleIncluded("includedEventIds", event.id)}
            >
              <span className="csp-choice-radio" aria-hidden="true" />
              <span>
                <strong>{event.title}</strong>
                <span>{eventMeta(event)}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="csp-toggle-row">
          <span>Show news section</span>
          <Switch
            checked={draft.showNews}
            label="Toggle news section"
            onChange={() => update({ showNews: !draft.showNews })}
          />
        </div>
        <div
          className={[
            "csp-choice-list",
            draft.articles.length > 4 ? "csp-choice-list--scroll" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.articles.length ? (
            draft.articles.map((article) => (
              <button
                key={article.id}
                type="button"
                className="csp-choice"
                aria-pressed={draft.includedArticleIds.includes(article.id)}
                onClick={() => toggleIncluded("includedArticleIds", article.id)}
              >
                <span className="csp-choice-radio" aria-hidden="true" />
                <span>
                  <strong>{article.headline || "Untitled story"}</strong>
                  <span>
                    {article.status === "published" ? "Published" : "Draft"}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="csp-panel-lead">No news yet — create some under Content.</p>
          )}
        </div>
      </div>
    </section>
  );
}
