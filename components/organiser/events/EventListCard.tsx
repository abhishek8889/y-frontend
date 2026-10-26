"use client";

import type { OrganisationEvent } from "@/apis/events/eventsApi";
import { StatusBadge } from "@/components/common";
import { EventImage } from "@/app/(organiser)/events/EventImage";
import { formatDateTime } from "@/lib/events/formatDateTime";

export type EventListCardProps = {
  event: OrganisationEvent;
  selected: boolean;
  onSelect: () => void;
};

function getBannerUrl(event: OrganisationEvent) {
  return event.images?.find((image) => image.type === "banner")?.url || event.images?.[0]?.url || "";
}

export function getEventPlaceholderMetrics(event: OrganisationEvent) {
  const total = event.capacity ?? 200;
  const sold = Math.min(total, (event.id * 37) % (total + 1));
  const gross = sold * 25;
  return { total, sold, gross };
}

function formatGbp(amount: number) {
  return `£${amount.toLocaleString("en-GB")}`;
}

export function EventListCard({ event, selected, onSelect }: EventListCardProps) {
  const bannerUrl = getBannerUrl(event);
  const { total, sold, gross } = getEventPlaceholderMetrics(event);
  const soldPercent = total > 0 ? Math.round((sold / total) * 100) : 0;

  const dateTimeLabel = [
    formatDateTime(event.starts_at),
    event.ends_at ? formatDateTime(event.ends_at) : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full border p-3 text-left transition ${
        selected ? "border-black bg-black/[0.025]" : "border-transparent hover:border-black/35"
      }`}
    >
      <EventImage src={bannerUrl} alt={event.name} />
      <span className="mt-[10px] block text-[16px] font-bold uppercase leading-none text-black">
        {event.name}
      </span>
      <span className="my-[10px] flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] leading-[14px] text-[#666666]">
        <span>{event.category?.name || "Uncategorised"}</span>
        {event.status ? (
          <>
            <span aria-hidden="true">·</span>
            <StatusBadge status={event.status} className="text-[14px] leading-[14px]" />
          </>
        ) : null}
      </span>
      <span className="block text-[14px] leading-none text-black">{dateTimeLabel}</span>
      {event.venue?.name ? (
        <span className="mt-2 block text-[14px] leading-[18px] text-[#6F6E69]">{event.venue.name}</span>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/15 pt-3">
        <div className="min-w-0">
          <p className="font-heading text-[11px] font-bold uppercase leading-[14px] text-[#AAAAAC]">
            Tickets Sold
          </p>
          <p className="mt-1 text-[14px] font-bold uppercase leading-none text-black">
            {sold}/{total}
          </p>
          <div
            className="mt-2 h-[4px] w-full bg-black/10"
            role="progressbar"
            aria-valuenow={soldPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${sold} of ${total} tickets sold`}
          >
            <div
              className="h-full bg-[#16B957] transition-[width]"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-heading text-[11px] font-bold uppercase leading-[14px] text-[#AAAAAC]">
            Gross Sales
          </p>
          <p className="mt-1 text-[14px] font-bold uppercase leading-none text-black">
            {formatGbp(gross)}
          </p>
        </div>
      </div>
    </button>
  );
}
