"use client";

import { Fragment, useMemo, useState } from "react";
import {
  formatPaymentProvider,
  formatSalesChannel,
  type EventOrderDetails,
  type EventOrderLineItem,
} from "@/apis/organisation/eventOrdersApi";
import { StatusBadge } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { RefundOrderModal } from "@/components/organiser/events/RefundOrderModal";

type OrderDetailsModalProps = {
  open: boolean;
  order: EventOrderDetails | null;
  eventTitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onResend?: () => void;
  onRefundSubmit?: (payload: { amount: string; reasonHtml: string }) => void;
};

function formatMoney(
  amount: string | null | undefined,
  currencySign?: string | null,
  formatted?: string | null,
) {
  if (formatted?.trim()) return formatted.trim();
  const sign = currencySign?.trim() || "£";
  if (amount == null || amount === "") return `${sign}0.00`;
  return `${sign}${amount}`;
}

function formatOrderDate(value: string | null | undefined, withAt = false) {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return withAt ? `${datePart} at ${timePart}` : `${datePart}, ${timePart}`;
}

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function ticketCount(order: EventOrderDetails) {
  return (order.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function issuedCount(order: EventOrderDetails) {
  return (order.items ?? []).reduce(
    (sum, item) => sum + (item.issued_tickets?.length ?? 0),
    0,
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore */
  }
}

function DocumentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h7.5L19 8v12.5H7V3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14.5 3.5V8H19" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 12h6M10 15.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 0 6.5 6h11A2.5 2.5 0 0 0 20 8.5v1a2 2 0 0 1 0 4v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a2 2 0 0 1 0-4v-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 20 4l-4.5 16-4-5.5L4 11.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 18.5h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefundIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8H4.5V5.5M4.7 8.3A7.5 7.5 0 1 1 5.5 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 15.5V5.5A1.5 1.5 0 0 1 7 4h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14h2.5v2.5H14V14Zm3.5 0H20v2.5h-2.5V14ZM14 17.5h2.5V20H14v-2.5Zm3.5 0H20V20h-2.5v-2.5Z" fill="currentColor" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={open ? "order-details-chevron-open" : undefined}
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TicketRows({
  items,
  expandedIds,
  onToggle,
}: {
  items: EventOrderLineItem[];
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  if (!items.length) {
    return (
      <tr>
        <td colSpan={4}>
          <p className="order-details-empty">No ticket items on this order.</p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {items.map((item) => {
        const open = expandedIds.has(item.id);
        const issued = item.issued_tickets ?? [];
        const canExpand = issued.length > 0;

        return (
          <Fragment key={item.id}>
            <tr>
              <td>
                <div className="order-details-ticket-name">
                  {canExpand ? (
                    <button
                      type="button"
                      className="order-details-ticket-expand"
                      aria-expanded={open}
                      aria-label={open ? "Collapse ticket group" : "Expand ticket group"}
                      onClick={() => onToggle(item.id)}
                    >
                      <ChevronIcon open={open} />
                    </button>
                  ) : (
                    <span className="order-details-ticket-expand" aria-hidden />
                  )}
                  <div>
                    <p className="order-details-ticket-title">{item.ticket_name}</p>
                    {item.offer_name ? (
                      <p className="order-details-ticket-sub">{item.offer_name}</p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td>{item.quantity}</td>
              <td>{item.formatted_unit_price || "—"}</td>
              <td>{item.formatted_total_price || "—"}</td>
            </tr>
            {open && canExpand
              ? issued.map((ticket, index) => (
                  <tr key={ticket.unique_id}>
                    <td colSpan={4}>
                      <div className="order-details-issued-row">
                        <div className="order-details-issued-meta">
                          <p className="order-details-issued-label">Ticket {index + 1}</p>
                          <p className="order-details-issued-code">{ticket.code}</p>
                        </div>
                        <div className="order-details-issued-side">
                          <StatusBadge status={ticket.status} className="text-[11px]" />
                          <span className="order-details-qr-chip">
                            <QrIcon />
                            Unique ticket QR
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </Fragment>
        );
      })}
    </>
  );
}

export function OrderDetailsModal({
  open,
  order,
  eventTitle,
  isLoading = false,
  isError = false,
  onClose,
  onResend,
  onRefundSubmit,
}: OrderDetailsModalProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [refundOpen, setRefundOpen] = useState(false);

  const items = order?.items ?? [];
  const pdfUrl = order?.tickets_pdf_path?.trim() || null;
  const customerName = order?.customer?.name?.trim() || "—";
  const customerEmail = order?.customer?.email?.trim() || "—";
  const customerPhone = order?.customer?.phone?.trim() || null;
  const resolvedEventTitle =
    eventTitle?.trim() ||
    order?.items?.[0]?.event?.name?.trim() ||
    "Event";
  const channelLabel = formatSalesChannel(order?.sales_channel);
  const paymentLabel = formatPaymentProvider(order?.payment);
  const transactionId =
    order?.payment?.external_reference_id?.trim() ||
    order?.payment?.payment_intent_id?.trim() ||
    order?.payment?.charge_id?.trim() ||
    null;

  const activity = useMemo(() => {
    if (!order) return [];
    const rows: { title: string; at: string | null | undefined; note: string }[] = [
      {
        title: "Order created",
        at: order.created_at,
        note: "Order was placed successfully.",
      },
    ];
    if (order.paid_at) {
      rows.push({
        title: "Payment completed",
        at: order.paid_at,
        note: `Payment received via ${paymentLabel}.`,
      });
    }
    const issued = issuedCount(order);
    if (issued > 0) {
      rows.push({
        title: "Tickets issued",
        at: order.paid_at || order.created_at,
        note: `${issued} ticket${issued === 1 ? "" : "s"} issued for this order.`,
      });
    }
    rows.push({
      title: "Confirmation email sent",
      at: order.paid_at || order.created_at,
      note: `Confirmation sent to ${customerEmail}.`,
    });
    return rows;
  }, [order, paymentLabel, customerEmail]);

  function toggleExpanded(id: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!open) return null;

  const tickets = order ? ticketCount(order) : 0;
  const issued = order ? issuedCount(order) : 0;

  return (
    <>
    <OrganiserModal
      open={open}
      onClose={() => {
        setRefundOpen(false);
        onClose();
      }}
      showClose
      titleId="order-details-title"
      panelClassName="max-h-[min(920px,calc(100dvh-32px))] max-w-[min(1120px,calc(100vw-24px))] overflow-y-auto"
    >
      <div className="order-details">
        {isLoading ? (
          <p className="order-details-state">Loading order details...</p>
        ) : null}

        {isError ? (
          <p className="order-details-state order-details-state-error">
            Unable to load order details.
          </p>
        ) : null}

        {!isLoading && !isError && order ? (
          <>
            <header className="order-details-header">
              <div className="order-details-header-main">
                <div className="order-details-title-row">
                  <span className="order-details-title-icon">
                    <DocumentIcon />
                  </span>
                  <h2 id="order-details-title" className="order-details-title">
                    Order #{order.unique_id}
                  </h2>
                  <StatusBadge status={order.status} className="text-[12px]" />
                  <span className="order-details-channel">{channelLabel} order</span>
                </div>
                <p className="order-details-meta">
                  <strong>{resolvedEventTitle}</strong>
                  {" · "}
                  Placed on {formatOrderDate(order.created_at, true)}
                </p>
              </div>

              <div className="order-details-actions">
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="order-details-action-btn"
                  >
                    <TicketIcon />
                    View ticket
                  </a>
                ) : null}
                <button
                  type="button"
                  className="order-details-action-btn"
                  onClick={onResend}
                >
                  <SendIcon />
                  Resend confirmation
                </button>
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="order-details-action-btn"
                  >
                    <DownloadIcon />
                    Download tickets
                  </a>
                ) : null}
                <button
                  type="button"
                  className="order-details-action-btn order-details-action-btn-danger"
                  onClick={() => setRefundOpen(true)}
                >
                  <RefundIcon />
                  Refund order
                </button>
              </div>
            </header>

            <div className="order-details-summary">
              <article className="order-details-summary-card">
                <p className="order-details-summary-label">Order date & time</p>
                <p className="order-details-summary-value">
                  {formatOrderDate(order.created_at)}
                </p>
                <button
                  type="button"
                  className="order-details-copy-btn"
                  onClick={() => void copyText(order.unique_id)}
                >
                  {order.unique_id}
                  <CopyIcon />
                </button>
              </article>

              <article className="order-details-summary-card">
                <p className="order-details-summary-label">Order status</p>
                <StatusBadge status={order.status} className="text-[13px] font-bold" />
                <p className="order-details-summary-sub">
                  {order.paid_at ? "Payment successful" : "Awaiting payment"}
                </p>
              </article>

              <article className="order-details-summary-card">
                <p className="order-details-summary-label">Tickets status</p>
                <p className="order-details-summary-value">
                  {issued > 0 ? "Tickets issued" : "Pending issue"}
                </p>
                <p className="order-details-summary-sub">
                  {tickets} ticket{tickets === 1 ? "" : "s"}
                  {issued > 0 ? ` · ${issued} issued` : ""}
                </p>
              </article>

              <article className="order-details-summary-card">
                <p className="order-details-summary-label">Order type</p>
                <p className="order-details-summary-value">{channelLabel}</p>
                <p className="order-details-summary-sub">Source: {channelLabel}</p>
              </article>
            </div>

            <div className="order-details-body">
              <div className="order-details-stack">
                <section className="order-details-panel" aria-label="Tickets in this order">
                  <div className="order-details-panel-header">
                    <h3 className="order-details-panel-title">Tickets in this order</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="order-details-tickets-table">
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Qty</th>
                          <th>Unit price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <TicketRows
                          items={items}
                          expandedIds={expandedIds}
                          onToggle={toggleExpanded}
                        />
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="order-details-panel" aria-label="Amount breakdown">
                  <div className="order-details-panel-header">
                    <h3 className="order-details-panel-title">Amount breakdown</h3>
                  </div>
                  <ul className="order-details-breakdown">
                    {items.map((item) => (
                      <li key={`breakdown-${item.id}`} className="order-details-breakdown-row">
                        <span className="order-details-breakdown-label">
                          {item.ticket_name}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </span>
                        <span className="order-details-breakdown-value">
                          {item.formatted_total_price || "—"}
                        </span>
                      </li>
                    ))}
                    <li className="order-details-breakdown-row">
                      <span className="order-details-breakdown-label">Subtotal</span>
                      <span className="order-details-breakdown-value">
                        {formatMoney(order.subtotal, order.currency_sign)}
                      </span>
                    </li>
                    <li className="order-details-breakdown-row">
                      <span className="order-details-breakdown-label">Booking fee</span>
                      <span className="order-details-breakdown-value">
                        {formatMoney(order.platform_fee_amount, order.currency_sign)}
                      </span>
                    </li>
                    <li className="order-details-breakdown-row">
                      <span className="order-details-breakdown-label">Discount</span>
                      <span className="order-details-breakdown-value order-details-breakdown-discount">
                        −{formatMoney(order.discount_amount, order.currency_sign)}
                      </span>
                    </li>
                  </ul>

                  <div className="order-details-breakdown-total">
                    <span>Order total</span>
                    <span>
                      {formatMoney(
                        order.total_amount,
                        order.currency_sign,
                        order.formatted_total,
                      )}
                    </span>
                  </div>

                  <ul className="order-details-breakdown">
                    <li className="order-details-breakdown-row">
                      <span className="order-details-breakdown-label">Amount paid</span>
                      <span className="order-details-breakdown-value">
                        {formatMoney(
                          order.payment?.amount ?? order.total_amount,
                          order.currency_sign,
                          order.payment?.formatted_amount ?? order.formatted_total,
                        )}
                      </span>
                    </li>
                    <li className="order-details-breakdown-row">
                      <span className="order-details-breakdown-label">Outstanding balance</span>
                      <span className="order-details-breakdown-value">
                        {formatMoney("0.00", order.currency_sign)}
                      </span>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="order-details-stack">
                <section className="order-details-panel" aria-label="Payment details">
                  <div className="order-details-panel-header">
                    <h3 className="order-details-panel-title">Payment details</h3>
                  </div>
                  <dl className="order-details-kv">
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Payment status</dt>
                      <dd className="order-details-kv-value">
                        <StatusBadge
                          status={order.payment?.status || order.status}
                          className="text-[12px]"
                        />
                      </dd>
                    </div>
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Payment method</dt>
                      <dd className="order-details-kv-value">{paymentLabel}</dd>
                    </div>
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Transaction ID</dt>
                      <dd className="order-details-kv-value">
                        {transactionId ? (
                          <button
                            type="button"
                            className="order-details-copy-btn"
                            onClick={() => void copyText(transactionId)}
                          >
                            {transactionId}
                            <CopyIcon />
                          </button>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Payment date & time</dt>
                      <dd className="order-details-kv-value">
                        {formatOrderDate(order.payment?.paid_at || order.paid_at)}
                      </dd>
                    </div>
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Amount paid</dt>
                      <dd className="order-details-kv-value">
                        {formatMoney(
                          order.payment?.amount ?? order.total_amount,
                          order.currency_sign,
                          order.payment?.formatted_amount ?? order.formatted_total,
                        )}
                      </dd>
                    </div>
                    <div className="order-details-kv-row">
                      <dt className="order-details-kv-label">Refund status</dt>
                      <dd className="order-details-kv-value">
                        {String(order.status).toLowerCase() === "refunded"
                          ? "Refunded"
                          : "No refund"}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="order-details-panel" aria-label="Order activity">
                  <div className="order-details-panel-header">
                    <h3 className="order-details-panel-title">Order activity</h3>
                  </div>
                  <ol className="order-details-timeline">
                    {activity.map((row) => (
                      <li key={row.title} className="order-details-timeline-item">
                        <span className="order-details-timeline-dot" aria-hidden />
                        <div>
                          <p className="order-details-timeline-title">{row.title}</p>
                          <p className="order-details-timeline-time">
                            {formatOrderDate(row.at)}
                          </p>
                          <p className="order-details-timeline-note">{row.note}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="order-details-panel" aria-label="Customer information">
                  <div className="order-details-panel-header">
                    <h3 className="order-details-panel-title">Customer information</h3>
                    {order.customer?.user_id ? (
                      <button type="button" className="order-details-ghost-btn">
                        View profile
                      </button>
                    ) : null}
                  </div>

                  <div className="order-details-customer">
                    <div className="order-details-customer-top">
                      <span className="order-details-avatar" aria-hidden>
                        {customerInitials(customerName)}
                      </span>
                      <div className="order-details-customer-copy">
                        <p className="order-details-customer-name">{customerName}</p>
                        <p className="order-details-customer-line">{customerEmail}</p>
                        {customerPhone ? (
                          <p className="order-details-customer-line">{customerPhone}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="order-details-customer-stats">
                      <div>
                        <p className="order-details-customer-stat-label">Total orders</p>
                        <p className="order-details-customer-stat-value">—</p>
                      </div>
                      <div>
                        <p className="order-details-customer-stat-label">Customer since</p>
                        <p className="order-details-customer-stat-value">—</p>
                      </div>
                      <div>
                        <p className="order-details-customer-stat-label">Last order</p>
                        <p className="order-details-customer-stat-value">
                          {formatOrderDate(order.created_at).split(",")[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </OrganiserModal>

    <RefundOrderModal
      open={refundOpen}
      order={order}
      eventTitle={eventTitle}
      onClose={() => setRefundOpen(false)}
      onSubmit={onRefundSubmit}
    />
    </>
  );
}
