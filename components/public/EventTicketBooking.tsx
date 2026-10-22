"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { PaymentForm } from "@/app/(public)/event/[id]/PaymentForm";
import {
  useStartBookingTicketMutation,
  type PublicEventDetails,
  type PublicEventTicket,
} from "@/apis/public/publicEventsApi";
import { SelectField } from "@/components/ui/SelectField";
import { InputField } from "@/components/ui/InputField";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getAuthToken } from "@/lib/api/token";
import {
  buildTicketSelectOptions,
  formatMoney,
  getEventPlatformFeeRate,
  maxOfferQuantity,
  type TicketSelectOption,
} from "@/lib/events/publicEventFormat";

type BookingLine = {
  option: TicketSelectOption;
  qty: number;
};

type EventTicketBookingProps = {
  event: PublicEventDetails;
  tickets: PublicEventTicket[];
  stripePromise: Promise<Stripe | null> | null;
};

function QuantityStepper({
  value,
  min = 1,
  max,
  disabled,
  onChange,
}: {
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex h-[42px] items-center border border-black/60">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-full w-10 cursor-pointer items-center justify-center text-[18px] disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-[13px] font-medium">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-full w-10 cursor-pointer items-center justify-center text-[18px] disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function EventTicketBooking({ event, tickets, stripePromise }: EventTicketBookingProps) {
  const router = useRouter();
  const ticketOptions = useMemo(() => buildTicketSelectOptions(tickets), [tickets]);
  const feeRate = getEventPlatformFeeRate(event);
  const currency = ticketOptions[0]?.currency || "GBP";

  const [lines, setLines] = useState<BookingLine[]>([]);
  const [pickerValue, setPickerValue] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [paidTotalCents, setPaidTotalCents] = useState(0);

  const [startBooking, startBookingState] = useStartBookingTicketMutation();

  const unusedOptions = useMemo(
    () =>
      ticketOptions.filter(
        (option) => !lines.some((line) => line.option.offerId === option.offerId),
      ),
    [ticketOptions, lines],
  );

  const subtotal = lines.reduce((sum, line) => sum + line.option.amount * line.qty, 0);
  const platformFee = Math.round(subtotal * (feeRate / 100) * 100) / 100;
  const discount = 0;
  const total = Math.round((subtotal - discount) * 100) / 100;
  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);

  function addOffer(value: string) {
    const option = ticketOptions.find((item) => item.value === value);
    if (!option) return;
    if (lines.some((line) => line.option.offerId === option.offerId)) return;
    setLines((current) => [...current, { option, qty: 1 }]);
    setPickerValue("");
    setIsPaymentOpen(false);
    setPaymentClientSecret(null);
    setPaymentError("");
  }

  function updateQty(offerId: number, qty: number) {
    setLines((current) =>
      current.map((line) =>
        line.option.offerId === offerId
          ? { ...line, qty: Math.min(maxOfferQuantity(line.option), Math.max(1, qty)) }
          : line,
      ),
    );
    setIsPaymentOpen(false);
    setPaymentClientSecret(null);
  }

  function removeLine(offerId: number) {
    setLines((current) => current.filter((line) => line.option.offerId !== offerId));
    setIsPaymentOpen(false);
    setPaymentClientSecret(null);
  }

  function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponMessage("Enter a coupon code.");
      setAppliedCoupon("");
      return;
    }
    setAppliedCoupon(code.toUpperCase());
    setCouponMessage("Coupon codes are confirmed when you book, if this event supports them.");
  }

  async function handleBookTicket() {
    if (!lines.length) return;

    if (isPaymentOpen) {
      setIsPaymentOpen(false);
      return;
    }

    if (!getAuthToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setIsPaymentOpen(true);
    setPaymentClientSecret(null);
    setPaymentError("");

    if (!stripePromise) {
      setPaymentError("Add your Stripe publishable and secret keys to enable checkout.");
      return;
    }

    try {
      const result = await startBooking({
        offers: lines.map((line) => ({
          offer_id: line.option.offerId,
          qty: line.qty,
        })),
      }).unwrap();

      const clientSecret = result.data?.payment?.client_secret;
      if (!clientSecret) {
        throw new Error("Unable to start payment.");
      }

      const paidAmount = Number(result.data.payment.amount);
      setPaidTotalCents(Math.round((Number.isFinite(paidAmount) ? paidAmount : total) * 100));
      setPaymentClientSecret(clientSecret);
    } catch (error) {
      setPaymentError(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Unable to start booking. Please try again.",
        ),
      );
    }
  }

  function handlePaymentSuccess(paymentIntentId: string) {
    const params = new URLSearchParams({
      ticket: lines.map((line) => `${line.option.label} × ${line.qty}`).join(", "),
      reference: paymentIntentId,
    });
    router.push(`/payment/success?${params.toString()}`);
  }

  if (ticketOptions.length === 0) {
    return <p className="mt-4 text-[13px] text-black/60">No tickets available for this event.</p>;
  }

  return (
    <div className="mt-4">
      {unusedOptions.length > 0 ? (
        <SelectField
          id="event-ticket-type"
          name="ticketType"
          aria-label={lines.length ? "Add another ticket" : "Ticket type"}
          value={pickerValue}
          onChange={(changeEvent) => addOffer(changeEvent.target.value)}
          options={unusedOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          placeholder={lines.length ? "Add another ticket" : "Select ticket type"}
          className="!h-[42px] !rounded-[3px] !border-black/60 !text-[13px]"
        />
      ) : null}

      {lines.length > 0 ? (
        <ul className="mt-3 divide-y divide-black/15 border border-black/20">
          {lines.map((line) => {
            const maxQty = maxOfferQuantity(line.option);
            const lineTotal = line.option.amount * line.qty;
            return (
              <li key={line.option.offerId} className="flex items-center gap-3 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-5">{line.option.ticketName}</p>
                  <p className="text-[12px] text-black/55">
                    {line.option.offerName} · {formatMoney(line.option.amount, line.option.currency)} each
                  </p>
                </div>
                <QuantityStepper
                  value={line.qty}
                  max={maxQty}
                  disabled={startBookingState.isLoading}
                  onChange={(qty) => updateQty(line.option.offerId, qty)}
                />
                <p className="w-[72px] text-right text-[13px] font-medium">
                  {formatMoney(lineTotal, line.option.currency)}
                </p>
                <button
                  type="button"
                  aria-label={`Remove ${line.option.label}`}
                  onClick={() => removeLine(line.option.offerId)}
                  className="cursor-pointer text-[18px] leading-none text-black/40 hover:text-black"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {lines.length > 0 ? (
        <>
          <div className="mt-4 flex gap-2">
            <InputField
              aria-label="Discount coupon"
              name="coupon"
              value={couponInput}
              onChange={(event) => {
                setCouponInput(event.target.value);
                setCouponMessage("");
              }}
              placeholder="Discount coupon"
              density="compact"
              className="!px-3 !text-[13px]"
              containerClassName="!h-[42px] !rounded-[3px] !border-black/60"
              wrapperClassName="min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="h-[42px] shrink-0 cursor-pointer border border-black bg-white px-4 text-[11px] font-medium uppercase text-black transition hover:bg-black hover:text-white"
            >
              Apply
            </button>
          </div>
          {couponMessage ? (
            <p className="mt-1.5 text-[12px] text-black/55">
              {appliedCoupon ? `${appliedCoupon}: ` : null}
              {couponMessage}
            </p>
          ) : null}

          <dl className="mt-4 space-y-1.5 border-t border-black/30 pt-3 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-black/65">
                Tickets ({totalQty})
              </dt>
              <dd>{formatMoney(subtotal, currency)}</dd>
            </div>
            {appliedCoupon ? (
              <div className="flex justify-between gap-4">
                <dt className="text-black/65">Discount</dt>
                <dd>{formatMoney(discount, currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-black/65">
                Platform fee{feeRate > 0 ? ` (${feeRate}%)` : ""}
              </dt>
              <dd>{formatMoney(platformFee, currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-black/20 pt-2 font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(total, currency)}</dd>
            </div>
            {feeRate > 0 ? (
              <p className="pt-1 text-[11px] leading-4 text-black/45">
                Platform fee is included in the ticket price.
              </p>
            ) : null}
          </dl>
        </>
      ) : null}

      {isPaymentOpen ? (
        <div className="mt-2">
          {startBookingState.isLoading ? (
            <p role="status" className="border-y border-black/20 py-4 text-center text-[13px] text-black/60">
              Preparing secure checkout...
            </p>
          ) : paymentError ? (
            <p role="alert" className="border-y border-[#d92d20]/40 py-4 text-[13px] leading-5 text-[#b42318]">
              {paymentError}
            </p>
          ) : paymentClientSecret && stripePromise ? (
            <Elements
              key={paymentClientSecret}
              stripe={stripePromise}
              options={{
                clientSecret: paymentClientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#000000", borderRadius: "3px" },
                },
              }}
            >
              <PaymentForm
                clientSecret={paymentClientSecret}
                eventTitle={event.name}
                amount={paidTotalCents}
                summaryLines={lines.map((line) => ({
                  label: `${line.option.ticketName} · ${line.option.offerName}`,
                  qty: line.qty,
                }))}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!lines.length || startBookingState.isLoading}
        onClick={() => void handleBookTicket()}
        className="mt-4 h-[44px] w-full rounded-[3px] bg-black text-[12px] font-medium uppercase text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/35"
      >
        {isPaymentOpen ? "Close payment" : "Book ticket"}
      </button>
    </div>
  );
}
