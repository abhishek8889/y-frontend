"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import eventCover from "@/assets/event-cover.jpg";
import {
  useGetPublicEventDetailsQuery,
  useGetPublicEventTicketsQuery,
} from "@/apis/public/publicEventsApi";
import { EventTicketBooking } from "@/components/public/EventTicketBooking";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import {
  formatPublicEventLongDate,
  formatPublicEventTime,
  formatTicketPriceRange,
  getEventBannerUrl,
} from "@/lib/events/publicEventFormat";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const uniqueId = typeof id === "string" ? id : "";

  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetPublicEventDetailsQuery(uniqueId, { skip: !uniqueId });

  const {
    data: ticketsResponse,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
  } = useGetPublicEventTicketsQuery(uniqueId, { skip: !uniqueId });

  const event = detailsResponse?.data;
  const tickets = useMemo(() => ticketsResponse?.data ?? [], [ticketsResponse?.data]);
  const priceRange = useMemo(() => formatTicketPriceRange(tickets), [tickets]);

  const { wishlistedIds, toggleWishlist, isMutating } = useWishlistIds();
  const isWishlisted = event ? wishlistedIds.has(event.id) : false;

  const [isPlaying, setIsPlaying] = useState(true);

  const galleryImages = useMemo(() => {
    const urls = (event?.images ?? [])
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url?.trim()));
    if (urls.length) return urls;
    const banner = getEventBannerUrl(event?.images);
    return banner ? [banner] : [eventCover.src];
  }, [event]);

  const locationLabel = useMemo(() => {
    const address = event?.venue?.address;
    if (!address) return null;
    return [address.city, address.state, address.country].filter(Boolean).join(", ") || null;
  }, [event]);

  const organisationName = event?.organisation?.name?.trim() || "Organiser";
  const organisationInitial = organisationName.charAt(0).toUpperCase() || "O";

  if (!uniqueId) {
    return (
      <main className="min-h-screen bg-white text-black">
        <PublicSiteHeader />
        <p className="px-5 py-12 text-center text-[14px] text-[#b42318]">Invalid event link.</p>
      </main>
    );
  }

  if (isDetailsLoading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <PublicSiteHeader />
        <p role="status" className="px-5 py-12 text-center text-[14px] text-black/60">
          Loading event…
        </p>
      </main>
    );
  }

  if (isDetailsError || !event) {
    return (
      <main className="min-h-screen bg-white text-black">
        <PublicSiteHeader />
        <div className="px-5 py-12 text-center md:px-8">
          <p role="alert" className="text-[14px] text-[#b42318]">
            Event not found or unavailable.
          </p>
          <Link href="/" className="mt-4 inline-flex text-[12px] font-medium uppercase underline">
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader />

      <nav
        aria-label="Breadcrumb"
        className="flex h-[34px] items-center border-b border-black/70 px-5 text-[10px] uppercase text-black/70 md:px-8"
      >
        <Link href="/" className="hover:text-black">
          Events
        </Link>
        <span className="mx-2">/</span>
        <span>{event.venue?.name || "Venue"}</span>
        <span className="mx-2">/</span>
        <span className="truncate text-black">{event.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2">
        <section
          aria-label="Event photos"
          className="relative h-[62svh] min-h-[390px] overflow-hidden bg-black lg:sticky lg:top-0 lg:h-[calc(100svh-78px)] lg:min-h-[540px]"
        >
          <div className={`event-gallery-track ${isPlaying ? "" : "event-gallery-paused"}`}>
            {[...galleryImages, ...galleryImages].map((image, index) => (
              <div
                key={`${index}-${typeof image === "string" ? image : index}`}
                className="relative h-[62svh] min-h-[390px] w-full lg:h-[78svh] lg:min-h-[540px]"
              >
                <Image
                  src={image}
                  alt={`${event.name} photo ${(index % galleryImages.length) + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover object-center"
                  unoptimized={typeof image === "string"}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            disabled={isMutating}
            onClick={() => void toggleWishlist(event.id, event.organisation_id)}
            className="absolute right-5 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white disabled:opacity-60"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              aria-hidden="true"
            >
              <path
                d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause photo carousel" : "Play photo carousel"}
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying((playing) => !playing)}
            className="absolute bottom-4 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white"
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="M3 2h3v10H3zM8 2h3v10H8z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="m4 2 8 5-8 5V2Z" />
              </svg>
            )}
          </button>
        </section>

        <section className="flex min-h-[660px] flex-col px-6 py-10 sm:px-10 lg:min-h-[calc(100svh-78px)] lg:px-[min(8vw,112px)] lg:py-12">
          <div className="mx-auto w-full max-w-[540px]">
            <div className="text-center">
              <h1 className="text-[23px] font-bold uppercase leading-[28px]">{event.name}</h1>
              <p className="mt-2 text-[12px] uppercase text-black/60">Organised by</p>
              <div className="mt-1 flex items-center justify-center gap-2 text-[13px] font-bold uppercase">
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-black text-[10px]"
                >
                  {organisationInitial}
                </span>
                {organisationName}
              </div>
            </div>

            <div className="mt-7 flex justify-between gap-4 border-t border-black/50 pt-3 text-[12px]">
              <p>
                <strong>Date:</strong> {formatPublicEventLongDate(event.starts_at, event.timezone)}
              </p>
              <p className="shrink-0">
                <strong>Time:</strong> {formatPublicEventTime(event.starts_at, event.timezone)}
              </p>
            </div>
            {priceRange ? (
              <p className="mt-3 text-[12px]">
                <strong>Price:</strong> {priceRange}
              </p>
            ) : null}

            {isTicketsLoading ? (
              <p role="status" className="mt-4 text-[13px] text-black/60">
                Loading tickets…
              </p>
            ) : isTicketsError ? (
              <p role="alert" className="mt-4 text-[13px] text-[#b42318]">
                Unable to load tickets for this event.
              </p>
            ) : (
              <EventTicketBooking event={event} tickets={tickets} stripePromise={stripePromise} />
            )}

            <section aria-labelledby="event-information-title" className="mt-7">
              <h2 id="event-information-title" className="text-[13px] font-bold">
                Event information
              </h2>
              <dl className="mt-2 space-y-1 text-[11px] uppercase leading-[17px]">
                {event.category?.name ? (
                  <div>
                    <dt className="inline font-bold">Event type: </dt>
                    <dd className="inline">{event.category.name}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="inline font-bold">Event starts: </dt>
                  <dd className="inline">{formatPublicEventTime(event.starts_at, event.timezone)}</dd>
                </div>
                {event.venue?.name ? (
                  <div>
                    <dt className="inline font-bold">Venue: </dt>
                    <dd className="inline">{event.venue.name}</dd>
                  </div>
                ) : null}
                {locationLabel ? (
                  <div>
                    <dt className="inline font-bold">Location: </dt>
                    <dd className="inline">{locationLabel}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <details className="mt-6 border-y border-black/40 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase">
                About the event
                <span aria-hidden="true">⌄</span>
              </summary>
              <p className="pt-3 text-[13px] leading-5 text-black/70 whitespace-pre-wrap">
                {event.description?.trim() || "More details for this event will appear here."}
              </p>
            </details>
            <details className="border-b border-black/40 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase">
                Terms &amp; conditions
                <span aria-hidden="true">⌄</span>
              </summary>
              <p className="pt-3 text-[13px] leading-5 text-black/70">
                Tickets are subject to availability. Entry is subject to venue terms and age
                restrictions.
              </p>
            </details>
          </div>

          <p className="mt-auto pt-12 text-center text-[11px] leading-[17px] text-black/45">
            You can pay securely with credit card (VISA,
            <br className="hidden sm:block" /> Mastercard, American Express)
          </p>
        </section>
      </div>
    </main>
  );
}
