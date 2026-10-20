"use client";

import Image from "next/image";
import Link from "next/link";
import eventCover from "@/assets/event-cover.jpg";
import type { PublicEventListItem } from "@/apis/public/publicEventsApi";
import { toEventCardModel } from "@/lib/events/publicEventFormat";

type EventCardProps = {
  event: PublicEventListItem;
  isWishlisted?: boolean;
  wishlistDisabled?: boolean;
  onToggleWishlist?: (eventId: number) => void;
};

export function EventCard({
  event,
  isWishlisted = false,
  wishlistDisabled = false,
  onToggleWishlist,
}: EventCardProps) {
  const model = toEventCardModel(event);
  const href = `/event/${encodeURIComponent(model.uniqueId)}`;
  const imageSrc = model.imageUrl || eventCover;

  return (
    <article className="min-w-0 bg-white">
      <div className="relative aspect-[0.88/1] overflow-hidden bg-black">
        <Link href={href} aria-label={`View ${model.name}`} className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={model.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            unoptimized={typeof imageSrc === "string"}
          />
        </Link>
        {onToggleWishlist ? (
          <button
            type="button"
            aria-label={isWishlisted ? "Remove event from wishlist" : "Add event to wishlist"}
            aria-pressed={isWishlisted}
            disabled={wishlistDisabled}
            onClick={(clickEvent) => {
              clickEvent.preventDefault();
              clickEvent.stopPropagation();
              onToggleWishlist(event.id);
            }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="18"
              height="18"
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
        ) : null}
      </div>
      <Link
        href={href}
        className="flex min-h-[90px] flex-col items-center justify-center px-3 py-4 text-center hover:bg-black/[0.025]"
      >
        <h2 className="text-[12px] font-bold uppercase leading-[16px] text-black">{model.name}</h2>
        <p className="mt-1 text-[12px] leading-[16px] text-black/75">{model.dateLabel}</p>
        <p className="mt-0.5 text-[11px] font-bold leading-[15px] text-black">{model.venueName}</p>
      </Link>
    </article>
  );
}
