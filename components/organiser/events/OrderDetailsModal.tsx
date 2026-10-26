"use client";

import type { ReactNode } from "react";
import {
  formatPaymentProvider,
  formatSalesChannel,
  type EventOrderDetails,
} from "@/apis/organisation/eventOrdersApi";
import { StatusBadge } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";

type OrderDetailsModalProps = {
  open: boolean;
  order: EventOrderDetails | null;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
};

function formatOrderDate(value: string | null | undefined) {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-b border-black/10 py-2.5 last:border-0">
      <dt className="font-heading text-[12px] font-bold uppercase text-[#AAAAAC]">{label}</dt>
      <dd className="min-w-0 text-[14px] leading-[20px] text-black">{value}</dd>
    </div>
  );
}

function venueAddress(order: EventOrderDetails) {
  const venue = order.items?.[0]?.event?.venue;
  if (!venue) return null;
  const address = venue.address;
  const lines = [
    venue.name,
    address?.address_line_1,
    address?.address_line_2,
    [address?.city, address?.postal_code].filter(Boolean).join(" "),
    address?.country,
  ].filter(Boolean);
  return lines.length ? lines.join(", ") : null;
}

export function OrderDetailsModal({
  open,
  order,
  isLoading = false,
  isError = false,
  onClose,
}: OrderDetailsModalProps) {
  if (!open) return null;

  const customerName = order?.customer?.name?.trim() || "—";
  const customerEmail = order?.customer?.email?.trim() || "—";
  const customerPhone = order?.customer?.phone?.trim() || null;
  const eventName = order?.items?.[0]?.event?.name?.trim() || null;
  const location = order ? venueAddress(order) : null;
  const pdfUrl = order?.tickets_pdf_path?.trim() || null;

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="order-details-title"
      panelClassName="max-h-[min(860px,calc(100dvh-48px))] max-w-[560px] overflow-y-auto p-6"
    >
      <h2
        id="order-details-title"
        className="font-heading pr-8 text-[22px] font-bold uppercase leading-none tracking-[-0.03em] text-black"
      >
        Order details
      </h2>

      {isLoading ? (
        <p className="mt-6 text-[14px] text-[#6F6E69]">Loading order details...</p>
      ) : null}

      {isError ? (
        <p className="mt-6 text-[14px] text-[#d32f2f]">Unable to load order details.</p>
      ) : null}

      {!isLoading && !isError && order ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-[14px] text-[#6F6E69]">{order.unique_id}</p>
            <StatusBadge status={order.status} className="text-[14px]" />
          </div>

          <dl className="mt-6">
            <DetailRow
              label="Customer"
              value={
                <div>
                  <p className="font-bold">{customerName}</p>
                  <p className="text-[#6F6E69]">{customerEmail}</p>
                  {customerPhone ? <p className="text-[#6F6E69]">{customerPhone}</p> : null}
                </div>
              }
            />
            {eventName ? <DetailRow label="Event" value={eventName} /> : null}
            {location ? <DetailRow label="Venue" value={location} /> : null}
            <DetailRow label="Source" value={formatSalesChannel(order.sales_channel)} />
            <DetailRow label="Payment" value={formatPaymentProvider(order.payment)} />
            <DetailRow
              label="Payment status"
              value={
                <StatusBadge
                  status={order.payment?.status || order.status}
                  className="text-[14px]"
                />
              }
            />
            <DetailRow label="Paid at" value={formatOrderDate(order.paid_at)} />
            <DetailRow label="Created" value={formatOrderDate(order.created_at)} />
          </dl>

          <div className="mt-6 border-t border-black pt-4">
            <h3 className="font-heading text-[14px] font-bold uppercase text-black">Tickets</h3>
            <div className="mt-3 space-y-3">
              {(order.items ?? []).length === 0 ? (
                <p className="text-[14px] text-[#6F6E69]">No ticket items on this order.</p>
              ) : (
                (order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[4px] border border-black/15 px-3 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-black">
                          {item.ticket_name}
                          {item.offer_name ? (
                            <span className="font-normal text-[#6F6E69]">
                              {" "}
                              · {item.offer_name}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[13px] text-[#6F6E69]">
                          Qty {item.quantity}
                          {item.formatted_unit_price
                            ? ` · ${item.formatted_unit_price} each`
                            : ""}
                        </p>
                      </div>
                      <p className="text-[14px] font-bold text-black">
                        {item.formatted_total_price || "—"}
                      </p>
                    </div>

                    {(item.issued_tickets ?? []).length > 0 ? (
                      <ul className="mt-3 space-y-1.5 border-t border-black/10 pt-3">
                        {(item.issued_tickets ?? []).map((ticket) => (
                          <li
                            key={ticket.unique_id}
                            className="flex flex-wrap items-center justify-between gap-2 text-[12px]"
                          >
                            <span className="font-mono text-black/80">{ticket.code}</span>
                            <StatusBadge status={ticket.status} className="text-[12px]" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-black pt-4 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#6F6E69]">Subtotal</span>
              <span>
                {order.currency_sign || "£"}
                {order.subtotal ?? "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#6F6E69]">Discount</span>
              <span>
                {order.currency_sign || "£"}
                {order.discount_amount ?? "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#6F6E69]">Platform fee</span>
              <span>
                {order.currency_sign || "£"}
                {order.platform_fee_amount ?? "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-black/15 pt-2">
              <span className="font-heading text-[14px] font-bold uppercase">Total</span>
              <span className="text-[16px] font-bold">
                {order.formatted_total ||
                  `${order.currency_sign || "£"}${order.total_amount ?? "0.00"}`}
              </span>
            </div>
          </div>

          {order.notes ? (
            <p className="mt-4 text-[13px] leading-5 text-[#6F6E69]">
              <span className="font-bold uppercase text-black">Notes: </span>
              {order.notes}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[46px] flex-1 items-center justify-center rounded-[4px] border border-black bg-black px-4 text-[12px] font-normal uppercase text-white transition hover:opacity-90"
              >
                Download tickets PDF
              </a>
            ) : null}
            <Button
              type="button"
              onClick={onClose}
              className={`h-[46px] cursor-pointer rounded-[4px] border border-black bg-white px-4 text-[12px] font-normal uppercase text-black transition hover:bg-black hover:text-white ${
                pdfUrl ? "flex-1" : "w-full"
              }`}
            >
              Close
            </Button>
          </div>
        </>
      ) : null}
    </OrganiserModal>
  );
}
