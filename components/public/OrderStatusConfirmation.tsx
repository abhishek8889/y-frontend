"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useGetPublicOrderStatusQuery, type PublicOrderStatus } from "@/apis/public/publicEventsApi";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  formatMoney,
  formatPublicEventLongDate,
  formatPublicEventTime,
  parseMoney,
} from "@/lib/events/publicEventFormat";

type OrderStatusConfirmationProps = {
  orderUniqueId: string;
};

type OrderStatusKind = "paid" | "pending" | "unconfirmed";

const pendingStatuses = new Set(["pending", "processing", "unpaid"]);

function orderStatusKind(status: string | null | undefined): OrderStatusKind {
  const value = status?.trim().toLowerCase() ?? "";
  if (value === "paid") return "paid";
  if (pendingStatuses.has(value)) return "pending";
  return "unconfirmed";
}

function itemLabel(item: NonNullable<PublicOrderStatus["items"]>[number]) {
  const ticket = item.ticket_name?.trim() || "Ticket";
  const offer = item.offer_name?.trim();
  return offer ? `${ticket} · ${offer}` : ticket;
}

function ticketPdfHref(path: string | null | undefined) {
  const value = path?.trim();
  if (!value) return null;
  if (value.startsWith("https://") || value.startsWith("http://")) return value;
  return null;
}

export function OrderStatusConfirmation({ orderUniqueId }: OrderStatusConfirmationProps) {
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [pollInterval, setPollInterval] = useState(0);
  const hasOrderId = orderUniqueId.trim().length > 0;

  const { data, isLoading, isFetching, isError, error } = useGetPublicOrderStatusQuery(
    orderUniqueId,
    {
      skip: !hasOrderId,
      pollingInterval: pollInterval,
    },
  );

  const kind = data ? orderStatusKind(data.status) : null;

  useEffect(() => {
    setPollInterval(kind === "pending" && !pollTimedOut ? 2500 : 0);
  }, [kind, pollTimedOut]);

  useEffect(() => {
    setPollTimedOut(false);
  }, [orderUniqueId]);

  useEffect(() => {
    if (kind !== "pending") return;
    const timer = window.setTimeout(() => setPollTimedOut(true), 30000);
    return () => window.clearTimeout(timer);
  }, [kind, orderUniqueId]);

  if (!hasOrderId) {
    return (
      <StatusMessage
        title="Order not found"
        message="This confirmation link does not include an order."
      />
    );
  }

  if (isLoading) {
    return <StatusMessage title="Loading order" message="Checking your booking…" />;
  }

  if (isError || !data) {
    return (
      <StatusMessage
        title="Unable to load order"
        message={getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError | undefined,
          "We could not load this booking. Please try again.",
        )}
      />
    );
  }

  const currency = data.currency?.trim() || "GBP";
  const event = data.event;
  const items = data.items ?? [];
  const pdfHref = ticketPdfHref(data.tickets_pdf_path);
  const itemTotal = items.reduce((sum, item) => sum + (parseMoney(item.total_price) ?? 0), 0);
  const total = parseMoney(data.total_amount) ?? itemTotal;
  const subtotal = parseMoney(data.subtotal);
  const discount = parseMoney(data.discount_amount);
  const platformFee = parseMoney(data.platform_fee_amount);
  const isPaid = kind === "paid";
  const isPending = kind === "pending";

  return (
    <section aria-labelledby="payment-success-title" className="w-full min-w-0 max-w-[760px]">
      <div className="flex flex-col items-center text-center">
        {isPaid ? <SuccessMark /> : null}
        <h1 id="payment-success-title" className="font-heading mt-3 break-words text-[18px] leading-6">
          {isPaid ? "Payment successful" : isPending ? "Confirming payment" : "Payment not confirmed"}
        </h1>
        <p className="mt-3 max-w-[36rem] text-[13px] font-normal leading-5">
          {isPaid
            ? "Your ticket has been successfully booked."
            : isPending
              ? "Stripe has finished in the browser. This page updates when the order is marked paid."
              : `This order is ${data.status || "not paid"}.`}
          {isFetching && isPending ? " Checking again…" : null}
        </p>
        {isPending && pollTimedOut ? (
          <p className="mt-2 text-[13px] font-normal leading-5 text-black/60">
            The order is still pending. Refresh this page in a moment.
          </p>
        ) : null}
        {event?.name ? (
          <h2 className="font-heading mt-5 break-words text-[16px] leading-5">{event.name}</h2>
        ) : null}
      </div>

      <section aria-labelledby="event-details-title" className="mt-5 border border-black/55 px-4 py-4 sm:px-7">
        <h3 id="event-details-title" className="font-heading text-[13px] leading-5">
          Event details
        </h3>
        <dl className="mt-2 grid gap-x-8 gap-y-2 text-[12px] font-normal leading-[18px] sm:grid-cols-2">
          <Detail label="Date" value={formatPublicEventLongDate(event?.starts_at, event?.timezone)} />
          <Detail label="Time" value={formatPublicEventTime(event?.starts_at, event?.timezone)} />
          <Detail label="Venue" value={event?.venue_name} />
          <Detail label="Location" value={event?.location} />
          <Detail label="Organised by" value={event?.organisation_name} />
          <Detail label="Order" value={data.unique_id} />
          {items.map((item, index) => (
            <Detail
              key={`${item.ticket_name ?? "ticket"}-${index}`}
              label="Ticket"
              value={`${item.quantity ?? 0} × ${itemLabel(item)}`}
            />
          ))}
        </dl>
      </section>

      <section aria-labelledby="price-summary-title" className="mt-3 border border-black/55 px-4 py-4 sm:px-7">
        <h3 id="price-summary-title" className="font-heading text-[13px] leading-5">
          Price summary
        </h3>
        <dl className="mt-2 space-y-1 text-[12px] font-normal leading-[18px]">
          {items.map((item, index) => (
            <PriceRow
              key={`${itemLabel(item)}-${index}`}
              label={`${item.quantity ?? 0} × ${itemLabel(item)}`}
              value={formatMoney(item.total_price, currency) ?? String(item.total_price ?? "")}
            />
          ))}
          {subtotal !== null ? <PriceRow label="Subtotal" value={formatMoney(subtotal, currency)} /> : null}
          {discount !== null && discount > 0 ? (
            <PriceRow label="Discount" value={formatMoney(discount, currency)} />
          ) : null}
          {platformFee !== null && platformFee > 0 ? (
            <PriceRow label="Platform fee" value={formatMoney(platformFee, currency)} />
          ) : null}
          <PriceRow label="Total amount" value={formatMoney(total, currency)} emphasis />
        </dl>
      </section>

      {data.customer_name || data.customer_email || data.customer_phone ? (
        <p className="mt-3 break-words text-[12px] font-normal leading-5 text-black/70">
          {[data.customer_name, data.customer_email, data.customer_phone].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {pdfHref ? (
        <a
          href={pdfHref}
          className="mx-auto mt-6 flex min-h-[44px] w-full max-w-[390px] items-center justify-center rounded-[3px] border border-black bg-white px-5 text-center text-[12px] font-normal uppercase text-black transition hover:bg-black hover:text-white"
        >
          Download tickets
        </a>
      ) : null}

      <Link
        href="/"
        className="mx-auto mt-3 flex min-h-[44px] w-full max-w-[390px] items-center justify-center rounded-[3px] bg-black px-5 text-center text-[12px] font-normal uppercase text-white transition hover:bg-black/80"
      >
        Explore more events
      </Link>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="min-w-0">
      <dt className="inline font-bold">{label}: </dt>
      <dd className="inline break-words [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function PriceRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value?: string | null;
  emphasis?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${emphasis ? "font-bold" : ""}`}>
      <dt className="min-w-0 break-words">{label}</dt>
      <dd className="shrink-0 text-right">{value}</dd>
    </div>
  );
}

function StatusMessage({ title, message }: { title: string; message: string }) {
  return (
    <section aria-labelledby="payment-success-title" className="w-full max-w-[760px] text-center">
      <h1 id="payment-success-title" className="font-heading text-[18px] leading-6">
        {title}
      </h1>
      <p role="alert" className="mt-3 text-[13px] font-normal leading-5">
        {message}
      </p>
      <Link
        href="/"
        className="mx-auto mt-6 flex min-h-[44px] w-full max-w-[390px] items-center justify-center rounded-[3px] bg-black px-5 text-center text-[12px] font-normal uppercase text-white"
      >
        Explore more events
      </Link>
    </section>
  );
}

function SuccessMark() {
  return (
    <svg aria-hidden="true" className="h-[64px] w-[64px]" viewBox="0 0 64 64" fill="none">
      <circle
        cx="29"
        cy="35"
        r="25"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="145 14"
        transform="rotate(-45 29 35)"
      />
      <path
        d="m19 32 8 8 26-27"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
