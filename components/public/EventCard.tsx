"use client";

import Image from "next/image";
import Link from "next/link";
import eventCover from "@/assets/event-cover.jpg";
import type { PublicEventListItem } from "@/apis/public/publicEventsApi";
import { MediaPlayer } from "@/components/common";
import { WishlistIcon } from "@/components/public/WishlistIcon";
import { isVideoMedia } from "@/lib/media/isVideoMedia";
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
  const mediaType = model.banner?.media_type?.trim().toLowerCase();
  // Image banners never get player controls; only explicit/detected video does.
  const bannerIsVideo =
    mediaType !== "image" && Boolean(model.banner?.url) && isVideoMedia(model.banner);

  return (
    <article className="event-card">
      <div className="event-card__media">
        {bannerIsVideo ? (
          <>
            <MediaPlayer
              media={model.banner}
              alt={model.name}
              active
              frameClassName="event-card__player"
            />
            {/* Navigate on media click, but leave bottom control bar free */}
            <Link
              href={href}
              aria-label={`View ${model.name}`}
              className="event-card__media-hit"
            />
          </>
        ) : (
          <Link href={href} aria-label={`View ${model.name}`} className="event-card__image-link">
            <Image
              src={imageSrc}
              alt={model.name}
              fill
              sizes="(max-width: 639px) 78vw, (max-width: 1279px) 50vw, 25vw"
              className="event-card__image"
              unoptimized={typeof imageSrc === "string"}
            />
          </Link>
        )}
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
            className="event-card__wishlist"
          >
            <WishlistIcon size={14} filled={isWishlisted} />
          </button>
        ) : null}
      </div>
      <Link href={href} className="event-card__body">
        <h2 className="event-card__title">{model.name}</h2>
        <span className="event-card__meta">
          <span className="event-card__date">{model.dateLabel}</span>
          <span className="event-card__venue font-body-bold">{model.venueName}</span>
        </span>
      </Link>
    </article>
  );
}
