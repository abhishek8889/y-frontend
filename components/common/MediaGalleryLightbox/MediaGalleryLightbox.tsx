"use client";

import { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { MediaPlayer } from "@/components/common/MediaPlayer";
import { isVideoMedia } from "@/lib/media/isVideoMedia";
import type { GalleryMediaItem, MediaGalleryLightboxProps } from "./types";

type SlideImage = {
  type: "image";
  src: string;
  alt?: string;
};

type SlideMediaVideo = {
  type: "media-video";
  media: GalleryMediaItem;
  alt?: string;
};

type GallerySlide = SlideImage | SlideMediaVideo;

declare module "yet-another-react-lightbox" {
  interface SlideTypes {
    "media-video": SlideMediaVideo;
  }
}

function toSlides(items: GalleryMediaItem[]): GallerySlide[] {
  const slides: GallerySlide[] = [];

  for (const item of items) {
    const src = item.url?.trim();
    if (!src) continue;

    if (isVideoMedia(item)) {
      slides.push({
        type: "media-video",
        media: item,
        alt: item.alt?.trim() || undefined,
      });
      continue;
    }

    slides.push({
      type: "image",
      src,
      alt: item.alt?.trim() || undefined,
    });
  }

  return slides;
}

/**
 * Shared lightbox gallery for organiser / admin / public.
 * Images use built-in slides; videos render the shared `MediaPlayer`.
 * Import this via `next/dynamic` so the lightbox only loads when opened.
 */
export function MediaGalleryLightbox({
  open,
  index,
  items,
  onClose,
}: MediaGalleryLightboxProps) {
  const slides = useMemo(() => toSlides(items), [items]);
  const safeIndex = slides.length ? Math.min(Math.max(index, 0), slides.length - 1) : 0;

  if (!slides.length) return null;

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={safeIndex}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
      carousel={{ finite: slides.length <= 1, padding: "16px" }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.92)" },
      }}
      render={{
        slide: ({ slide, offset }) => {
          if (slide.type !== "media-video") return undefined;

          const isActive = offset === 0;
          return (
            <div className="flex h-full w-full items-center justify-center px-3 py-10">
              <div className="w-full max-w-[min(960px,92vw)]">
                <MediaPlayer
                  media={slide.media}
                  alt={slide.alt || "Video"}
                  active={isActive}
                  frameClassName="aspect-video w-full"
                />
              </div>
            </div>
          );
        },
      }}
    />
  );
}
