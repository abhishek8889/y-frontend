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
import { InputField } from "@/components/ui/InputField";

type PaymentFormProps = {
  clientSecret: string;
  eventTitle: string;
  ticketType: "general" | "vip";
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
};

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
  ticketType,
  amount,
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

      <form onSubmit={handleCardPayment} className="space-y-4">
        <label className="block text-[13px] font-bold text-black">
          Card Information
          <span className="mt-1.5 flex h-[44px] items-center border border-black/45 px-3 focus-within:border-black">
            <CardNumberElement options={{ ...stripeFieldOptions, showIcon: true }} className="w-full" />
          </span>
        </label>

        <InputField
          label="Cardholder Name"
          name="cardholderName"
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          placeholder="Full name on card"
          className="px-3"
          containerClassName="!h-[44px] !rounded-none !border-black/45 focus-within:!border-black"
        />

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-[13px] font-bold text-black">
            Expiry Date
            <span className="mt-1.5 flex h-[44px] items-center border border-black/45 px-3 focus-within:border-black">
              <CardExpiryElement options={stripeFieldOptions} className="w-full" />
            </span>
          </label>
          <label className="block text-[13px] font-bold text-black">
            CVC
            <span className="mt-1.5 flex h-[44px] items-center border border-black/45 px-3 focus-within:border-black">
              <CardCvcElement options={stripeFieldOptions} className="w-full" />
            </span>
          </label>
        </div>

        <div className="pt-1 text-[13px] leading-5 text-black">
          <p className="font-bold">Total Amount: {formattedAmount}</p>
          <p>1 Ticket</p>
          <p>{eventTitle} · {ticketType === "vip" ? "VIP" : "General admission"}</p>
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
