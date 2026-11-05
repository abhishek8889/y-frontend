"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useGetOrganisationSiteNewsListQuery,
  useLazyGetOrganisationSiteNewsListQuery,
  type SiteNewsItem,
} from "@/apis/organisation/siteNewsApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import { eventMeta } from "../../workspace/siteManageState";
import { Switch } from "../ui/Switch";
import type { SiteManageController } from "../useSiteManageDraft";

/** Published news for Categories — 7 per page. */
export const CATEGORY_NEWS_PAGE_SIZE = 7;

type EventsNewsPanelProps = Pick<
  SiteManageController,
  | "site"
  | "draft"
  | "events"
  | "eventsLoading"
  | "eventsError"
  | "eventsFetchingMore"
  | "eventsHasMore"
  | "loadMoreEvents"
  | "update"
  | "toggleIncluded"
  | "saveCategories"
  | "isSavingCategories"
>;

export function EventsNewsPanel({
  site,
  draft,
  events,
  eventsLoading,
  eventsError,
  eventsFetchingMore,
  eventsHasMore,
  loadMoreEvents,
  update,
  toggleIncluded,
  saveCategories,
  isSavingCategories,
}: EventsNewsPanelProps) {
  const eventsListRef = useRef<HTMLDivElement | null>(null);
  const eventsSentinelRef = useRef<HTMLDivElement | null>(null);
  const newsListRef = useRef<HTMLDivElement | null>(null);
  const newsSentinelRef = useRef<HTMLDivElement | null>(null);
  const newsLoadLock = useRef(false);

  const canQueryNews = isApiSiteId(site.id);
  const [extraNews, setExtraNews] = useState<SiteNewsItem[]>([]);
  const [newsNextCursor, setNewsNextCursor] = useState<string | null>(null);
  const [newsHasMore, setNewsHasMore] = useState(false);

  const newsArgs = useMemo(
    () =>
      canQueryNews
        ? {
            site_id: site.id,
            status: "published" as const,
            per_page: CATEGORY_NEWS_PAGE_SIZE,
          }
        : undefined,
    [canQueryNews, site.id],
  );

  const {
    data: newsData,
    isLoading: newsLoading,
    isFetching: newsFetching,
    isError: newsError,
  } = useGetOrganisationSiteNewsListQuery(newsArgs, {
    skip: !canQueryNews || !draft.showNews,
  });

  const [fetchMoreNews, { isFetching: newsFetchingMore }] =
    useLazyGetOrganisationSiteNewsListQuery();

  useEffect(() => {
    setExtraNews([]);
    newsLoadLock.current = false;
    const pagination = newsData?.data?.pagination;
    setNewsNextCursor(pagination?.next_cursor ?? null);
    setNewsHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [newsData, site.id]);

  const publishedNews = useMemo(() => {
    const first = newsData?.data?.items ?? [];
    const seen = new Set<string>();
    const merged: SiteNewsItem[] = [];
    for (const item of [...first, ...extraNews]) {
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    return merged;
  }, [newsData?.data?.items, extraNews]);

  const loadMoreNews = useCallback(async () => {
    if (!canQueryNews || !newsNextCursor || !newsHasMore) return;
    if (newsFetchingMore || newsFetching || newsLoadLock.current) return;

    newsLoadLock.current = true;
    try {
      const result = await fetchMoreNews({
        site_id: site.id,
        status: "published",
        per_page: CATEGORY_NEWS_PAGE_SIZE,
        cursor: newsNextCursor,
      }).unwrap();
      const pageItems = result.data?.items ?? [];
      const pagination = result.data?.pagination;
      if (pageItems.length) {
        setExtraNews((prev) => [...prev, ...pageItems]);
      }
      setNewsNextCursor(pagination?.next_cursor ?? null);
      setNewsHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
    } catch {
      // Keep list; scroll again to retry.
    } finally {
      newsLoadLock.current = false;
    }
  }, [
    canQueryNews,
    newsNextCursor,
    newsHasMore,
    newsFetchingMore,
    newsFetching,
    fetchMoreNews,
    site.id,
  ]);

  useEffect(() => {
    const node = eventsSentinelRef.current;
    const root = eventsListRef.current;
    if (!node || !root || !draft.showEvents) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreEvents();
        }
      },
      { root, rootMargin: "80px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMoreEvents, events.length, eventsHasMore, draft.showEvents]);

  useEffect(() => {
    const node = newsSentinelRef.current;
    const root = newsListRef.current;
    if (!node || !root || !draft.showNews) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreNews();
        }
      },
      { root, rootMargin: "80px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMoreNews, publishedNews.length, newsHasMore, draft.showNews]);

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

        {draft.showEvents ? (
          eventsLoading ? (
            <p className="csp-panel-lead">Loading published events…</p>
          ) : eventsError ? (
            <p className="csp-panel-lead">Couldn’t load events. Try again.</p>
          ) : events.length ? (
            <div
              ref={eventsListRef}
              className="csp-choice-list csp-choice-list--scroll"
            >
              {events.map((event) => {
                const selected = draft.includedEventIds.some(
                  (id) => String(id) === String(event.id),
                );
                return (
                  <button
                    key={event.id}
                    type="button"
                    className={["csp-choice", selected ? "is-selected" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    onClick={() =>
                      toggleIncluded("includedEventIds", String(event.id))
                    }
                  >
                    <span className="csp-choice-radio" aria-hidden="true" />
                    <span>
                      <strong>{event.title}</strong>
                      <span>{eventMeta(event)}</span>
                    </span>
                  </button>
                );
              })}
              <div ref={eventsSentinelRef} className="csp-choice-sentinel" aria-hidden />
              {eventsFetchingMore ? (
                <p className="csp-panel-lead csp-choice-loading">Loading more…</p>
              ) : null}
            </div>
          ) : (
            <p className="csp-panel-lead">No published events yet.</p>
          )
        ) : null}

        <div className="csp-toggle-row">
          <span>Show news section</span>
          <Switch
            checked={draft.showNews}
            label="Toggle news section"
            onChange={() => update({ showNews: !draft.showNews })}
          />
        </div>

        {draft.showNews ? (
          !canQueryNews ? (
            <p className="csp-panel-lead">
              News selection is unavailable until this site exists on the server.
            </p>
          ) : newsLoading ? (
            <p className="csp-panel-lead">Loading published news…</p>
          ) : newsError ? (
            <p className="csp-panel-lead">Couldn’t load news. Try again.</p>
          ) : publishedNews.length ? (
            <div
              ref={newsListRef}
              className="csp-choice-list csp-choice-list--scroll"
            >
              {publishedNews.map((item) => {
                const id = String(item.id);
                const selected = draft.includedArticleIds.some(
                  (value) => String(value) === id,
                );
                return (
                  <button
                    key={id}
                    type="button"
                    className={["csp-choice", selected ? "is-selected" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    onClick={() => toggleIncluded("includedArticleIds", id)}
                  >
                    <span className="csp-choice-radio" aria-hidden="true" />
                    <span>
                      <strong>{item.headline || "Untitled story"}</strong>
                      <span>Published</span>
                    </span>
                  </button>
                );
              })}
              <div ref={newsSentinelRef} className="csp-choice-sentinel" aria-hidden />
              {newsFetchingMore ? (
                <p className="csp-panel-lead csp-choice-loading">Loading more…</p>
              ) : null}
            </div>
          ) : (
            <p className="csp-panel-lead">
              No published news yet — publish stories under Content.
            </p>
          )
        ) : null}

        <div className="csp-panel-actions">
          <button
            type="button"
            className="page-primary-button-action"
            disabled={isSavingCategories}
            onClick={() => {
              void saveCategories();
            }}
          >
            {isSavingCategories ? "Saving…" : "Save Categories"}
          </button>
        </div>
      </div>
    </section>
  );
}
