"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import {
  useGetMyOrdersQuery,
  type MyOrder,
  type MyOrderEvent,
  type MyOrderItem,
} from "@/apis/public/ordersApi";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatPublicEventLongDate } from "@/lib/events/publicEventFormat";
import type { OrderTicketPdfTicket } from "@/lib/public/orderTicketPdf";
import { useHasAuthToken } from "@/lib/public/useHasAuthToken";
import { appToast } from "@/lib/ui/toast";

type OrderRow = {
  key: string;
  order: MyOrder;
  event: MyOrderEvent | null;
  items: MyOrderItem[];
};

function bannerUrl(event: MyOrderEvent | null | undefined) {
  const direct = event?.banner?.url?.trim();
  if (direct) return direct;
  const images = event?.images ?? [];
  const banner = images.find((image) => image.type === "banner") ?? images[0];
  return banner?.url?.trim() || null;
}

function eventTypeLabel(event: MyOrderEvent | null | undefined) {
  return event?.category?.name?.trim() || event?.event_type?.trim() || event?.type?.trim() || null;
}

function organisationName(event: MyOrderEvent | null | undefined) {
  return event?.organisation?.name?.trim() || event?.organisation_name?.trim() || null;
}

function locationLabel(event: MyOrderEvent | null | undefined) {
  const address = event?.venue?.address;
  return address?.city?.trim() || address?.state?.trim() || address?.country?.trim() || null;
}

function addressLabel(event: MyOrderEvent | null | undefined) {
  const address = event?.venue?.address;
  if (!address) return null;
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function timeZoneAbbrev(date: Date, timeZone?: string) {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  };
  const primary = new Intl.DateTimeFormat("en-US", options)
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  if (primary && !primary.startsWith("GMT")) return primary;

  const fallback = new Intl.DateTimeFormat("en-IN", options)
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  if (fallback && !fallback.startsWith("GMT")) return fallback;
  return primary || fallback || "";
}

function formatClock(value: string | null | undefined, timezone?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const zone = timezone?.trim() || undefined;

  try {
    const clock = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
    const abbrev = timeZoneAbbrev(date, zone);
    return abbrev ? `${clock} ${abbrev}` : clock;
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
}

function formatWhen(value: string | null | undefined, timezone?: string | null) {
  if (!value) return null;
  const date = formatPublicEventLongDate(value, timezone);
  const time = formatClock(value, timezone);
  if (!time || date === "Date TBA") return date === "Date TBA" ? null : date;
  return `${date} at ${time}`;
}

function formatOrderStamp(value: string | null | undefined) {
  if (!value) return { date: "Date TBA", time: "" };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: value, time: "" };

  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(parsed)
    .replace(/,/g, "");
  const time = formatClock(value) ?? "";
  return { date: `${date},`, time };
}

function orderRows(orders: MyOrder[]): OrderRow[] {
  const rows: OrderRow[] = [];

  for (const order of orders) {
    const items = order.items ?? [];
    if (items.length === 0) {
      rows.push({ key: order.unique_id, order, event: null, items: [] });
      continue;
    }

    const groups = new Map<string, MyOrderItem[]>();
    for (const item of items) {
      const eventKey = item.event?.unique_id || item.event?.name || `item-${item.id}`;
      const group = groups.get(eventKey) ?? [];
      group.push(item);
      groups.set(eventKey, group);
    }

    for (const [eventKey, group] of groups) {
      rows.push({
        key: `${order.unique_id}-${eventKey}`,
        order,
        event: group[0]?.event ?? null,
        items: group,
      });
    }
  }

  return rows;
}

function ticketsForPdf(row: OrderRow): OrderTicketPdfTicket[] {
  const tickets: OrderTicketPdfTicket[] = [];

  for (const item of row.items) {
    for (const issued of item.issued_tickets ?? []) {
      const event = item.event ?? row.event;
      tickets.push({
        eventName: event?.name?.trim() || "Event",
        startsLabel: formatWhen(event?.starts_at, event?.timezone),
        endsLabel: formatWhen(event?.ends_at, event?.timezone),
        venueName: event?.venue?.name?.trim() || null,
        address: addressLabel(event),
        ticketName: issued.ticket_name?.trim() || item.ticket_name?.trim() || null,
        offerName: issued.offer_name?.trim() || item.offer_name?.trim() || null,
        ticketId: issued.unique_id?.trim() || null,
        code: issued.code?.trim() || null,
        organisationName: organisationName(event),
        bannerUrl: bannerUrl(event),
      });
    }
  }

  return tickets;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="break-words text-[13px] leading-5">
      <span className="font-body-bold">{label}: </span>
      {value}
    </p>
  );
}

export function MyOrdersList() {
  const router = useRouter();
  const hasToken = useHasAuthToken();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const { data, isLoading, isFetching, isError, error } = useGetMyOrdersQuery(
    { per_page: 15, cursor },
    { skip: !hasToken },
  );

  useEffect(() => {
    if (!hasToken) {
      router.replace(`/login?next=${encodeURIComponent("/orders")}`);
    }
  }, [hasToken, router]);

  const rows = orderRows(data?.data.items ?? []);
  const nextCursor = data?.data.pagination.next_cursor;
  const hasMore = Boolean(data?.data.pagination.has_more && nextCursor);

  async function downloadTickets(row: OrderRow) {
    const tickets = ticketsForPdf(row);
    if (tickets.length === 0 || downloadingKey) return;

    setDownloadingKey(row.key);
    try {
      const { createOrderTicketsPdf, savePdfBlob } = await import("@/lib/public/orderTicketPdf");
      const blob = await createOrderTicketsPdf({
        orderId: row.order.unique_id,
        customerName: row.order.customer_name ?? null,
        customerEmail: row.order.customer_email ?? null,
        tickets,
      });
      savePdfBlob(blob, `${row.order.unique_id}-tickets.pdf`);
    } catch {
      appToast.error("Unable to create the ticket PDF. Please try again.");
    } finally {
      setDownloadingKey(null);
    }
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-heading text-center text-[18px] leading-6">My orders</h1>

      {!hasToken || (isLoading && rows.length === 0) ? (
        <p role="status" className="mt-8 text-center text-[14px] font-normal text-black/60">
          {hasToken ? "Loading orders…" : "Redirecting to login…"}
        </p>
      ) : isError && rows.length === 0 ? (
        <p role="alert" className="mt-8 text-center text-[14px] font-normal text-[#b42318]">
          {getApiErrorMessage(
            error as FetchBaseQueryError | SerializedError | undefined,
            "Unable to load your orders.",
          )}
        </p>
      ) : rows.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-[14px] font-normal text-black/70">You have no orders yet.</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-10 items-center justify-center bg-black px-5 text-[12px] font-normal uppercase text-white"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <div className="mt-6 border border-black">
          <div className="hidden grid-cols-[minmax(0,1fr)_168px] border-b border-black px-4 py-2.5 text-[14px] leading-5 sm:grid">
            <span>Event</span>
            <span>Order Date &amp; Time</span>
          </div>
          <ul>
            {rows.map((row) => {
              const eventName = row.event?.name?.trim() || "Event";
              const imageUrl = bannerUrl(row.event);
              const imageAlt = row.event?.banner?.alt_text?.trim() || eventName;
              const stamp = formatOrderStamp(row.order.paid_at ?? row.order.created_at);
              const eventType = eventTypeLabel(row.event);
              const venue = row.event?.venue?.name?.trim() || null;
              const location = locationLabel(row.event);
              const date = formatPublicEventLongDate(row.event?.starts_at, row.event?.timezone);
              const time = formatClock(row.event?.starts_at, row.event?.timezone);
              const tickets = ticketsForPdf(row);
              const isDownloading = downloadingKey === row.key;

              return (
                <li
                  key={row.key}
                  className="grid grid-cols-1 gap-3 border-b border-black px-3 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_168px] sm:items-start sm:gap-4 sm:px-4"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="aspect-[2/1] w-full overflow-hidden bg-black/5 sm:aspect-auto sm:h-[96px] sm:w-[148px] sm:shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-heading break-words text-[16px] leading-5">{eventName}</h2>
                      <div className="mt-1">
                        <DetailLine label="Date" value={date} />
                        {time ? <DetailLine label="Time" value={time} /> : null}
                        {eventType ? <DetailLine label="Event type" value={eventType} /> : null}
                        {venue ? <DetailLine label="Venue" value={venue} /> : null}
                        {location ? <DetailLine label="Location" value={location} /> : null}
                      </div>
                      <button
                        type="button"
                        disabled={tickets.length === 0 || downloadingKey !== null}
                        onClick={() => void downloadTickets(row)}
                        className="mt-3 inline-flex h-9 w-full items-center justify-center border border-black bg-white px-3 text-[10px] uppercase tracking-[0.04em] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {isDownloading ? "Preparing…" : "Download ticket"}
                      </button>
                    </div>
                  </div>
                  <p className="break-words text-[13px] leading-5 sm:pt-0.5">
                    <span className="font-body-bold sm:hidden">Order date &amp; time: </span>
                    {stamp.date}
                    {stamp.time ? (
                      <>
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>
                        {stamp.time}
                      </>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            if (nextCursor) setCursor(nextCursor);
          }}
          className="mt-6 h-10 border border-black px-5 text-[12px] font-normal uppercase disabled:opacity-50"
        >
          {isFetching ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </section>
  );
}
