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
  /** Wide featured tile (spans 2 columns on desktop home grid). */
  featured?: boolean;
  isWishlisted?: boolean;
  wishlistDisabled?: boolean;
  onToggleWishlist?: (eventId: number) => void;
};

export function EventCard({
  event,
  featured = false,
  isWishlisted = false,
  wishlistDisabled = false,
  onToggleWishlist,
}: EventCardProps) {
  const model = toEventCardModel(event);
  const href = `/event/${encodeURIComponent(model.uniqueId)}`;
  const imageSrc = model.imageUrl || eventCover;
  const mediaType = model.banner?.media_type?.trim().toLowerCase();
  const bannerIsVideo =
    mediaType !== "image" && Boolean(model.banner?.url) && isVideoMedia(model.banner);

  return (
    <article
      className={`event-card${featured ? " event-card--featured" : ""}`}
    >
      <div className="event-card__media">
        {bannerIsVideo ? (
          <MediaPlayer
            media={model.banner}
            alt={model.name}
            active
            showProgress={false}
            frameClassName="event-card__player"
            controlsClassName="event-media-controls"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={model.name}
            fill
            sizes={
              featured
                ? "(max-width: 639px) 90vw, 50vw"
                : "(max-width: 639px) 78vw, (max-width: 1279px) 50vw, 25vw"
            }
            className="event-card__image"
            unoptimized={typeof imageSrc === "string"}
          />
        )}

        {onToggleWishlist ? (
          <button
            type="button"
            aria-label={
              isWishlisted ? "Remove event from wishlist" : "Add event to wishlist"
            }
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

        {/* Hover overlay: full-bleed copy + CTA (Figma Component 48 / 72) */}
        <div className="event-card__hover" aria-hidden>
          <p className="event-card__title event-card__title--hover">{model.name}</p>
          <p className="event-card__date event-card__date--hover">{model.dateLabel}</p>
          <p className="event-card__venue event-card__venue--hover">{model.venueName}</p>
          <span className="event-card__view">View Event</span>
        </div>

        <Link
          href={href}
          aria-label={`View ${model.name}`}
          className="event-card__media-hit"
        />
      </div>

      <Link href={href} className="event-card__body">
        <h2 className="event-card__title">{model.name}</h2>
        <p className="event-card__date">{model.dateLabel}</p>
        <p className="event-card__venue">{model.venueName}</p>
      </Link>
    </article>
  );
}
