"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import homeHeroImage from "@/assets/home-hero.jpg";
import { useGetPublicEventsQuery } from "@/apis/public/publicEventsApi";
import { EventCard } from "@/components/public/EventCard";
import { PUBLIC_SEARCH_EVENT } from "@/components/public/PublicSiteHeader";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

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
    <main className="bg-white text-black">
      <form
        onSubmit={handleSearchSubmit}
        className="public-bar hidden items-center gap-3 border-b border-black bg-white px-5 sm:flex sm:px-10"
      >
        <img src="/landing/search.svg" width={26} height={26} alt="" className="shrink-0 -scale-y-100" />
        <input
          type="search"
          name="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="What are you looking for?"
          aria-label="Search events"
          className="h-full min-w-0 flex-1 bg-transparent text-[12px] uppercase leading-[15.6px] text-black placeholder:text-black/60 focus:outline-none"
        />
      </form>

      <section aria-label="Discover live events" className="relative aspect-[2/1] w-full overflow-hidden bg-black">
        <Image
          src={homeHeroImage}
          alt="A crowd enjoying a live concert beneath bright stage lights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <Link href="#events" className="absolute inset-0" aria-label="Explore events" />
        <div className="pointer-events-none absolute right-6 bottom-[26px] z-10 flex items-center gap-[9px] sm:right-[43px]">
          <span className="relative block h-[31px] w-[31px]">
            <img src="/landing/hero-pause-bg.svg" width={30.8695} height={30.8695} alt="" />
            <img
              src="/landing/hero-pause.svg"
              width={13.8913}
              height={13.8913}
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </span>
          <img src="/landing/hero-next.svg" width={30.8695} height={30.8695} alt="" />
        </div>
      </section>

      <section id="events" aria-label="Upcoming events" className="bg-white">
        <div className="flex h-11 items-center justify-between border-t border-black px-5">
          <p aria-live="polite" className="text-[14px] leading-[14px]">
            {isLoading
              ? "Loading events…"
              : `${sortedEvents.length} Event${sortedEvents.length === 1 ? "" : "s"}`}
          </p>
          <label className="relative flex items-center text-[11.6px] uppercase leading-[15.6px] tracking-[0.36px]">
            Sort by
            <select
              aria-label="Sort events"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="featured">Featured</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
            <span className="pointer-events-none inline-flex rotate-90">
              <img src="/landing/sort-chevron.svg" width={28.37} height={28} alt="" />
            </span>
          </label>
        </div>

        {isError ? (
          <p role="alert" className="px-5 py-10 text-center text-[14px] text-[#b42318] md:px-8">
            Unable to load events. Please try again.
          </p>
        ) : isLoading ? (
          <p role="status" className="px-5 py-10 text-center text-[14px] text-black/60 md:px-8">
            Loading events…
          </p>
        ) : sortedEvents.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-black/60 md:px-8">
            {search ? "No events match your search." : "No published events yet."}
          </p>
        ) : (
          <div className="-mb-px grid grid-cols-1 border-t border-black sm:grid-cols-2 xl:grid-cols-4">
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
        <div
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-white"
        >
          <span className="flex flex-col items-center gap-4 text-[12px] uppercase tracking-[0.08em] text-black">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-black/15 border-t-black" />
            Searching
          </span>
        </div>
      ) : null}
    </main>
  );
}
