"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetPublicEventsQuery,
  useLazyGetPublicEventsQuery,
  type PublicEventListItem,
} from "@/apis/public/publicEventsApi";
import { MediaPlayer } from "@/components/common";
import { CategoryNav } from "@/components/public/CategoryNav";
import { EventCard } from "@/components/public/EventCard";
import { HeroCtaButton } from "@/components/public/HeroCtaButton";
import { PUBLIC_SEARCH_EVENT } from "@/components/public/PublicSiteHeader";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const HOME_HERO_VIDEO = "/landing/home-hero-2.mp4";
const PAGE_SIZE = 10;

function scrollToEvents() {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  document.getElementById("events")?.scrollIntoView({ behavior, block: "start" });
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const scrollAfterSearch = useRef(false);
  const [extraEvents, setExtraEvents] = useState<PublicEventListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreLock = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function runSearch(value: string) {
    const next = value.trim();
    setSearch(next);
    if (!next) {
      scrollAfterSearch.current = false;
      setSearching(false);
      return;
    }
    scrollAfterSearch.current = true;
    setSearching(true);
  }

  useEffect(() => {
    function readUrlQuery() {
      const value = new URLSearchParams(window.location.search).get("q") ?? "";
      runSearch(value);
    }

    function handleSearchEvent(event: Event) {
      runSearch((event as CustomEvent<string>).detail ?? "");
    }

    readUrlQuery();
    window.addEventListener(PUBLIC_SEARCH_EVENT, handleSearchEvent);
    window.addEventListener("popstate", readUrlQuery);
    return () => {
      window.removeEventListener(PUBLIC_SEARCH_EVENT, handleSearchEvent);
      window.removeEventListener("popstate", readUrlQuery);
    };
  }, []);

  const { data, isLoading, isFetching, isError } = useGetPublicEventsQuery({
    search: search || undefined,
    per_page: PAGE_SIZE,
  });

  const [fetchMore, { isFetching: isFetchingMore }] = useLazyGetPublicEventsQuery();

  useEffect(() => {
    setExtraEvents([]);
    loadMoreLock.current = false;
    const pagination = data?.data?.pagination;
    setNextCursor(pagination?.next_cursor ?? null);
    setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [search, data]);

  useEffect(() => {
    if (!searching) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const blockScroll = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
  }, [searching]);

  useEffect(() => {
    if (!searching || isLoading || isFetching) return;
    setSearching(false);
  }, [searching, isLoading, isFetching, data, isError]);

  useEffect(() => {
    if (searching || !scrollAfterSearch.current) return;
    scrollAfterSearch.current = false;
    const frame = window.requestAnimationFrame(() => scrollToEvents());
    return () => window.cancelAnimationFrame(frame);
  }, [searching]);

  const { wishlistedIds, toggleWishlist, isMutating } = useWishlistIds();

  const events = useMemo(() => {
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

  const [featuredEvent, ...restEvents] = events;

  const loadMore = useCallback(async () => {
    if (!nextCursor || !hasMore) return;
    if (isFetchingMore || isFetching || loadMoreLock.current) return;

    loadMoreLock.current = true;
    try {
      const result = await fetchMore({
        search: search || undefined,
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
  }, [nextCursor, hasMore, isFetchingMore, isFetching, fetchMore, search]);

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
  }, [loadMore, events.length]);

  return (
    <main className="home-page">
      <section aria-label="Discover live events" className="home-hero">
        <MediaPlayer
          media={{ url: HOME_HERO_VIDEO, media_type: "video" }}
          alt="A crowd enjoying a live concert beneath bright stage lights"
          active
          showProgress={false}
          frameClassName="home-hero__player"
          controlsClassName="home-hero-media-controls"
        />
        <div className="home-hero__content">
          <h1 className="home-hero__title font-heading">
            Make every moment special
          </h1>
          <div className="home-hero__actions">
            <HeroCtaButton href="#events">Events</HeroCtaButton>
            <HeroCtaButton href="/#categories">Discover more</HeroCtaButton>
          </div>
        </div>
      </section>

      <CategoryNav className="home-categories" />

      <section id="events" aria-label="Upcoming events" className="home-events">
        <h2 className="home-events__heading">Explore Events</h2>

        {isError && !data ? (
          <p role="alert" className="home-events__status home-events__status--error">
            Unable to load events. Please try again.
          </p>
        ) : isLoading && !data ? (
          <p role="status" className="home-events__status">
            Loading events…
          </p>
        ) : events.length === 0 ? (
          <p className="home-events__status">
            {search ? "No events match your search." : "No published events yet."}
          </p>
        ) : (
          <>
            <div className="home-events__grid">
              {featuredEvent ? (
                <EventCard
                  key={featuredEvent.id}
                  event={featuredEvent}
                  featured
                  isWishlisted={wishlistedIds.has(featuredEvent.id)}
                  wishlistDisabled={isMutating}
                  onToggleWishlist={(eventId) => void toggleWishlist(eventId)}
                />
              ) : null}
              {restEvents.map((event) => (
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
              <div ref={sentinelRef} className="home-events__scroll-sentinel" aria-hidden />
            ) : null}
          </>
        )}
      </section>

      {searching ? (
        <div role="status" aria-live="assertive" className="home-searching">
          <span className="home-searching__label">
            <span className="home-searching__spinner" />
            Searching
          </span>
        </div>
      ) : null}
    </main>
  );
}
