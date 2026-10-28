"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetPublicEventsQuery } from "@/apis/public/publicEventsApi";
import { MediaPlayer } from "@/components/common";
import { EventCard } from "@/components/public/EventCard";
import { PUBLIC_SEARCH_EVENT } from "@/components/public/PublicSiteHeader";
import { SelectField } from "@/components/ui/SelectField";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const HOME_HERO_VIDEO = "/landing/home-hero-2.mp4";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

function scrollToEvents() {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.getElementById("events")?.scrollIntoView({ behavior, block: "start" });
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const scrollAfterSearch = useRef(false);

  function runSearch(value: string) {
    const next = value.trim();
    setSearchInput(next);
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
    per_page: 24,
  });

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

  const sortedEvents = useMemo(() => {
    const items = [...(data?.data?.items ?? [])];
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
    // featured / newest first (API already orders by starts_at desc)
    return items;
  }, [data?.data?.items, sortBy]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(searchInput);
  }

  return (
    <main className="home-page">
      <form onSubmit={handleSearchSubmit} className="public-bar home-search">
        <img
          src="/landing/search.svg"
          width={26}
          height={26}
          alt=""
          className="home-search__icon"
        />
        <input
          type="search"
          name="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="What are you looking for?"
          aria-label="Search events"
          className="home-search__input"
        />
      </form>

      <section aria-label="Discover live events" className="home-hero">
        <MediaPlayer
          media={{ url: HOME_HERO_VIDEO, media_type: "video" }}
          alt="A crowd enjoying a live concert beneath bright stage lights"
          active
          showProgress={false}
          frameClassName="home-hero__player"
          controlsClassName="home-hero-media-controls"
        />
        {/* Leave bottom control bar free for play / mute */}
        <Link href="#events" className="home-hero__hit" aria-label="Explore events" />
      </section>

      <section id="events" aria-label="Upcoming events" className="home-events">
        <div className="home-events__toolbar">
          <p aria-live="polite" className="home-events__count">
            {isLoading
              ? "Loading events…"
              : `${sortedEvents.length} Event${sortedEvents.length === 1 ? "" : "s"}`}
          </p>
          <SelectField
            name="eventSort"
            aria-label="Sort events"
            label="Sort by"
            labelClassName="home-events__sort-label"
            value={sortBy}
            options={SORT_OPTIONS}
            density="compact"
            onChange={(event) => setSortBy(event.target.value)}
            wrapperClassName="home-events__sort-wrap"
            containerClassName="home-events__sort-box"
            className="home-events__sort-select"
          />
        </div>

        {isError ? (
          <p role="alert" className="home-events__status home-events__status--error">
            Unable to load events. Please try again.
          </p>
        ) : isLoading ? (
          <p role="status" className="home-events__status">
            Loading events…
          </p>
        ) : sortedEvents.length === 0 ? (
          <p className="home-events__status">
            {search ? "No events match your search." : "No published events yet."}
          </p>
        ) : (
          <div className="home-events__grid">
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
