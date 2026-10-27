"use client";

import type { OrganisationEvent } from "@/apis/events/eventsApi";
import { StatusBadge } from "@/components/common";
import { EventBannerMedia, getEventBanner } from "@/components/organiser/events/EventBannerMedia";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { normalizeStatusKey } from "@/lib/ui/statusColors";

export type EventListCardProps = {
  event: OrganisationEvent;
  selected: boolean;
  onSelect: () => void;
};

export function getEventPlaceholderMetrics(event: OrganisationEvent) {
  const total = event.capacity ?? 200;
  const sold = Math.min(total, (event.id * 37) % (total + 1));
  const gross = sold * 25;
  return { total, sold, gross };
}

function formatGbp(amount: number) {
  return `£${amount.toLocaleString("en-GB")}`;
}

function eventCardStatusLabel(status: string | null | undefined) {
  const key = normalizeStatusKey(status);
  if (key === "active") return "On sale";
  if (key === "draft") return "Draft";
  if (key === "inactive") return "Completed";
  return "Cancelled";
}

function progressTone(percent: number) {
  if (percent >= 70) return "event-progress-fill";
  return "event-progress-fill event-progress-fill-amber";
}

export function EventListCard({ event, selected, onSelect }: EventListCardProps) {
  const banner = getEventBanner(event.images);
  const { total, sold, gross } = getEventPlaceholderMetrics(event);
  const soldPercent = total > 0 ? Math.round((sold / total) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(eventKey) => {
        if (eventKey.key === "Enter" || eventKey.key === " ") {
          eventKey.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      className={`event-list-card ${selected ? "event-list-card-selected" : ""}`.trim()}
    >
      <div className="event-list-card-media">
        <EventBannerMedia banner={banner} alt={event.name} active={selected} showProgress={false} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <p className="event-list-card-title min-w-0 flex-1">{event.name}</p>
        {event.status ? (
          <StatusBadge
            status={event.status}
            label={eventCardStatusLabel(event.status)}
            className="event-list-card-status-inline shrink-0"
          />
        ) : null}
      </div>

      <p className="event-list-card-meta">{event.category?.name || "Uncategorised"}</p>
      <p className="event-list-card-datetime">{formatDateTime(event.starts_at)}</p>

      <div className="event-list-card-metrics">
        <div className="min-w-0">
          <p className="event-list-card-metric-label">Tickets sold</p>
          <p className="event-list-card-metric-value">
            {sold} / {total}
          </p>
          <div
            className="event-progress mt-1"
            role="progressbar"
            aria-valuenow={soldPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${sold} of ${total} tickets sold`}
          >
            <div className="event-progress-track">
              <div
                className={progressTone(soldPercent)}
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <span
              className="event-progress-label"
              style={{ color: soldPercent >= 70 ? "#00bc75" : "#ff9d14" }}
            >
              {soldPercent}%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="event-list-card-metric-label">Gross sales</p>
          <p className="event-list-card-metric-value">{formatGbp(gross)}</p>
        </div>
      </div>
    </div>
  );
}
