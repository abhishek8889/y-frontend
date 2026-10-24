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
    <article className="min-w-0 border-r border-b border-black bg-white">
      <div className="relative aspect-[360/417] overflow-hidden bg-black">
        <Link href={href} aria-label={`View ${model.name}`} className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={model.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 25vw"
            className="object-cover"
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
            className="absolute top-[14px] right-[15px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
        ) : null}
        <img
          src="/landing/card-action.svg"
          width={27}
          height={27}
          alt=""
          className="pointer-events-none absolute right-4 bottom-[18px]"
        />
      </div>
      <Link href={href} className="flex flex-col items-center gap-2 px-3 pt-2 pb-6 text-center">
        <h2 className="text-[16px] leading-[13.8px] text-black">{model.name}</h2>
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-[14px] leading-[19.6px] text-black">{model.dateLabel}</span>
          <span className="font-body-bold text-[14px] leading-[19.6px] text-black">{model.venueName}</span>
        </span>
      </Link>
    </article>
  );
}
