import Image from "next/image";
import eventCoverImage from "@/assets/event-cover.jpg";

type EventImageProps = {
  large?: boolean;
  src?: string | null;
  alt?: string;
};

export function EventImage({ large = false, src, alt = "Event cover" }: EventImageProps) {
  const className = `relative overflow-hidden bg-[#dedede] ${
    large ? "aspect-[1.55] w-full" : "aspect-[1.75] w-full"
  }`;

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
