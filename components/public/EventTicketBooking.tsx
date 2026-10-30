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
import { SideDrawer } from "@/components/common";
import { SelectField } from "@/components/ui/SelectField";
import { InputField } from "@/components/ui/InputField";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getAuthToken } from "@/lib/api/token";
import { PublicLoginModal } from "@/components/public/PublicLoginModal";
import {
  buildTicketSelectOptions,
  estimateCheckoutPricing,
  formatFeePercent,
  formatMoney,
  getEventPlatformFeeRate,
  maxOfferQuantity,
  parseMoney,
  type CheckoutPriceQuote,
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

function PaymentDrawerLogo() {
  return (
    <div className="side-drawer-logo" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
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
  const [ticketMenuOpen, setTicketMenuOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [paidTotalCents, setPaidTotalCents] = useState(0);
  const [orderUniqueId, setOrderUniqueId] = useState<string | null>(null);
  const [confirmedQuote, setConfirmedQuote] = useState<CheckoutPriceQuote | null>(null);

  const [startBooking, startBookingState] = useStartBookingTicketMutation();

  const unusedOptions = useMemo(
    () =>
      ticketOptions.filter(
        (option) => !lines.some((line) => line.option.offerId === option.offerId),
      ),
    [ticketOptions, lines],
  );

  const estimatedQuote = useMemo(
    () =>
      estimateCheckoutPricing(
        lines.map((line) => ({ amount: line.option.amount, qty: line.qty })),
        feeRate,
        currency,
      ),
    [lines, feeRate, currency],
  );
  const quote = confirmedQuote ?? estimatedQuote;
  const feeLabel = formatFeePercent(feeRate);
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
    setOrderUniqueId(null);
    setConfirmedQuote(null);
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
    setOrderUniqueId(null);
    setConfirmedQuote(null);
  }

  function removeLine(offerId: number) {
    setLines((current) => current.filter((line) => line.option.offerId !== offerId));
    setIsPaymentOpen(false);
    setPaymentClientSecret(null);
    setOrderUniqueId(null);
    setConfirmedQuote(null);
  }

  function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponMessage("Enter a coupon code.");
      setAppliedCoupon("");
      return;
    }
    setAppliedCoupon(code.toUpperCase());
    setCouponMessage("The coupon is checked when you book. A discount appears only if it applies.");
    setIsPaymentOpen(false);
    setPaymentClientSecret(null);
    setOrderUniqueId(null);
    setConfirmedQuote(null);
  }

  async function beginCheckout() {
    setIsPaymentOpen(true);
    setPaymentClientSecret(null);
    setPaymentError("");
    setConfirmedQuote(null);

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

      const nextOrderId = result.data?.order?.unique_id?.trim();
      const clientSecret = result.data?.payment?.client_secret;
      if (!nextOrderId || !clientSecret) {
        throw new Error("Unable to start payment.");
      }

      const order = result.data.order;
      const charge =
        parseMoney(result.data.payment.amount) ?? parseMoney(order.total_amount);
      if (charge === null) {
        throw new Error("Unable to start payment.");
      }

      const subtotal = parseMoney(order.subtotal) ?? 0;
      const discount = parseMoney(order.discount_amount) ?? 0;
      const platformFee = parseMoney(order.platform_fee_amount) ?? 0;
      setConfirmedQuote({
        subtotal,
        discount,
        discountedSubtotal: Math.round((subtotal - discount) * 100) / 100,
        platformFee,
        total: charge,
        currency: order.currency?.trim() || currency,
      });
      if (appliedCoupon && discount <= 0) {
        setCouponMessage("This coupon could not be applied.");
      } else if (discount > 0) {
        setCouponMessage("");
      }

      setOrderUniqueId(nextOrderId);
      setPaidTotalCents(Math.round(charge * 100));
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

  async function handleBookTicket() {
    if (!lines.length) return;

    if (!getAuthToken()) {
      setIsLoginOpen(true);
      return;
    }

    await beginCheckout();
  }

  function closePayment() {
    setIsPaymentOpen(false);
  }

  function handleLoginSuccess() {
    setIsLoginOpen(false);
    void beginCheckout();
  }

  function handlePaymentSuccess() {
    if (!orderUniqueId) {
      setPaymentError("Payment succeeded, but the order reference is missing.");
      return;
    }

    router.push(`/payment/success?order=${encodeURIComponent(orderUniqueId)}`);
  }

  if (ticketOptions.length === 0) {
    return <p className="mt-4 text-[13px] text-black/60">No tickets available for this event.</p>;
  }

  return (
    <div className="mt-4">
      {ticketMenuOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/28" aria-hidden="true" />
      ) : null}
      {unusedOptions.length > 0 ? (
        <div className={ticketMenuOpen ? "relative z-[70]" : undefined}>
          <SelectField
            id="event-ticket-type"
            name="ticketType"
            aria-label={lines.length ? "Add another ticket" : "Ticket type"}
            value={pickerValue}
            onChange={(changeEvent) => addOffer(changeEvent.target.value)}
            onOpenChange={setTicketMenuOpen}
            options={unusedOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            placeholder={lines.length ? "Add another ticket" : "Select ticket type"}
            className="!h-[42px] !rounded-[3px] !border-black/60 !text-[13px]"
          />
        </div>
      ) : null}

      {lines.length > 0 ? (
        <ul className="mt-3 divide-y divide-black/15 border border-black/20">
          {lines.map((line) => {
            const maxQty = maxOfferQuantity(line.option);
            const lineTotal = line.option.amount * line.qty;
            return (
              <li key={line.option.offerId} className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-5">{line.option.ticketName}</p>
                  <p className="text-[12px] text-black/55">
                    {line.option.offerName} · {formatMoney(line.option.amount, line.option.currency)} each
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:contents">
                  <QuantityStepper
                    value={line.qty}
                    max={maxQty}
                    disabled={startBookingState.isLoading}
                    onChange={(qty) => updateQty(line.option.offerId, qty)}
                  />
                  <p className="min-w-[4.5rem] flex-1 text-right text-[13px] font-medium sm:w-[72px] sm:flex-none">
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
                </div>
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
              <dt className="text-black/65">Tickets ({totalQty})</dt>
              <dd>{formatMoney(quote.subtotal, quote.currency)}</dd>
            </div>
            {quote.discount > 0 ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-black/65">Discount</dt>
                  <dd>{formatMoney(quote.discount, quote.currency)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-black/65">Discounted subtotal</dt>
                  <dd>{formatMoney(quote.discountedSubtotal, quote.currency)}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-black/65">
                Platform fee{feeLabel ? ` (${feeLabel}%)` : ""}
              </dt>
              <dd>{formatMoney(quote.platformFee, quote.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-black/20 pt-2 font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(quote.total, quote.currency)}</dd>
            </div>
            {confirmedQuote ? null : (
              <p className="pt-1 text-[11px] leading-4 text-black/45">
                Estimated total. The final amount is confirmed when you book.
              </p>
            )}
          </dl>
        </>
      ) : null}

      <button
        type="button"
        disabled={!lines.length || startBookingState.isLoading}
        onClick={() => void handleBookTicket()}
        className="mt-4 form-footer-btn form-footer-btn-primary"
      >
        {startBookingState.isLoading ? "Preparing checkout..." : "Book ticket"}
      </button>

      <SideDrawer
        isOpen={isPaymentOpen}
        onClose={closePayment}
        title="Payment"
        subtitle={event.name}
        logo={<PaymentDrawerLogo />}
        showFooter
        showSubmitButton={false}
        cancelLabel="Close payment"
        onCancel={closePayment}
        isSubmitting={startBookingState.isLoading}
      >
        {startBookingState.isLoading ? (
          <p role="status" className="payment-form__status">
            Preparing secure checkout...
          </p>
        ) : paymentError ? (
          <p role="alert" className="payment-form__error">
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
                variables: {
                  colorPrimary: "#000000",
                  borderRadius: "4px",
                  fontFamily: "Univers, Arial, sans-serif",
                },
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
        ) : (
          <p role="status" className="payment-form__status">
            Preparing secure checkout...
          </p>
        )}
      </SideDrawer>

      <PublicLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
