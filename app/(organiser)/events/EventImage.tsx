import Image from "next/image";
import eventCoverImage from "@/assets/event-cover.jpg";
import { isVenueVideoMedia } from "@/components/organiser/venues/venueFormHelpers";

type EventImageProps = {
  large?: boolean;
  src?: string | null;
  alt?: string;
  /** When set, video banners render a static first frame (no player controls). */
  mediaType?: string | null;
  mime?: string | null;
  path?: string | null;
};

/**
 * Static event media thumbnail (image, or paused video frame). No player UI.
 */
export function EventImage({
  large = false,
  src,
  alt = "Event cover",
  mediaType,
  mime,
  path,
}: EventImageProps) {
  const className = `relative overflow-hidden bg-[#dedede] ${
    large ? "aspect-[1.55] w-full" : "aspect-[1.75] w-full"
  }`;

  const isVideo =
    Boolean(src) &&
    isVenueVideoMedia({ url: src, path, mime, media_type: mediaType });

  if (src && isVideo) {
    return (
      <div className={className} role="img" aria-label={alt}>
        <video
          src={src}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
      </div>
    );
  }

  if (src) {
    return (
      <div className={className} role="img" aria-label={alt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label={alt}>
      <Image src={eventCoverImage} alt={alt} fill className="object-cover" />
    </div>
  );
}
