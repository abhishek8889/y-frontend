"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  siteNewsImageUrl,
  useGetOrganisationSiteNewsListQuery,
  useLazyGetOrganisationSiteNewsListQuery,
  type SiteNewsItem,
} from "@/apis/organisation/siteNewsApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import {
  eventMeta,
  type FeatureKind,
  type LocalArticle,
} from "../../workspace/siteManageState";
import { ImageDropzone } from "../ui/ImageDropzone";
import type { SiteManageController } from "../useSiteManageDraft";

/** Published news for Banner & CTA — 7 per page. */
export const FEATURE_NEWS_PAGE_SIZE = 7;

type BannerCtaPanelProps = Pick<
  SiteManageController,
  | "site"
  | "draft"
  | "events"
  | "eventsLoading"
  | "eventsError"
  | "eventsFetchingMore"
  | "eventsHasMore"
  | "loadMoreEvents"
  | "selectedEvent"
  | "preview"
  | "update"
  | "uploadBanner"
  | "clearBannerImage"
  | "uploadingBanner"
  | "saveBannerCta"
  | "isSavingBanner"
>;

function newsToLocalArticle(item: SiteNewsItem): LocalArticle {
  const now = new Date().toISOString();
  return {
    id: String(item.id),
    headline: item.headline ?? "",
    slug: item.slug ?? "",
    excerpt: item.excerpt ?? "",
    body: item.description ?? "",
    imageDataUrl: siteNewsImageUrl(item.featured_image),
    linkedEventId:
      item.linked_event_id !== undefined && item.linked_event_id !== null
        ? String(item.linked_event_id)
        : "",
    status: "published",
    createdAt: item.created_at || now,
    updatedAt: item.updated_at || item.created_at || now,
  };
}

export function BannerCtaPanel({
  site,
  draft,
  events,
  eventsLoading,
  eventsError,
  eventsFetchingMore,
  eventsHasMore,
  loadMoreEvents,
  selectedEvent,
  preview,
  update,
  uploadBanner,
  clearBannerImage,
  uploadingBanner,
  saveBannerCta,
  isSavingBanner,
}: BannerCtaPanelProps) {
  const isCustom = draft.featureKind === "custom";
  const showBannerUpload = isCustom || draft.bannerSource === "upload";
  const canQueryNews = isApiSiteId(site.id);
  const busy = uploadingBanner || isSavingBanner;

  const eventsListRef = useRef<HTMLDivElement | null>(null);
  const eventsSentinelRef = useRef<HTMLDivElement | null>(null);
  const newsListRef = useRef<HTMLDivElement | null>(null);
  const newsSentinelRef = useRef<HTMLDivElement | null>(null);
  const newsLoadLock = useRef(false);

  const [extraNews, setExtraNews] = useState<SiteNewsItem[]>([]);
  const [newsNextCursor, setNewsNextCursor] = useState<string | null>(null);
  const [newsHasMore, setNewsHasMore] = useState(false);

  const newsArgs = useMemo(
    () =>
      canQueryNews
        ? {
            site_id: site.id,
            status: "published" as const,
            per_page: FEATURE_NEWS_PAGE_SIZE,
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
    skip: !canQueryNews || draft.featureKind !== "news",
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
        per_page: FEATURE_NEWS_PAGE_SIZE,
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
    if (draft.featureKind !== "event") return;
    const node = eventsSentinelRef.current;
    const root = eventsListRef.current;
    if (!node || !root) return;

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
  }, [draft.featureKind, loadMoreEvents, events.length, eventsHasMore]);

  useEffect(() => {
    if (draft.featureKind !== "news") return;
    const node = newsSentinelRef.current;
    const root = newsListRef.current;
    if (!node || !root) return;

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
  }, [draft.featureKind, loadMoreNews, publishedNews.length, newsHasMore]);

  // Keep selected news in local draft so the preview can resolve headline/image.
  useEffect(() => {
    if (draft.featureKind !== "news" || !draft.selectedArticleId) return;
    const item = publishedNews.find(
      (row) => String(row.id) === draft.selectedArticleId,
    );
    if (!item) return;
    const already = draft.articles.some(
      (row) => row.id === draft.selectedArticleId,
    );
    if (already) return;

    const article = newsToLocalArticle(item);
    update({
      articles: [article, ...draft.articles],
      includedArticleIds: draft.includedArticleIds.includes(article.id)
        ? draft.includedArticleIds
        : [...draft.includedArticleIds, article.id],
    });
  }, [
    draft.featureKind,
    draft.selectedArticleId,
    draft.articles,
    draft.includedArticleIds,
    publishedNews,
    update,
  ]);

  function selectPublishedNews(item: SiteNewsItem) {
    const article = newsToLocalArticle(item);
    const exists = draft.articles.some((row) => row.id === article.id);
    const articles = exists
      ? draft.articles.map((row) => (row.id === article.id ? article : row))
      : [article, ...draft.articles];
    const includedArticleIds = draft.includedArticleIds.includes(article.id)
      ? draft.includedArticleIds
      : [...draft.includedArticleIds, article.id];

    update({
      selectedArticleId: article.id,
      articles,
      includedArticleIds,
      bannerSource: article.imageDataUrl ? "feature" : draft.bannerSource,
      ctaLabel: draft.ctaLabel || "Read article",
      ctaRedirectLink: draft.ctaRedirectLink || `/news/${article.slug || article.id}`,
    });
  }

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
          eventsLoading ? (
            <p className="csp-panel-lead">Loading published events…</p>
          ) : eventsError ? (
            <p className="csp-panel-lead">Couldn’t load events. Try again.</p>
          ) : events.length ? (
            <div
              ref={eventsListRef}
              className="csp-choice-list csp-choice-list--scroll"
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
              <div ref={eventsSentinelRef} className="csp-choice-sentinel" aria-hidden />
              {eventsFetchingMore ? (
                <p className="csp-panel-lead csp-choice-loading">Loading more…</p>
              ) : null}
            </div>
          ) : (
            <p className="csp-panel-lead">
              No published events yet. Publish an event to feature it here.
            </p>
          )
        ) : null}

        {draft.featureKind === "news" ? (
          !canQueryNews ? (
            <p className="csp-panel-lead">
              News is available after this microsite is saved on the server.
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
                return (
                  <button
                    key={id}
                    type="button"
                    className="csp-choice"
                    aria-pressed={draft.selectedArticleId === id}
                    onClick={() => selectPublishedNews(item)}
                  >
                    <span className="csp-choice-radio" aria-hidden="true" />
                    <span>
                      <strong>{item.headline || "Untitled story"}</strong>
                      <span>
                        Published
                        {siteNewsImageUrl(item.featured_image) ? " · Has image" : ""}
                      </span>
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
              No published news yet. Publish a story under Content to feature it here.
            </p>
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
              emptyTitle={uploadingBanner ? "Uploading…" : "Upload banner"}
              filledTitle="Change banner"
              hint="JPG, PNG or WebP · under 5 MB · left 50% of homepage"
              previewAlt="Banner preview"
              previewShape="banner"
              onFiles={(files) => {
                if (busy) return;
                void uploadBanner(files);
              }}
              onClear={() => {
                if (busy) return;
                clearBannerImage();
              }}
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
                  ? selectedEvent?.cta || "Get tickets"
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

        <div className="csp-panel-actions">
          <button
            type="button"
            className="page-primary-button-action"
            disabled={busy}
            onClick={() => {
              void saveBannerCta();
            }}
          >
            {isSavingBanner
              ? "Saving…"
              : uploadingBanner
                ? "Uploading…"
                : "Save Banner"}
          </button>
        </div>
      </div>
    </section>
  );
}
