"use client";

import { Fragment, useMemo, useState } from "react";
import {
  formatPaymentProvider,
  formatSalesChannel,
  type EventOrderDetails,
  type EventOrderLineItem,
  type EventOrderRefund,
} from "@/apis/organisation/eventOrdersApi";
import { CopyValue, SideDrawer, StatusBadge } from "@/components/common";
import { RefundOrderModal } from "@/components/organiser/events/RefundOrderModal";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";
import { formatStatusLabel } from "@/lib/ui/statusColors";

type OrderDetailsDrawerProps = {
  open: boolean;
  order: EventOrderDetails | null;
  eventTitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onRefundSuccess?: (payload: { amount: string; reasonHtml: string }) => void;
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

function parseMoneyAmount(value: string | null | undefined) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRefundStatusLabel(status: string | null | undefined) {
  return formatStatusLabel(status) || "—";
}

function orderRefundLabel(status: string | null | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (normalized === "refunded") return "Refunded";
  if (normalized === "partially_refunded") return "Partially refunded";
  return "No refund";
}

function InfoTip({ label, text }: { label: string; text: string }) {
  return (
    <span className="order-details-info-tip">
      <button
        type="button"
        className="order-details-info-tip__btn"
        aria-label={label}
      >
        i
      </button>
      <span className="order-details-info-tip__bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

function formatOrderDate(
  value: string | null | undefined,
  withAt = false,
  timeZone?: string | null,
) {
  return formatDateTime(value, {
    withAt,
    includeYear: true,
    emptyLabel: "—",
    timeZone,
  });
}

function formatOrderDateOnly(
  value: string | null | undefined,
  timeZone?: string | null,
) {
  return formatDateTime(value, {
    dateOnly: true,
    includeYear: true,
    emptyLabel: "—",
    timeZone,
  });
}

function formatCustomerPhone(
  countryCode?: string | null,
  phone?: string | null,
) {
  return [countryCode?.trim(), phone?.trim()].filter(Boolean).join(" ").trim();
}

function formatCardBrand(brand?: string | null) {
  const value = brand?.trim();
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

function RefundRow({
  refund,
  currencySign,
  timeZone,
}: {
  refund: EventOrderRefund;
  currencySign?: string | null;
  timeZone?: string | null;
}) {
  const reason = refund.reason?.trim() || "";
  const stripeRefundId = refund.stripe_refund_id?.trim() || null;

  return (
    <li className="order-details-refund">
      <div className="order-details-refund-top">
        <div className="order-details-refund-amount-wrap">
          <p className="order-details-refund-amount">
            {formatMoney(refund.amount, currencySign, refund.formatted_amount)}
          </p>
          {reason ? (
            <InfoTip label="Refund reason" text={reason} />
          ) : null}
        </div>
        <StatusBadge status={refund.status} className="order-details-badge" />
      </div>

      <dl className="order-details-refund-meta">
        <div className="order-details-refund-meta-row">
          <dt>Refund date</dt>
          <dd>
            {formatOrderDate(
              refund.refunded_at || refund.created_at,
              false,
              timeZone,
            )}
          </dd>
        </div>
        <div className="order-details-refund-meta-row">
          <dt>Refund status</dt>
          <dd>{formatRefundStatusLabel(refund.status)}</dd>
        </div>
        <div className="order-details-refund-meta-row">
          <dt>Stripe refund ID</dt>
          <dd>
            {stripeRefundId ? (
              <CopyValue value={stripeRefundId} ariaLabel="Copy Stripe refund ID" />
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </li>
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
            <tr className={open ? "order-details-ticket-row-open" : undefined}>
              <td>
                <div className="order-details-ticket-name">
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
              <td>
                <div className="order-details-ticket-total-cell">
                  <span>{item.formatted_total_price || "—"}</span>
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
                </div>
              </td>
            </tr>
            {open && canExpand ? (
              <tr className="order-details-issued-wrap-row">
                <td colSpan={4}>
                  <div className="order-details-issued-panel">
                    {issued.map((ticket, index) => (
                      <div key={ticket.unique_id} className="order-details-issued-row">
                        <div className="order-details-issued-meta">
                          <div className="order-details-issued-top">
                            <p className="order-details-issued-label">Ticket {index + 1}</p>
                            <StatusBadge status={ticket.status} className="order-details-badge" />
                          </div>
                          <p className="order-details-issued-code">{ticket.code || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}

function OrderDetailsContent({
  order,
  isLoading,
  isError,
  timeZone,
}: {
  order: EventOrderDetails | null;
  isLoading: boolean;
  isError: boolean;
  timeZone: string;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const items = order?.items ?? [];
  const pdfUrl = order?.tickets_pdf_path?.trim() || null;
  const customerName = order?.customer?.name?.trim() || "—";
  const customerEmail = order?.customer?.email?.trim() || "—";
  const customerPhone = formatCustomerPhone(
    order?.customer?.country_code,
    order?.customer?.phone,
  );
  const customerTotalOrders = order?.customer?.orders_count;
  const customerSince = order?.customer?.customer_since;
  const channelLabel = formatSalesChannel(order?.sales_channel);
  const requestOrigin = order?.request_origin?.trim() || null;
  const paymentLabel = formatPaymentProvider(order?.payment);
  const stripePaymentId =
    order?.payment?.payment_intent_id?.trim() ||
    order?.payment?.external_reference_id?.trim() ||
    order?.payment?.charge_id?.trim() ||
    null;
  const cardBrand = order?.payment?.card_brand?.trim() || null;
  const cardLast4 = order?.payment?.card_last4?.trim() || null;

  const activity = useMemo(() => {
    if (!order) return [];
    const paidMoney = formatMoney(
      order.payment?.amount ?? order.total_amount,
      order.currency_sign,
      order.payment?.formatted_amount ?? order.formatted_total,
    );
    const methodLabel =
      order.payment?.payment_method?.trim() ||
      (cardBrand || cardLast4 ? "Card" : null);
    const paymentNote = methodLabel
      ? `${paidMoney} via ${paymentLabel} (${methodLabel}).`
      : `${paidMoney} via ${paymentLabel}.`;

    const rows: { title: string; at: string | null | undefined; note: string }[] = [
      {
        title: "Order created",
        at: order.created_at,
        note: "Customer placed the order online.",
      },
    ];
    if (order.paid_at) {
      rows.push({
        title: "Payment completed",
        at: order.paid_at,
        note: paymentNote,
      });
    }
    const issued = issuedCount(order);
    if (issued > 0) {
      rows.push({
        title: "Tickets issued",
        at: order.paid_at || order.created_at,
        note: `${issued} ticket${issued === 1 ? "" : "s"} generated.`,
      });
    }
    rows.push({
      title: "Confirmation email sent",
      at: order.paid_at || order.created_at,
      note: `Email sent to ${customerEmail}.`,
    });
    return rows;
  }, [order, paymentLabel, customerEmail, cardBrand, cardLast4]);

  function toggleExpanded(id: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) {
    return <p className="order-details-state">Loading order details...</p>;
  }

  if (isError) {
    return (
      <p className="order-details-state order-details-state-error">
        Unable to load order details.
      </p>
    );
  }

  if (!order) return null;

  const tickets = ticketCount(order);
  const issued = issuedCount(order);
  const refunds = order.refunds ?? [];
  const paidAmountValue = parseMoneyAmount(
    order.payment?.amount ?? order.total_amount,
  );
  const totalRefundedValue = parseMoneyAmount(order.total_refunded);
  const remainingAmount = Math.max(0, paidAmountValue - totalRefundedValue);

  return (
    <div className="order-details">
      {pdfUrl ? (
        <div className="order-details-status-row">
          <div className="order-details-actions">
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="order-details-action-btn">
              <TicketIcon />
              View ticket
            </a>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="order-details-action-btn">
              <DownloadIcon />
              Download tickets
            </a>
          </div>
        </div>
      ) : null}

      <div className="order-details-summary">
        <article className="order-details-summary-card">
          <p className="order-details-summary-label">Order date & time</p>
          <p className="order-details-summary-value">
            {formatOrderDate(order.created_at, false, timeZone)}
          </p>
          <CopyValue value={order.unique_id} ariaLabel="Copy order ID" />
        </article>

        <article className="order-details-summary-card">
          <p className="order-details-summary-label">Order status</p>
          <StatusBadge status={order.status} className="order-details-badge-lg" />
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
          {requestOrigin ? (
            <p className="order-details-summary-sub">{requestOrigin}</p>
          ) : null}
        </article>
      </div>

      <div className="order-details-body">
        <div className="order-details-stack">
          <section className="order-details-panel" aria-label="Tickets in this order">
            <div className="order-details-panel-header">
              <h3 className="order-details-panel-title">Tickets in this order</h3>
            </div>
            <div className="order-details-scroll">
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
                {formatMoney(order.total_amount, order.currency_sign, order.formatted_total)}
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
            </ul>
          </section>

          {refunds.length > 0 ? (
            <section className="order-details-panel" aria-label="Refunds">
              <div className="order-details-panel-header">
                <h3 className="order-details-panel-title">Refunds</h3>
              </div>

              <ul className="order-details-breakdown">
                <li className="order-details-breakdown-row">
                  <span className="order-details-breakdown-label">Total refunded</span>
                  <span className="order-details-breakdown-value order-details-breakdown-discount">
                    {formatMoney(
                      order.total_refunded,
                      order.currency_sign,
                      order.formatted_total_refunded,
                    )}
                  </span>
                </li>
                <li className="order-details-breakdown-row">
                  <span className="order-details-breakdown-label">Amount remaining</span>
                  <span className="order-details-breakdown-value">
                    {formatMoney(remainingAmount.toFixed(2), order.currency_sign)}
                  </span>
                </li>
              </ul>

              <ul className="order-details-refunds">
                {refunds.map((refund) => (
                  <RefundRow
                    key={refund.id}
                    refund={refund}
                    currencySign={order.currency_sign}
                    timeZone={timeZone}
                  />
                ))}
              </ul>
            </section>
          ) : null}
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
                    className="order-details-badge"
                  />
                </dd>
              </div>
              <div className="order-details-kv-row">
                <dt className="order-details-kv-label">Payment method</dt>
                <dd className="order-details-kv-value">{paymentLabel}</dd>
              </div>
              <div className="order-details-kv-row">
                <dt className="order-details-kv-label">Card brand</dt>
                <dd className="order-details-kv-value">{formatCardBrand(cardBrand)}</dd>
              </div>
              <div className="order-details-kv-row">
                <dt className="order-details-kv-label">Card last 4</dt>
                <dd className="order-details-kv-value">
                  {cardLast4 ? `•••• ${cardLast4}` : "—"}
                </dd>
              </div>
              <div className="order-details-kv-row">
                <dt className="order-details-kv-label">Stripe Payment ID</dt>
                <dd className="order-details-kv-value">
                  {stripePaymentId ? (
                    <CopyValue value={stripePaymentId} ariaLabel="Copy Stripe Payment ID" />
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="order-details-kv-row">
                <dt className="order-details-kv-label">Payment date & time</dt>
                <dd className="order-details-kv-value">
                  {formatOrderDate(
                    order.payment?.paid_at || order.paid_at,
                    false,
                    timeZone,
                  )}
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
                  {orderRefundLabel(order.status)}
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
                  <div className="order-details-timeline-copy">
                    <p className="order-details-timeline-time">
                      {formatOrderDate(row.at, false, timeZone)}
                    </p>
                    <p className="order-details-timeline-title">{row.title}</p>
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
                  <p className="order-details-customer-stat-value">
                    {customerTotalOrders == null || customerTotalOrders === ""
                      ? "—"
                      : String(customerTotalOrders)}
                  </p>
                </div>
                <div>
                  <p className="order-details-customer-stat-label">Customer since</p>
                  <p className="order-details-customer-stat-value">
                    {formatOrderDateOnly(customerSince, timeZone)}
                  </p>
                </div>
                <div>
                  <p className="order-details-customer-stat-label">Last order</p>
                  <p className="order-details-customer-stat-value">
                    {formatOrderDateOnly(order.created_at, timeZone)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function OrderDetailsDrawer({
  open,
  order,
  eventTitle,
  isLoading = false,
  isError = false,
  onClose,
  onRefundSuccess,
}: OrderDetailsDrawerProps) {
  const [refundOpen, setRefundOpen] = useState(false);
  const organisationTimezone = useOrganisationTimezone();

  const resolvedEventTitle =
    eventTitle?.trim() || order?.items?.[0]?.event?.name?.trim() || "Event";
  const title = order?.unique_id ? `Order #${order.unique_id}` : "Order details";
  const subtitle = order
    ? `${resolvedEventTitle} · Placed on ${formatOrderDate(order.created_at, true, organisationTimezone)}`
    : undefined;

  const orderStatus = String(order?.status ?? "").toLowerCase();
  const refundableRemaining = order
    ? Math.max(
        0,
        parseMoneyAmount(order.payment?.amount ?? order.total_amount) -
          parseMoneyAmount(order.total_refunded),
      )
    : 0;
  const canIssueRefund =
    Boolean(order) &&
    orderStatus !== "refunded" &&
    orderStatus !== "cancelled" &&
    refundableRemaining > 0;

  const headerActions =
    order && !isLoading && !isError && canIssueRefund ? (
      <button
        type="button"
        className="order-details-action-btn order-details-action-btn-danger"
        onClick={() => setRefundOpen(true)}
      >
        <RefundIcon />
        Refund order
      </button>
    ) : null;

  return (
    <>
      <SideDrawer
        isOpen={open}
        onClose={() => {
          setRefundOpen(false);
          onClose();
        }}
        title={title}
        subtitle={subtitle}
        logo={
          <span className="side-drawer-logo-muted" aria-hidden>
            <DocumentIcon />
          </span>
        }
        headerActions={headerActions}
        showFooter={false}
        panelClassName="side-drawer-panel--xl"
      >
        <OrderDetailsContent
          order={order}
          isLoading={isLoading}
          isError={isError}
          timeZone={organisationTimezone}
        />
      </SideDrawer>

      <RefundOrderModal
        open={refundOpen}
        order={order}
        eventTitle={eventTitle}
        onClose={() => setRefundOpen(false)}
        onSuccess={onRefundSuccess}
      />
    </>
  );
}
