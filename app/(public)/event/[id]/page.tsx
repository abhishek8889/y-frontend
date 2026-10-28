"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import eventCover from "@/assets/event-cover.jpg";
import type { PublicEventImage } from "@/apis/public/publicEventsApi";
import {
  useGetPublicEventDetailsQuery,
  useGetPublicEventTicketsQuery,
} from "@/apis/public/publicEventsApi";
import { Breadcrumb, MediaPlayer } from "@/components/common";
import { EventTicketBooking } from "@/components/public/EventTicketBooking";
import { WishlistIcon } from "@/components/public/WishlistIcon";
import {
  formatUtcDateTime,
  formatTicketPriceRange,
  getEventBanner,
} from "@/lib/events/publicEventFormat";
import { isVideoMedia } from "@/lib/media/isVideoMedia";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/** Header and breadcrumb are both 46px. Full-height gallery starts at the desktop split. */
const GALLERY_VIEWPORT =
  "relative overflow-y-auto overscroll-contain bg-white lg:sticky lg:top-0 lg:h-[calc(100svh-92px)]";
const GALLERY_SLIDE =
  "relative w-full shrink-0 snap-start aspect-[4/5] sm:aspect-[3/2] lg:aspect-auto lg:h-[calc(100svh-92px)]";

function AccordionChevron() {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
    >
      <path
        d="M1 1.25 6 6.25 11 1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildEventGalleryMedia(images: PublicEventImage[] | null | undefined): PublicEventImage[] {
  const list = images ?? [];
  const banner = getEventBanner(list);
  const gallery = list.filter(
    (image) => image.type === "gallery" && image.url?.trim() && image !== banner,
  );

  const items: PublicEventImage[] = [];
  if (banner?.url?.trim()) items.push(banner);
  for (const item of gallery) items.push(item);

  if (!items.length) {
    for (const image of list) {
      if (image.url?.trim()) items.push(image);
    }
  }

  return items;
}

function EventGallerySlide({
  media,
  alt,
  active,
  priority = false,
}: {
  media: PublicEventImage | null;
  alt: string;
  active: boolean;
  priority?: boolean;
}) {
  const isVideo = Boolean(media?.url) && isVideoMedia(media);

  if (isVideo && media) {
    return (
      <MediaPlayer
        media={media}
        alt={alt}
        active={active}
        showProgress={false}
        frameClassName="absolute inset-0 h-full w-full"
        controlsClassName="event-media-controls"
      />
    );
  }

  const src = media?.url?.trim() || eventCover.src;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 1023px) 100vw, 50vw"
      className="object-cover object-center"
      unoptimized={typeof src === "string"}
    />
  );
}

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

  const galleryMedia = useMemo(() => buildEventGalleryMedia(event?.images), [event?.images]);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryScrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = galleryScrollRef.current;
    if (!root || !galleryMedia.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = 0;
        let bestRatio = 0;
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.slideIndex);
          if (!Number.isFinite(index)) continue;
          if (entry.isIntersecting && entry.intersectionRatio >= bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        }
        if (bestRatio > 0) setActiveSlide(bestIndex);
      },
      {
        // Use the gallery pane when it scrolls; otherwise the viewport (mobile page scroll).
        root: root.scrollHeight > root.clientHeight + 8 ? root : null,
        threshold: [0.35, 0.55, 0.75],
      },
    );

    for (const node of slideRefs.current) {
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [galleryMedia]);

  const locationLabel = useMemo(() => {
    const address = event?.venue?.address;
    if (!address) return null;
    return [address.city, address.state, address.country].filter(Boolean).join(", ") || null;
  }, [event]);

  const organisationName = event?.organisation?.name?.trim() || "Organiser";
  const organisationInitial = organisationName.charAt(0).toUpperCase() || "O";

  if (!uniqueId) {
    return (
      <main className="bg-white text-black">
        <p className="px-5 py-12 text-center text-[14px] text-[#b42318]">Invalid event link.</p>
      </main>
    );
  }

  if (isDetailsLoading) {
    return (
      <main className="bg-white text-black">
        <p role="status" className="px-5 py-12 text-center text-[14px] text-black/60">
          Loading event…
        </p>
      </main>
    );
  }

  if (isDetailsError || !event) {
    return (
      <main className="bg-white text-black">
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

  const slides = galleryMedia.length
    ? galleryMedia
    : [{ url: eventCover.src, type: "banner", media_type: "image" } as PublicEventImage];

  return (
    <main className="bg-white text-black">
      <Breadcrumb
        items={[
          { label: "Events", href: "/" },
          { label: event.venue?.name || "Venue" },
          { label: event.name },
        ]}
      />

      <div className="grid lg:grid-cols-2">
        <section
          ref={galleryScrollRef}
          aria-label="Event media gallery"
          className={`${GALLERY_VIEWPORT} snap-y snap-mandatory`}
        >
          {slides.map((media, index) => (
            <div
              key={`${media.path || media.url || "slide"}-${index}`}
              data-slide-index={index}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className={GALLERY_SLIDE}
            >
              <div className="absolute inset-0">
                <EventGallerySlide
                  media={media}
                  alt={`${event.name} media ${index + 1}`}
                  active={activeSlide === index}
                  priority={index === 0}
                />
              </div>
              {index < slides.length - 1 ? (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1 bg-white"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}

          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            disabled={isMutating}
            onClick={() => void toggleWishlist(event.id, event.organisation_id)}
            className="event-detail__wishlist"
          >
            <WishlistIcon size={14} filled={isWishlisted} />
          </button>
        </section>

        <section className="flex flex-col px-4 py-8 sm:px-8 lg:min-h-[calc(100svh-92px)] lg:px-[min(8vw,112px)] lg:py-12">
          <div className="mx-auto w-full max-w-[540px]">
            <div className="text-center">
              <h1 className="break-words text-[20px] font-bold uppercase leading-6 sm:text-[23px] sm:leading-7">
                {event.name}
              </h1>
              <p className="mt-2 text-[12px] uppercase text-black/60">Organised by</p>
              <div className="mt-1 flex items-center justify-center gap-2 text-[13px] font-bold uppercase">
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black text-[10px]"
                >
                  {organisationInitial}
                </span>
                <span className="min-w-0 break-words">{organisationName}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2 border-t border-[#d8d8d8] pt-3 text-[12px] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p className="min-w-0">
                <strong>Date:</strong> {formatUtcDateTime(event.starts_at, event.timezone, "date") ?? "Date TBA"}
              </p>
              <p className="shrink-0">
                <strong>Time:</strong> {formatUtcDateTime(event.starts_at, event.timezone, "time") ?? "Time TBA"}
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
              <dl className="mt-2 space-y-1 break-words text-[11px] uppercase leading-[17px]">
                {event.category?.name ? (
                  <div>
                    <dt className="inline font-bold">Event type: </dt>
                    <dd className="inline">{event.category.name}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="inline font-bold">Event starts: </dt>
                  <dd className="inline">
                    {[
                      formatUtcDateTime(event.starts_at, event.timezone, "date"),
                      formatUtcDateTime(event.starts_at, event.timezone, "time"),
                    ]
                      .filter(Boolean)
                      .join(", ") || "Date TBA"}
                  </dd>
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

            <details className="group mt-6 border-y border-[#d8d8d8]">
              <summary className="flex h-[60px] cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase [&::-webkit-details-marker]:hidden">
                About the event
                <AccordionChevron />
              </summary>
              <p className="pb-10 pt-5 text-[13px] leading-5 text-black/70 whitespace-pre-wrap">
                {event.description?.trim() || "More details for this event will appear here."}
              </p>
            </details>
            <details className="group border-b border-[#d8d8d8]">
              <summary className="flex h-[60px] cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase [&::-webkit-details-marker]:hidden">
                Terms &amp; conditions
                <AccordionChevron />
              </summary>
              <p className="pb-10 pt-5 text-[13px] leading-5 text-black/70">
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
