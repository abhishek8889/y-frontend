"use client";

import { useState } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
type PaymentFormProps = {
  clientSecret: string;
  eventTitle: string;
  amount: number;
  summaryLines?: { label: string; qty: number }[];
  onSuccess: (paymentIntentId: string) => void;
};

const fieldLabelClass = "block text-[13px] font-bold normal-case leading-5 text-black";
const fieldBoxClass =
  "mt-1.5 flex h-[44px] items-center overflow-hidden border border-black/45 px-3 focus-within:border-black";

const stripeFieldOptions = {
  style: {
    base: {
      color: "#111111",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      "::placeholder": { color: "#777777" },
    },
    invalid: { color: "#d92d20" },
  },
};

export function PaymentForm({
  clientSecret,
  eventTitle,
  amount,
  summaryLines = [],
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount / 100);

  async function handleCardPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    setIsSubmitting(true);
    setErrorMessage("");
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: { name: cardholderName },
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Your payment could not be completed.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
      return;
    }

    setErrorMessage("Your payment is still processing. Check back shortly.");
    setIsSubmitting(false);
  }

  async function handleExpressCheckout() {
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Your payment could not be completed.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
      return;
    }

    setErrorMessage("Your payment is still processing. Check back shortly.");
    setIsSubmitting(false);
  }

  return (
    <section aria-labelledby="payment-title" className="mt-5 border-t border-black/20 pt-5">
      <h2 id="payment-title" className="text-center text-[20px] font-bold uppercase leading-7 text-black">Payment</h2>

      <div className="mt-5 min-h-[44px]">
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckout}
          options={{ buttonType: { applePay: "buy" } }}
        />
      </div>

      <div className="my-5 flex items-center gap-4 text-[12px] font-bold uppercase text-black/70">
        <span className="h-px flex-1 bg-black/20" />
        <span>Or pay with card</span>
        <span className="h-px flex-1 bg-black/20" />
      </div>

      <form onSubmit={handleCardPayment} className="flex flex-col gap-4">
        <label className={fieldLabelClass}>
          Card Information
          <span className={fieldBoxClass}>
            <CardNumberElement
              options={{ ...stripeFieldOptions, showIcon: true, disableLink: true }}
              className="min-w-0 w-full"
            />
          </span>
        </label>

        <label className={fieldLabelClass} htmlFor="cardholderName">
          Cardholder Name
          <span className={fieldBoxClass}>
            <input
              id="cardholderName"
              name="cardholderName"
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              placeholder="Full name on card"
              autoComplete="cc-name"
              className="h-full w-full border-0 bg-transparent text-[14px] font-normal normal-case text-black outline-none placeholder:text-[#777777]"
            />
          </span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={fieldLabelClass}>
            Expiry Date
            <span className={fieldBoxClass}>
              <CardExpiryElement options={stripeFieldOptions} className="min-w-0 w-full" />
            </span>
          </label>
          <label className={fieldLabelClass}>
            CVC
            <span className={fieldBoxClass}>
              <CardCvcElement options={stripeFieldOptions} className="min-w-0 w-full" />
            </span>
          </label>
        </div>

        <div className="pt-1 text-[13px] leading-5 text-black">
          <p className="font-bold">Total Amount: {formattedAmount}</p>
          {summaryLines.length ? (
            summaryLines.map((line) => (
              <p key={line.label}>
                {line.qty} × {line.label}
              </p>
            ))
          ) : (
            <p>{eventTitle}</p>
          )}
        </div>

        {errorMessage ? <p role="alert" className="text-[13px] leading-5 text-[#d92d20]">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting || !cardholderName.trim()}
          className="h-[48px] w-full border border-black bg-black text-[14px] font-medium uppercase text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Processing payment..." : `Pay ${formattedAmount}`}
        </button>
      </form>
    </section>
  );
}
