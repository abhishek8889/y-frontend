import Image from "next/image";
import eventCoverImage from "@/assets/event-cover.jpg";

export function EventImage({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#dedede] ${large ? "aspect-[1.55] w-full" : "aspect-[1.75] w-full"}`}
      role="img"
      aria-label="Event cover image"
    >
      <Image src={eventCoverImage} alt="Event cover" fill className="object-cover" />
    </div>
  );
}