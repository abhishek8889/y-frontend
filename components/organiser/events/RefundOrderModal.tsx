"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useIssueOrderRefundMutation,
  type EventOrderDetails,
} from "@/apis/organisation/eventOrdersApi";
import { RichTextEditor } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { InputField } from "@/components/ui/InputField";

const REASON_MAX = 500;
const REASON_PLACEHOLDER = "Enter your reason to give refund.";

type RefundOrderModalProps = {
  open: boolean;
  order: EventOrderDetails | null;
  eventTitle?: string;
  onClose: () => void;
  /** Called after a successful refund API response. */
  onSuccess?: (payload: { amount: string; reasonHtml: string }) => void;
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

function parseAmountNumber(value: string | null | undefined) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : NaN;
}

/** Digits + optional single decimal, max 2 fractional digits. */
function sanitizeAmountInput(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;

  const whole = cleaned.slice(0, firstDot).replace(/\./g, "");
  const fraction = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  return `${whole}.${fraction}`;
}

function clampAmountToMax(value: string, max: number) {
  if (!value.trim()) return value;
  if (!Number.isFinite(max)) return value;

  const numeric = parseAmountNumber(value);
  if (!Number.isFinite(numeric)) return value;
  if (numeric <= max) return value;

  return Number.isInteger(max) ? String(max) : max.toFixed(2);
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
  onSuccess,
}: RefundOrderModalProps) {
  const paidAmount = order?.payment?.amount ?? order?.total_amount ?? "0.00";
  const alreadyRefunded = order?.total_refunded ?? "0.00";
  const paidNumber = parseAmountNumber(paidAmount);
  const refundedNumber = parseAmountNumber(alreadyRefunded);
  const remainingNumber = Math.max(0, paidNumber - refundedNumber);
  const remainingAmount = remainingNumber.toFixed(2);
  const currencySign = order?.currency_sign?.trim() || "£";
  const resolvedEvent =
    eventTitle?.trim() ||
    order?.items?.[0]?.event?.name?.trim() ||
    "Event";

  const [amount, setAmount] = useState(remainingAmount);
  const [reasonHtml, setReasonHtml] = useState("");
  const [issueRefund, { isLoading: isRefunding }] = useIssueOrderRefundMutation();

  useEffect(() => {
    if (!open || !order) return;
    setAmount(remainingAmount);
    setReasonHtml("");
  }, [open, order, remainingAmount]);

  const reasonLength = useMemo(() => plainTextLength(reasonHtml), [reasonHtml]);
  const maxNumber = remainingNumber;
  const amountNumber = parseAmountNumber(amount);
  const amountValid =
    Number.isFinite(amountNumber) && amountNumber > 0 && amountNumber <= maxNumber + 1e-9;
  const reasonValid = reasonLength > 0 && reasonLength <= REASON_MAX;
  const canSubmit = Boolean(order) && amountValid && reasonValid && !isRefunding;

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw);
    setAmount(clampAmountToMax(next, maxNumber));
  }

  async function handleRefund() {
    if (!order || !canSubmit) return;

    const payload = {
      amount: amountNumber.toFixed(2),
      reasonHtml,
    };

    try {
      await issueRefund({
        orderId: order.id,
        amount: payload.amount,
        reason: reasonHtml,
      }).unwrap();
      onSuccess?.(payload);
      onClose();
    } catch {
      /* Error toast handled by withQueryToast */
    }
  }

  if (!open) return null;

  const paidLabel = order
    ? formatMoney(
        paidAmount,
        currencySign,
        order.payment?.formatted_amount ?? order.formatted_total,
      )
    : null;
  const refundedLabel = order
    ? formatMoney(
        alreadyRefunded,
        currencySign,
        order.formatted_total_refunded,
      )
    : null;
  const remainingLabel = order
    ? formatMoney(remainingAmount, currencySign)
    : null;

  return (
    <OrganiserModal
      open={open}
      onClose={isRefunding ? undefined : onClose}
      showClose={!isRefunding}
      titleId="refund-order-title"
      panelClassName="refund-order-panel"
    >
      <div className="refund-order">
        <header className="refund-order-header">
          <h2 id="refund-order-title" className="refund-order-title">
            {order?.unique_id
              ? `Refund order #${order.unique_id}`
              : "Refund order"}
          </h2>
          <p className="refund-order-subtitle">
            Accept the customer&apos;s claim and refund them. Add a statement to explain the
            decision.
          </p>
        </header>

        {!order ? (
          <div className="refund-order-body">
            <p className="refund-order-loading" role="status">
              Loading order details...
            </p>
          </div>
        ) : (
          <>
            <div className="refund-order-body">
              <dl className="refund-order-summary">
                <div className="refund-order-summary-row">
                  <dt>Event</dt>
                  <dd>{resolvedEvent}</dd>
                </div>
                <div className="refund-order-summary-row">
                  <dt>Amount paid</dt>
                  <dd>{paidLabel}</dd>
                </div>
                {refundedNumber > 0 ? (
                  <div className="refund-order-summary-row">
                    <dt>Already refunded</dt>
                    <dd>{refundedLabel}</dd>
                  </div>
                ) : null}
                <div className="refund-order-summary-row">
                  <dt>Remaining refundable</dt>
                  <dd>{remainingLabel}</dd>
                </div>
              </dl>

              <div className="refund-order-info" role="note">
                <span className="refund-order-info-icon">
                  <InfoIcon />
                </span>
                <p>
                  The refund amount cannot be more than the remaining refundable amount (
                  {remainingLabel}).
                </p>
              </div>

              <InputField
                name="refundAmount"
                label="Refund Amount *"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                value={amount}
                onChange={(event) => handleAmountChange(event.target.value)}
                onBlur={() => {
                  if (!amount.trim() || !Number.isFinite(amountNumber)) return;
                  setAmount(clampAmountToMax(amountNumber.toFixed(2), maxNumber));
                }}
                disabled={isRefunding}
                prefix={currencySign}
                density="compact"
                containerClassName="refund-order-amount-box"
                className="refund-order-amount-input"
                labelClassName="input-heading"
                prefixClassName="refund-order-amount-prefix"
              />

              <div className="refund-order-reason">
                <RichTextEditor
                  id="refund-reason"
                  label="Reason *"
                  valueHtml={reasonHtml}
                  onChangeHtml={setReasonHtml}
                  placeholder={REASON_PLACEHOLDER}
                  minHeightClassName="refund-order-reason-editor"
                  labelClassName="input-heading"
                />
                <p
                  className={[
                    "refund-order-counter",
                    reasonLength > REASON_MAX ? "refund-order-counter-error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {reasonLength} / {REASON_MAX}
                </p>
              </div>
            </div>

            <footer className="refund-order-footer">
              <button
                type="button"
                className="form-footer-btn form-footer-btn-secondary"
                onClick={onClose}
                disabled={isRefunding}
              >
                Cancel
              </button>
              <button
                type="button"
                className="form-footer-btn form-footer-btn-primary"
                disabled={!canSubmit}
                onClick={() => void handleRefund()}
              >
                {isRefunding ? "Refunding..." : "Refund"}
              </button>
            </footer>
          </>
        )}
      </div>
    </OrganiserModal>
  );
}
