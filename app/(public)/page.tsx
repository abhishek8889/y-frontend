"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import homeHeroImage from "@/assets/home-hero.jpg";
import yourlistLogo from "@/assets/yourlist-logo.png";
import { SiteFooter } from "@/components/public/SiteFooter";
import eventCover from "@/assets/event-cover.jpg";

const events = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: "The Closing Party",
  date: "Sun, Feb 22, 6:00 PM",
  venue: "The Key Corner",
  imagePosition: ["center", "35% center", "65% center", "center 70%", "20% center", "80% center", "center 25%", "center"][
    index
  ],
}));

export default function HomePage() {
  const [isFavorite, setIsFavorite] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [favoriteEvents, setFavoriteEvents] = useState<number[]>([]);
  const sortedEvents = [...events].sort((first, second) => {
    if (sortBy === "name") return first.title.localeCompare(second.title) || first.id - second.id;
    if (sortBy === "oldest") return second.id - first.id;
    return first.id - second.id;
  });

  function toggleEventFavorite(eventId: number) {
    setFavoriteEvents((current) =>
      current.includes(eventId)
        ? current.filter((favoriteId) => favoriteId !== eventId)
        : [...current, eventId],
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="relative flex h-[44px] items-center justify-between border-b border-black/80 px-5 md:px-8">
        <Link href="/events" className="text-[11px] font-medium uppercase text-black hover:opacity-60">
          Events
        </Link>

        <Link href="/" aria-label="Yourlist home" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image src={yourlistLogo} alt="Yourlist" priority className="h-auto w-[76px]" />
        </Link>

        <nav aria-label="Account navigation" className="ml-auto flex h-full items-center gap-3 md:gap-5">
          <Link href="/login" className="text-[11px] font-medium uppercase text-black hover:opacity-60">
            Login
          </Link>
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "View favorites"}
            onClick={() => setIsFavorite((value) => !value)}
            className="relative flex h-8 w-7 items-center justify-center text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true">
              <path d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {isFavorite ? <span className="absolute right-[-2px] top-0 flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-black px-[3px] text-[8px] leading-none text-white">1</span> : null}
          </button>
          <Link href="/dashboard" className="flex h-[28px] items-center justify-center bg-black px-5 text-[9px] font-medium uppercase text-white transition hover:bg-black/75">
            Organiser
          </Link>
        </nav>
      </header>

      <form action="/events" className="flex h-[35px] items-center gap-3 border-b border-black/80 px-5 md:px-8">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-black">
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="What are you looking for?"
          aria-label="Search events"
          className="h-full min-w-0 flex-1 bg-transparent text-[10px] uppercase text-black placeholder:text-black/55 focus:outline-none"
        />
      </form>

      <section aria-label="Discover live events" className="relative h-[calc(100svh-152px)] min-h-[420px] max-h-[780px] overflow-hidden bg-black">
        <Image
          src={homeHeroImage}
          alt="A crowd enjoying a live concert beneath bright stage lights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <Link href="/events" className="absolute inset-0" aria-label="Explore events" />
      </section>

      <section aria-label="Upcoming events" className="bg-white">
        <div className="flex h-[48px] items-center justify-between border-b border-black/20 px-5 text-[12px] md:px-8">
          <p aria-live="polite" className="font-medium">{events.length} Events</p>
          <label className="flex items-center gap-2 text-[10px] font-medium uppercase">
            Sort by
            <select
              aria-label="Sort events"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-8 bg-transparent pr-1 text-[10px] font-medium uppercase outline-none"
            >
              <option value="featured">Featured</option>
              <option value="oldest">Newest</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-px bg-black/50 sm:grid-cols-2 xl:grid-cols-4">
          {sortedEvents.map((event) => {
            const isEventFavorite = favoriteEvents.includes(event.id);

            return (
              <article key={event.id} className="min-w-0 bg-white">
                <div className="relative aspect-[0.88/1] overflow-hidden bg-black">
                  <Link href={`/event/${event.id}`} aria-label={`View ${event.title}`} className="absolute inset-0">
                    <Image
                      src={eventCover}
                      alt="Concert crowd beneath bright stage lights"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      style={{ objectPosition: event.imagePosition }}
                    />
                  </Link>
                  <button
                    type="button"
                    aria-label={isEventFavorite ? "Remove event from favorites" : "Add event to favorites"}
                    aria-pressed={isEventFavorite}
                    onClick={() => toggleEventFavorite(event.id)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-black transition hover:bg-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isEventFavorite ? "currentColor" : "none"} aria-hidden="true">
                      <path d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <Link href={`/event/${event.id}`} className="flex min-h-[90px] flex-col items-center justify-center px-3 py-4 text-center hover:bg-black/[0.025]">
                  <h2 className="text-[12px] font-bold uppercase leading-[16px] text-black">{event.title}</h2>
                  <p className="mt-1 text-[12px] leading-[16px] text-black/75">{event.date}</p>
                  <p className="mt-0.5 text-[11px] font-bold leading-[15px] text-black">{event.venue}</p>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
