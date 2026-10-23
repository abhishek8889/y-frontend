"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useGetMyOrdersQuery, type MyOrderEvent, type MyOrderItem } from "@/apis/public/ordersApi";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getAuthToken } from "@/lib/api/token";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/constants";
import { formatPublicEventLongDate, formatPublicEventTime } from "@/lib/events/publicEventFormat";

function subscribeAuth(onStoreChange: () => void) {
  window.addEventListener("focus", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

function getHasAuthToken() {
  return Boolean(getAuthToken());
}

function venueLabel(event: MyOrderEvent | null | undefined) {
  const venue = event?.venue;
  if (!venue) return null;
  const address = venue.address;
  const place = [
    address?.address_line_1,
    address?.city,
    address?.state,
    address?.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  return [venue.name?.trim(), place].filter(Boolean).join(" · ") || null;
}

function itemTitle(item: MyOrderItem) {
  const ticket = item.ticket_name?.trim() || "Ticket";
  const offer = item.offer_name?.trim();
  return offer ? `${ticket} · ${offer}` : ticket;
}

export function MyOrdersList() {
  const router = useRouter();
  const hasToken = useSyncExternalStore(subscribeAuth, getHasAuthToken, () => false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, isError, error } = useGetMyOrdersQuery(
    { per_page: 15, cursor },
    { skip: !hasToken },
  );

  useEffect(() => {
    if (!hasToken) {
      router.replace(`/login?next=${encodeURIComponent("/orders")}`);
    }
  }, [hasToken, router]);

  const orders = data?.data.items ?? [];
  const nextCursor = data?.data.pagination.next_cursor;
  const hasMore = Boolean(data?.data.pagination.has_more && nextCursor);

  return (
    <section className="mx-auto w-full max-w-[760px] px-5 py-12 md:px-8">
      <h1 className="font-heading text-[24px] leading-[32px]">My orders</h1>
      <p className="mt-3 text-[14px] font-normal leading-[22px] text-black/70">
        Your bookings, ticket lines, and issued tickets.
      </p>

      {!hasToken || (isLoading && orders.length === 0) ? (
        <p role="status" className="mt-8 text-[14px] font-normal text-black/60">
          {hasToken ? "Loading orders…" : "Redirecting to login…"}
        </p>
      ) : isError && orders.length === 0 ? (
        <p role="alert" className="mt-8 text-[14px] font-normal text-[#b42318]">
          {getApiErrorMessage(
            error as FetchBaseQueryError | SerializedError | undefined,
            "Unable to load your orders.",
          )}
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-8">
          <p className="text-[14px] font-normal text-black/70">You have no orders yet.</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-[40px] items-center justify-center bg-black px-5 text-[12px] font-normal uppercase text-white"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.unique_id} className="border border-black/25 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.06em] text-black/50">Order</p>
                  <p className="mt-1 text-[14px] font-normal">{order.unique_id}</p>
                  <p className="mt-1 text-[12px] font-normal text-black/55">
                    {formatPublicEventLongDate(order.paid_at ?? order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} className="text-[12px]" />
                  <p className="mt-2 text-[16px] font-bold">
                    {order.formatted_total || order.total_amount}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-4 border-t border-black/15 pt-4">
                {(order.items ?? []).map((item) => (
                  <li key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[14px] font-normal">{itemTitle(item)}</p>
                        <p className="mt-0.5 text-[12px] text-black/55">
                          Qty {item.quantity ?? 0}
                          {item.formatted_unit_price ? ` · ${item.formatted_unit_price} each` : ""}
                        </p>
                        {item.event?.name ? (
                          <p className="mt-2 text-[13px] font-normal">
                            {item.event.unique_id ? (
                              <Link href={`/event/${item.event.unique_id}`} className="underline">
                                {item.event.name}
                              </Link>
                            ) : (
                              item.event.name
                            )}
                          </p>
                        ) : null}
                        <p className="text-[12px] font-normal text-black/60">
                          {formatPublicEventLongDate(item.event?.starts_at, item.event?.timezone)}
                          {" · "}
                          {formatPublicEventTime(item.event?.starts_at, item.event?.timezone)}
                        </p>
                        {venueLabel(item.event) ? (
                          <p className="text-[12px] font-normal text-black/60">{venueLabel(item.event)}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-[13px] font-normal">
                        {item.formatted_total_price || item.total_price}
                      </p>
                    </div>

                    {(item.issued_tickets ?? []).length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {(item.issued_tickets ?? []).map((ticket) => (
                          <li
                            key={ticket.unique_id || ticket.code}
                            className="flex flex-wrap items-center justify-between gap-2 bg-black/[0.03] px-3 py-2"
                          >
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.06em] text-black/45">Ticket</p>
                              <p className="text-[13px] font-normal">{ticket.code || ticket.unique_id}</p>
                            </div>
                            <StatusBadge status={ticket.status} className="text-[11px]" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {hasMore ? (
        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            if (nextCursor) setCursor(nextCursor);
          }}
          className="mt-6 h-[40px] border border-black px-5 text-[12px] font-normal uppercase disabled:opacity-50"
        >
          {isFetching ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </section>
  );
}
