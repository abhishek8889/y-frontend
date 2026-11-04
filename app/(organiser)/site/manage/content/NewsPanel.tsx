"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SITE_NEWS_PAGE_SIZE,
  siteNewsImageUrl,
  useDeleteOrganisationSiteNewsMutation,
  useGetOrganisationSiteNewsListQuery,
  useLazyGetOrganisationSiteNewsListQuery,
  useManageOrganisationSiteNewsStatusMutation,
  type SiteNewsItem,
} from "@/apis/organisation/siteNewsApi";
import { useGetOrganisationEventsQuery } from "@/apis/events/eventsApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/components/common";
import { formatArticleDate } from "../../workspace/siteManageState";
import { NewsArticleDrawer, type NewsEventOption } from "./NewsArticleDrawer";

type NewsPanelProps = {
  siteId: string;
};

function plainTextFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cardExcerpt(item: SiteNewsItem) {
  const text = plainTextFromHtml(item.excerpt || item.description || "");
  if (!text) return "No excerpt yet";
  return text;
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M9.5 7V5.8c0-.7.5-1.3 1.2-1.3h2.6c.7 0 1.2.6 1.2 1.3V7M18 7v11.2c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V7M10 11v5.5M14 11v5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PublishIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NewsPanel({ siteId }: NewsPanelProps) {
  const canQuery = isApiSiteId(siteId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerArticle, setDrawerArticle] = useState<SiteNewsItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [extraItems, setExtraItems] = useState<SiteNewsItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreLock = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const listArgs = useMemo(
    () =>
      canQuery
        ? { site_id: siteId, per_page: SITE_NEWS_PAGE_SIZE }
        : undefined,
    [canQuery, siteId],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrganisationSiteNewsListQuery(listArgs, { skip: !canQuery });

  const [fetchMore, { isFetching: isFetchingMore }] =
    useLazyGetOrganisationSiteNewsListQuery();

  const [manageStatus] = useManageOrganisationSiteNewsStatusMutation();
  const [deleteNews] = useDeleteOrganisationSiteNewsMutation();

  const { data: eventsData } = useGetOrganisationEventsQuery(
    { per_page: 50 },
    { skip: !canQuery },
  );

  const eventOptions: NewsEventOption[] = useMemo(
    () =>
      (eventsData?.data?.items ?? []).map((event) => ({
        id: String(event.id),
        title: event.name?.trim() || `Event ${event.id}`,
      })),
    [eventsData?.data?.items],
  );

  useEffect(() => {
    setExtraItems([]);
    loadMoreLock.current = false;
    const pagination = data?.data?.pagination;
    setNextCursor(pagination?.next_cursor ?? null);
    setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [data, siteId]);

  const items = useMemo(() => {
    const first = data?.data?.items ?? [];
    const seen = new Set<string>();
    const merged: SiteNewsItem[] = [];
    for (const item of [...first, ...extraItems]) {
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    return merged;
  }, [data?.data?.items, extraItems]);

  const loadMore = useCallback(async () => {
    if (!canQuery || !nextCursor || !hasMore) return;
    if (isFetchingMore || isFetching || loadMoreLock.current) return;

    loadMoreLock.current = true;
    try {
      const result = await fetchMore({
        site_id: siteId,
        per_page: SITE_NEWS_PAGE_SIZE,
        cursor: nextCursor,
      }).unwrap();

      const pageItems = result.data?.items ?? [];
      const pagination = result.data?.pagination;
      if (pageItems.length) {
        setExtraItems((prev) => [...prev, ...pageItems]);
      }
      setNextCursor(pagination?.next_cursor ?? null);
      setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
    } catch {
      // Keep current list; scroll again to retry.
    } finally {
      loadMoreLock.current = false;
    }
  }, [
    canQuery,
    nextCursor,
    hasMore,
    isFetchingMore,
    isFetching,
    fetchMore,
    siteId,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, items.length]);

  function openCreate() {
    setOpenMenuId(null);
    setDrawerArticle(null);
    setDrawerOpen(true);
  }

  function openEdit(item: SiteNewsItem) {
    setOpenMenuId(null);
    setDrawerArticle(item);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerArticle(null);
  }

  async function publishItem(item: SiteNewsItem) {
    setOpenMenuId(null);
    try {
      await manageStatus({
        newsId: item.id,
        body: { status: "published" },
      }).unwrap();
    } catch {
      // Toast handled by mutation.
    }
  }

  async function draftItem(item: SiteNewsItem) {
    setOpenMenuId(null);
    try {
      await manageStatus({
        newsId: item.id,
        body: { status: "draft" },
      }).unwrap();
    } catch {
      // Toast handled by mutation.
    }
  }

  async function removeItem(item: SiteNewsItem) {
    setOpenMenuId(null);
    try {
      await deleteNews(item.id).unwrap();
      setExtraItems((prev) =>
        prev.filter((row) => String(row.id) !== String(item.id)),
      );
    } catch {
      // Toast handled by mutation.
    }
  }

  function newsActions(item: SiteNewsItem): ActionMenuItem<SiteNewsItem>[] {
    const isPublished = item.status === "published";
    return [
      {
        key: "edit",
        label: "Edit",
        icon: <EditIcon />,
        onClick: (row) => openEdit(row),
      },
      {
        key: "publish",
        label: "Publish",
        icon: <PublishIcon />,
        hidden: isPublished,
        onClick: (row) => {
          void publishItem(row);
        },
      },
      {
        key: "draft",
        label: "Move to draft",
        icon: <DraftIcon />,
        hidden: !isPublished,
        onClick: (row) => {
          void draftItem(row);
        },
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteIcon />,
        variant: "danger",
        onClick: (row) => {
          void removeItem(row);
        },
      },
    ];
  }

  const showList = canQuery && items.length > 0;
  const showEmpty =
    canQuery && !isLoading && !isError && items.length === 0;

  return (
    <>
      <div className="csp-panel-head csp-panel-head--with-action">
        <h2 className="section-title">News</h2>
        {showList ? (
          <button
            type="button"
            className="page-primary-button-action"
            onClick={openCreate}
          >
            Add new
          </button>
        ) : null}
      </div>

      <div className="csp-panel-body">
        {!canQuery ? (
          <p className="csp-panel-lead">
            News is available after this microsite is saved on the server.
          </p>
        ) : null}

        {canQuery && isLoading ? (
          <p className="csp-panel-lead">Loading news…</p>
        ) : null}

        {canQuery && isError ? (
          <div className="csp-empty">
            <p>Couldn’t load news.</p>
            <button
              type="button"
              className="page-primary-button-action"
              onClick={() => {
                void refetch();
              }}
            >
              Try again
            </button>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="csp-empty">
            <p>No news yet. Click Add new to create your first story.</p>
            <button
              type="button"
              className="page-primary-button-action"
              onClick={openCreate}
            >
              Add new
            </button>
          </div>
        ) : null}

        {showList ? (
          <>
            <div className="csp-news-grid">
              {items.map((item) => {
                const menuId = `news:${item.id}`;
                const menuOpen = openMenuId === menuId;
                const isPublished = item.status === "published";
                const imageUrl = siteNewsImageUrl(item.featured_image);
                return (
                  <article
                    key={String(item.id)}
                    className={[
                      "csp-news-card",
                      menuOpen ? "is-menu-open" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="csp-news-card-banner">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt=""
                          className="csp-news-card-banner-img"
                        />
                      ) : (
                        <span className="csp-news-card-banner-empty">No image</span>
                      )}
                    </div>

                    <div className="csp-news-card-actions">
                      <ActionMenu
                        row={item}
                        actions={newsActions(item)}
                        open={menuOpen}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? menuId : null)
                        }
                        align="right"
                        ariaLabel={`Actions for ${item.headline || "story"}`}
                      />
                    </div>

                    <button
                      type="button"
                      className="csp-news-card-body"
                      onClick={() => openEdit(item)}
                    >
                      <div className="csp-news-card-meta">
                        <span
                          className={[
                            "csp-news-status",
                            isPublished
                              ? "csp-news-status--published"
                              : "csp-news-status--draft",
                          ].join(" ")}
                        >
                          <span className="csp-news-status-dot" aria-hidden="true" />
                          {isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="csp-news-card-date">
                          {formatArticleDate(
                            item.published_at ||
                              item.created_at ||
                              item.updated_at ||
                              "",
                          )}
                        </span>
                      </div>
                      <h3 className="csp-news-card-title">
                        {item.headline || "Untitled story"}
                      </h3>
                      <p className="csp-news-card-excerpt">{cardExcerpt(item)}</p>
                    </button>
                  </article>
                );
              })}
            </div>

            <div ref={sentinelRef} className="csp-news-scroll-sentinel" aria-hidden />
            {isFetchingMore ? (
              <p className="csp-panel-lead csp-news-loading-more">Loading more…</p>
            ) : null}
          </>
        ) : null}
      </div>

      <NewsArticleDrawer
        open={drawerOpen}
        siteId={siteId}
        article={drawerArticle}
        events={eventOptions}
        onClose={closeDrawer}
        onSaved={() => {
          setExtraItems([]);
          void refetch();
        }}
      />
    </>
  );
}
