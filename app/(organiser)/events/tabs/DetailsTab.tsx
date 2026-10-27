"use client";

import { useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { OrganisationEvent } from "@/apis/events/eventsApi";
import { MediaPlayer, StatusBadge, type GalleryMediaItem } from "@/components/common";
import { getEventBanner } from "@/components/organiser/events/EventBannerMedia";
import { isVideoMedia } from "@/lib/media/isVideoMedia";
import { formatDateTime } from "@/lib/events/formatDateTime";

const MediaGalleryLightbox = dynamic(
  () =>
    import("@/components/common/MediaGalleryLightbox").then((mod) => mod.MediaGalleryLightbox),
  { ssr: false },
);

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
    <div className="event-detail-row">
      <dt className="event-detail-label">{label}</dt>
      <dd className="event-detail-value">{children ?? (value || "Not provided")}</dd>
    </div>
  );
}

function getGalleryItems(event: OrganisationEvent) {
  return (event.images ?? []).filter((image) => image.type === "gallery" && image.url);
}

export default function DetailsTab({
  event,
  hasTickets = false,
}: {
  event: OrganisationEvent;
  hasTickets?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const dateTime = event.starts_at
    ? `${formatDateTime(event.starts_at)}${event.ends_at ? ` - ${formatDateTime(event.ends_at)}` : ""}${
        event.timezone ? ` (${event.timezone})` : ""
      }`
    : "Date not set";

  const banner = getEventBanner(event.images);
  const galleryItems = getGalleryItems(event);

  const lightboxItems = useMemo<GalleryMediaItem[]>(() => {
    const items: GalleryMediaItem[] = [];
    if (banner?.url) {
      items.push({
        ...banner,
        alt: event.name,
      });
    }
    for (const item of galleryItems) {
      items.push({
        ...item,
        alt: event.name,
      });
    }
    return items;
  }, [banner, galleryItems, event.name]);

  function openGalleryAt(galleryIndex: number) {
    const offset = banner?.url ? 1 : 0;
    setLightboxIndex(offset + galleryIndex);
    setLightboxOpen(true);
  }

  return (
    <section className="pt-5" aria-label={`${event.name} details`}>
      {!hasTickets ? (
        <div className="mb-4 flex items-center rounded-[4px] border border-black/20 bg-[#f5f5f5] px-3 py-2.5 text-[12px] leading-5 text-black">
          <span className="mr-2 font-bold" aria-hidden="true">
            ⓘ
          </span>
          No tickets have been created for this event yet. Create tickets through Products to start
          selling tickets.
        </div>
      ) : null}

      <div className="event-panel-header">
        <div>
          <h3 className="event-panel-title">Details</h3>
          <p className="event-panel-subtitle">Event information, media, and schedule.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)]">
        <div>
          <MediaPlayer
            media={banner}
            alt={event.name}
            active
            frameClassName="aspect-[1.55] w-full"
          />
          {galleryItems.length ? (
            <>
              <h4 className="event-panel-section-title mt-4">Gallery media</h4>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {galleryItems.map((item, index) => (
                  <button
                    key={`${item.path}-${index}`}
                    type="button"
                    onClick={() => openGalleryAt(index)}
                    aria-label={`Open gallery media ${index + 1}`}
                    className="relative aspect-square cursor-pointer overflow-hidden bg-[#dedede] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    {isVideoMedia(item) ? (
                      <video
                        src={item.url || ""}
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url || ""}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </button>
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
              <StatusBadge status={event.status} className="datatable-status" />
            ) : (
              "Not provided"
            )}
          </DetailRow>
          <DetailRow label="Date & time" value={dateTime} />
        </dl>
      </div>

      {lightboxOpen ? (
        <MediaGalleryLightbox
          open={lightboxOpen}
          index={lightboxIndex}
          items={lightboxItems}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </section>
  );
}
