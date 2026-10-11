"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import eventCover from "@/assets/event-cover.jpg";
import homeHeroImage from "@/assets/home-hero.jpg";
import signupImage from "@/assets/signup-image.png";
import { SiteFooter, SiteHeader } from "@/components/public";

const events = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: "The Closing Party",
  date: "Sun, Feb 22, 6:00 PM",
  venue: "Keys Park Road, Hednesford",
  image: [eventCover, signupImage, homeHeroImage, eventCover][index % 4],
}));

export function PublicEventsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [favoriteEvents, setFavoriteEvents] = useState<number[]>([]);

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = events.filter((event) =>
      `${event.title} ${event.date} ${event.venue}`.toLowerCase().includes(query),
    );

    if (sortBy === "name") {
      return [...filtered].sort((first, second) => first.title.localeCompare(second.title));
    }
    if (sortBy === "oldest") return [...filtered].reverse();
    return filtered;
  }, [search, sortBy]);

  function toggleFavorite(eventId: number) {
    setFavoriteEvents((current) =>
      current.includes(eventId)
        ? current.filter((favoriteId) => favoriteId !== eventId)
        : [...current, eventId],
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader activePage="events" />

      <form
        role="search"
        className="flex h-[35px] items-center gap-3 border-b border-black/80 px-5 md:px-8"
        onSubmit={(event) => event.preventDefault()}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-black">
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="What are you looking for?"
          aria-label="Search events"
          className="h-full min-w-0 flex-1 bg-transparent text-[10px] uppercase text-black placeholder:text-black/55 focus:outline-none"
        />
      </form>

      <h1 className="flex h-[39px] items-center justify-center border-b border-black/80 text-[13px] font-bold uppercase">
        Events
      </h1>

      <section aria-label="Upcoming events">
        <div className="flex h-[27px] items-center justify-between border-b border-black/25 px-3 text-[10px]">
          <p aria-live="polite">{visibleEvents.length} Events</p>
          <label className="flex items-center gap-2 uppercase">
            Sort by
            <select
              aria-label="Sort events"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-7 bg-transparent pr-1 text-[10px] uppercase outline-none"
            >
              <option value="featured">Featured</option>
              <option value="oldest">Newest</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        {visibleEvents.length ? (
          <div className="grid grid-cols-1 gap-px bg-black/50 sm:grid-cols-2 xl:grid-cols-4">
            {visibleEvents.map((event) => {
              const isFavorite = favoriteEvents.includes(event.id);

              return (
                <article key={event.id} className="min-w-0 bg-white">
                  <div className="relative aspect-[0.88/1] overflow-hidden bg-black">
                    <Link href={`/event/${event.id}`} aria-label={`View ${event.title}`} className="absolute inset-0">
                      <Image
                        src={event.image}
                        alt="Crowd enjoying a live event"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </Link>
                    <button
                      type="button"
                      aria-label={isFavorite ? "Remove event from favorites" : "Add event to favorites"}
                      aria-pressed={isFavorite}
                      onClick={() => toggleFavorite(event.id)}
                      className="absolute bottom-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-black transition hover:bg-white"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true">
                        <path d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <Link
                    href={`/event/${event.id}`}
                    className="flex min-h-[72px] flex-col items-center justify-center px-3 py-2 text-center hover:bg-black/[0.025]"
                  >
                    <h2 className="text-[10px] font-bold uppercase leading-[14px]">{event.title}</h2>
                    <p className="mt-0.5 text-[10px] leading-[13px]">{event.date}</p>
                    <p className="text-[10px] font-medium leading-[13px]">{event.venue}</p>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-12 text-center text-[13px] text-black/60" role="status">
            No events match your search.
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
