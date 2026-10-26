import type { ReactNode } from "react";
import type { OrganisationEvent } from "@/apis/events/eventsApi";
import { StatusBadge } from "@/components/common";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { EventImage } from "../EventImage";

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-black/10 py-2.5 last:border-0">
      <dt className="text-[16px] font-bold uppercase text-[#AAAAAC]">{label}:</dt>
      <dd className="min-w-0 whitespace-pre-wrap break-words text-[16px] leading-[20px] text-black/100">
        {children ?? (value || "Not provided")}
      </dd>
    </div>
  );
}

function getBannerUrl(event: OrganisationEvent) {
  return event.images?.find((image) => image.type === "banner")?.url || event.images?.[0]?.url || "";
}

function getGalleryUrls(event: OrganisationEvent) {
  return (event.images ?? []).filter((image) => image.type === "gallery").map((image) => image.url).filter(Boolean) as string[];
}

export default function DetailsTab({
  event,
  hasTickets = false,
}: {
  event: OrganisationEvent;
  hasTickets?: boolean;
}) {
  const dateTime = event.starts_at
    ? `${formatDateTime(event.starts_at)}${event.ends_at ? ` - ${formatDateTime(event.ends_at)}` : ""}${
        event.timezone ? ` (${event.timezone})` : ""
      }`
    : "Date not set";

  const bannerUrl = getBannerUrl(event);
  const galleryUrls = getGalleryUrls(event);

  return (
    <div className="pt-4">
      {!hasTickets ? (
        <div className="mb-[36px] flex items-center rounded-[4px] border border-[#D9D9D9] bg-[#ECECEC] px-3 py-[9px] text-[14px] leading-[20px] text-black">
          <span className="mr-2 font-bold" aria-hidden="true">
            ⓘ
          </span>
          No tickets have been created for this event yet. Create tickets through Event Management to start
          selling tickets.
        </div>
      ) : null}
      <h3 className="font-heading mb-6 text-[26px] font-bold uppercase leading-none tracking-[-0.03em] text-black">
        Details
      </h3>

      <div className="grid gap-[32px] xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)]">
        <div>
          <EventImage large src={bannerUrl} alt={event.name} />
          {galleryUrls.length ? (
            <>
              <h4 className="mb-2 mt-4 text-[11px] font-bold uppercase text-black">Gallery images</h4>
              <div className="grid grid-cols-4 gap-2">
                {galleryUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden bg-[#dedede]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <dl>
          <DetailRow label="Event name" value={event.name} />
          <DetailRow label="Category" value={event.category?.name ?? ""} />
          <DetailRow label="Description" value={event.description ?? ""} />
          <DetailRow label="Venue" value={event.venue?.name ?? ""} />
          <DetailRow label="Capacity" value={event.capacity != null ? String(event.capacity) : ""} />
          <DetailRow label="Status">
            {event.status ? (
              <StatusBadge status={event.status} className="text-[16px] leading-[20px]" />
            ) : (
              "Not provided"
            )}
          </DetailRow>
          <DetailRow label="Date & time" value={dateTime} />
        </dl>
      </div>
    </div>
  );
}
