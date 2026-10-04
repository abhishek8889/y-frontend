import type { PublishedEvent } from "@/lib/events/eventStorage";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { EventImage } from "../EventImage";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-black/10 py-2.5 last:border-0">
      <dt className="text-[16px] font-bold uppercase text-[#AAAAAC]">{label}:</dt>
      <dd className="min-w-0 whitespace-pre-wrap break-words text-[16px] leading-[20px] text-black/100">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function DetailsTab({ event }: { event: PublishedEvent }) {
  const dateTime = event.startDateTime
    ? `${formatDateTime(event.startDateTime)}${event.endDateTime ? ` - ${formatDateTime(event.endDateTime)}` : ""}${event.timezone !== "Not selected" ? ` (${event.timezone})` : ""}`
    : "Date not set";

  return (
    <div className="pt-4">
      <div className="mb-[36px] flex items-center rounded-[4px] border border-[#D9D9D9] bg-[#ECECEC] px-3 py-[9px] text-[14px] leading-[20px] text-black">
        <span className="mr-2 font-bold" aria-hidden="true">ⓘ</span>
        No tickets have been created for this event yet. Create tickets through Event Management to start selling tickets.
      </div>
      <h3 className="mb-6 text-[26px] font-black uppercase leading-none tracking-[-0.03em] text-black">Details</h3>

      <div className="grid gap-[32px] xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)]">
        <div>
          <EventImage large />
          <h4 className="mb-2 mt-4 text-[11px] font-bold uppercase text-black">Gallery images</h4>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-square bg-[#dedede]" role="img" aria-label="No gallery image uploaded" />
            ))}
          </div>
        </div>

        <dl>
          <DetailRow label="Event name" value={event.title} />
          <DetailRow label="Category" value={event.category} />
          <DetailRow label="Description" value={event.description} />
          <DetailRow label="Venue" value={event.venue} />
          <DetailRow label="Capacity" value={event.capacity} />
          <DetailRow label="Date & time" value={dateTime} />
        </dl>
      </div>
    </div>
  );
}