"use client";

import Image from "next/image";
import type { EventImage } from "@/apis/events/eventsApi";
import { MediaPlayer } from "@/components/common";
import eventCoverImage from "@/assets/event-cover.jpg";

type EventBannerMediaProps = {
  banner: EventImage | null | undefined;
  alt: string;
  /** When true and banner is video, autoplay (muted). */
  active?: boolean;
  /** Video play / mute overlay. */
  controls?: boolean;
  /** Seek/progress bar. Hidden on event list cards. */
  showProgress?: boolean;
  large?: boolean;
  className?: string;
};

/**
 * Event list/detail banner wrapper around shared `MediaPlayer`.
 */
export function EventBannerMedia({
  banner,
  alt,
  active = false,
  controls = true,
  showProgress = true,
  large = false,
  className = "",
}: EventBannerMediaProps) {
  return (
    <MediaPlayer
      media={banner}
      alt={alt}
      active={active}
      controls={controls}
      showProgress={showProgress}
      className={className}
      frameClassName={large ? "aspect-[1.55] w-full" : "aspect-[1.75] w-full"}
      placeholder={<Image src={eventCoverImage} alt={alt} fill className="object-cover" />}
    />
  );
}

export function getEventBanner(images: EventImage[] | null | undefined) {
  return images?.find((image) => image.type === "banner") ?? images?.[0] ?? null;
}
