"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import homeHeroImage from "@/assets/home-hero.jpg";
import { useGetPublicEventsQuery } from "@/apis/public/publicEventsApi";
import { EventCard } from "@/components/public/EventCard";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const { data, isLoading, isFetching, isError } = useGetPublicEventsQuery({
    search: search || undefined,
    per_page: 24,
  });

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
    setSearch(searchInput.trim());
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader
        showFavorites
        isFavorite={wishlistedIds.size > 0}
        favoriteCount={wishlistedIds.size}
      />

      <form
        onSubmit={handleSearchSubmit}
        className="flex h-[35px] items-center gap-3 border-b border-black/80 px-5 md:px-8"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-black"
        >
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="What are you looking for?"
          aria-label="Search events"
          className="h-full min-w-0 flex-1 bg-transparent text-[10px] uppercase text-black placeholder:text-black/55 focus:outline-none"
        />
      </form>

      <section
        aria-label="Discover live events"
        className="relative h-[calc(100svh-152px)] min-h-[420px] max-h-[780px] overflow-hidden bg-black"
      >
        <Image
          src={homeHeroImage}
          alt="A crowd enjoying a live concert beneath bright stage lights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <Link href="#events" className="absolute inset-0" aria-label="Explore events" />
      </section>

      <section id="events" aria-label="Upcoming events" className="bg-white">
        <div className="flex h-[48px] items-center justify-between border-b border-black/20 px-5 text-[12px] md:px-8">
          <p aria-live="polite" className="font-medium">
            {isLoading || isFetching
              ? "Loading events…"
              : `${sortedEvents.length} Event${sortedEvents.length === 1 ? "" : "s"}`}
          </p>
          <label className="flex items-center gap-2 text-[10px] font-medium uppercase">
            Sort by
            <select
              aria-label="Sort events"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-8 bg-transparent pr-1 text-[10px] font-medium uppercase outline-none"
            >
              <option value="featured">Featured</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
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
          <div className="grid grid-cols-1 gap-px bg-transparent sm:grid-cols-2 xl:grid-cols-4">
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

      <SiteFooter />
    </main>
  );
}
