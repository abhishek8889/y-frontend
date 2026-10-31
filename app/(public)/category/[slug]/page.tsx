"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useGetEventCategoriesQuery } from "@/apis/events/eventsApi";
import {
  useGetPublicEventsQuery,
  useLazyGetPublicEventsQuery,
  type PublicEventListItem,
} from "@/apis/public/publicEventsApi";
import { EventCard } from "@/components/public/EventCard";
import { SelectField } from "@/components/ui/SelectField";
import { resolveCategorySlug } from "@/lib/public/categorySlug";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

const PAGE_SIZE = 10;

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "").trim();
  const [sortBy, setSortBy] = useState("featured");
  const [extraEvents, setExtraEvents] = useState<PublicEventListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreLock = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: categoriesData } = useGetEventCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const category = useMemo(
    () => categories.find((item) => resolveCategorySlug(item) === slug) ?? null,
    [categories, slug],
  );

  const { data, isLoading, isError, isFetching } = useGetPublicEventsQuery(
    {
      event_category_slug: slug || undefined,
      per_page: PAGE_SIZE,
    },
    { skip: !slug },
  );

  const [fetchMore, { isFetching: isFetchingMore }] = useLazyGetPublicEventsQuery();

  // Reset appended pages whenever the category (or first page) changes.
  useEffect(() => {
    setExtraEvents([]);
    loadMoreLock.current = false;
    const pagination = data?.data?.pagination;
    setNextCursor(pagination?.next_cursor ?? null);
    setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [slug, data]);

  const { wishlistedIds, toggleWishlist, isMutating } = useWishlistIds();

  const allEvents = useMemo(() => {
    const first = data?.data?.items ?? [];
    const seen = new Set<number>();
    const merged: PublicEventListItem[] = [];
    for (const event of [...first, ...extraEvents]) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(event);
    }
    return merged;
  }, [data?.data?.items, extraEvents]);

  const sortedEvents = useMemo(() => {
    const items = [...allEvents];
    if (sortBy === "name") {
      return items.sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
    }
    if (sortBy === "oldest") {
      return items.sort((a, b) => {
        const aTime = a.starts_at ? new Date(a.starts_at).getTime() : 0;
        const bTime = b.starts_at ? new Date(b.starts_at).getTime() : 0;
        return aTime - bTime || a.id - b.id;
      });
    }
    return items;
  }, [allEvents, sortBy]);

  const loadMore = useCallback(async () => {
    if (!slug || !nextCursor || !hasMore) return;
    if (isFetchingMore || isFetching || loadMoreLock.current) return;

    loadMoreLock.current = true;
    try {
      const result = await fetchMore({
        event_category_slug: slug,
        per_page: PAGE_SIZE,
        cursor: nextCursor,
      }).unwrap();

      const pageItems = result.data?.items ?? [];
      const pagination = result.data?.pagination;
      if (pageItems.length) {
        setExtraEvents((prev) => [...prev, ...pageItems]);
      }
      setNextCursor(pagination?.next_cursor ?? null);
      setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
    } catch {
      // Keep current list; user can scroll again to retry.
    } finally {
      loadMoreLock.current = false;
    }
  }, [slug, nextCursor, hasMore, isFetchingMore, isFetching, fetchMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !slug) return;

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
  }, [slug, loadMore, sortedEvents.length]);

  const title = category?.name || slug.replace(/-/g, " ");
  const showInitialLoading = isLoading && !data;

  return (
    <main className="category-page">
      <header className="category-page__toolbar">
        <p aria-live="polite" className="category-page__count">
          {!slug || showInitialLoading
            ? "Loading…"
            : `${sortedEvents.length} Event${sortedEvents.length === 1 ? "" : "s"}`}
        </p>
        <h1 className="category-page__title">{title}</h1>
        <SelectField
          name="eventSort"
          aria-label="Sort events"
          label="Sort by"
          labelClassName="home-events__sort-label"
          value={sortBy}
          options={SORT_OPTIONS}
          density="compact"
          onChange={(event) => setSortBy(event.target.value)}
          wrapperClassName="home-events__sort-wrap category-page__sort"
          containerClassName="home-events__sort-box"
          className="home-events__sort-select"
        />
      </header>

      {!slug ? (
        <p className="home-events__status" role="alert">
          Category not found.
        </p>
      ) : isError && !data ? (
        <p role="alert" className="home-events__status home-events__status--error">
          Unable to load events. Please try again.
        </p>
      ) : showInitialLoading ? (
        <p role="status" className="home-events__status">
          Loading events…
        </p>
      ) : sortedEvents.length === 0 ? (
        <p className="home-events__status">No events in this category yet.</p>
      ) : (
        <>
          <div className="category-page__grid">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isWishlisted={wishlistedIds.has(event.id)}
                wishlistDisabled={isMutating}
                onToggleWishlist={(eventId) => void toggleWishlist(eventId)}
              />
            ))}
          </div>
          {hasMore ? (
            <div ref={sentinelRef} className="category-page__scroll-sentinel" aria-hidden />
          ) : null}
        </>
      )}
    </main>
  );
}
