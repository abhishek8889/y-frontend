"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventOrderDetails } from "@/apis/organisation/eventOrdersApi";
import { RichTextEditor } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { InputField } from "@/components/ui/InputField";

const REASON_MAX = 500;

type RefundOrderModalProps = {
  open: boolean;
  order: EventOrderDetails | null;
  eventTitle?: string;
  onClose: () => void;
  onSubmit?: (payload: { amount: string; reasonHtml: string }) => void;
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

function plainTextLength(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function defaultReason(order: EventOrderDetails, eventTitle: string) {
  const email = order.customer?.email?.trim() || "the customer";
  const ticketBits = (order.items ?? [])
    .map((item) => {
      const qty = Number(item.quantity) || 0;
      return qty > 0 ? `${qty} x ${item.ticket_name}` : item.ticket_name;
    })
    .filter(Boolean)
    .join(", ");
  const tickets = ticketBits || "tickets";
  return `<p>The customer purchased ${tickets} for ${eventTitle}. The order was successfully paid and the e-tickets were generated and sent to the customer's email at ${email}.</p>`;
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 10.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function RefundOrderModal({
  open,
  order,
  eventTitle,
  onClose,
  onSubmit,
}: RefundOrderModalProps) {
  const paidAmount = order?.payment?.amount ?? order?.total_amount ?? "0.00";
  const currencySign = order?.currency_sign?.trim() || "£";
  const resolvedEvent =
    eventTitle?.trim() ||
    order?.items?.[0]?.event?.name?.trim() ||
    "Event";

  const [amount, setAmount] = useState(paidAmount);
  const [reasonHtml, setReasonHtml] = useState("");

  useEffect(() => {
    if (!open || !order) return;
    setAmount(paidAmount);
    setReasonHtml(defaultReason(order, resolvedEvent));
  }, [open, order, paidAmount, resolvedEvent]);

  const reasonLength = useMemo(() => plainTextLength(reasonHtml), [reasonHtml]);
  const amountNumber = Number(String(amount).replace(/[^0-9.]/g, ""));
  const maxNumber = Number(String(paidAmount).replace(/[^0-9.]/g, ""));
  const amountValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    (!Number.isFinite(maxNumber) || amountNumber <= maxNumber + 1e-9);
  const reasonValid = reasonLength > 0 && reasonLength <= REASON_MAX;
  const canSubmit = Boolean(order) && amountValid && reasonValid;

  if (!open || !order) return null;

  const paidLabel = formatMoney(
    paidAmount,
    currencySign,
    order.payment?.formatted_amount ?? order.formatted_total,
  );

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="refund-order-title"
      panelClassName="max-h-[min(860px,calc(100dvh-32px))] max-w-[560px] overflow-y-auto"
    >
      <div className="refund-order">
        <header className="refund-order-header">
          <h2 id="refund-order-title" className="refund-order-title">
            Refund order
          </h2>
          <p className="refund-order-subtitle">
            Accept the customer&apos;s claim and refund them. Add a statement to explain the
            decision.
          </p>
        </header>

        <div className="refund-order-body">
          <dl className="refund-order-summary">
            <div className="refund-order-summary-row">
              <dt>Order</dt>
              <dd>
                {order.unique_id} · {resolvedEvent}
              </dd>
            </div>
            <div className="refund-order-summary-row">
              <dt>Disputed amount</dt>
              <dd>{paidLabel}</dd>
            </div>
          </dl>

          <div className="refund-order-info" role="note">
            <span className="refund-order-info-icon">
              <InfoIcon />
            </span>
            <p>
              The refund amount cannot be more than the original payment amount ({paidLabel}).
            </p>
          </div>

          <InputField
            name="refundAmount"
            label="Refund Amount *"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            prefix={currencySign}
            prefixClassName="ml-3 mr-1 text-[14px] text-black"
            density="compact"
            containerClassName="!rounded-[4px] !border-black"
            className="!px-2 !text-[14px]"
            labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
          />

          <div className="refund-order-reason">
            <RichTextEditor
              id="refund-reason"
              label="Reason *"
              valueHtml={reasonHtml}
              onChangeHtml={setReasonHtml}
              placeholder="Explain the refund decision…"
              minHeightClassName="min-h-[180px]"
              labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
            />
            <p
              className={`refund-order-counter ${
                reasonLength > REASON_MAX ? "refund-order-counter-error" : ""
              }`}
            >
              {reasonLength} / {REASON_MAX}
            </p>
          </div>
        </div>

        <footer className="refund-order-footer">
          <button type="button" className="refund-order-btn refund-order-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="refund-order-btn refund-order-btn-primary"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onSubmit?.({ amount: String(amountNumber.toFixed(2)), reasonHtml });
              onClose();
            }}
          >
            Refund
          </button>
        </footer>
      </div>
    </OrganiserModal>
  );
}
