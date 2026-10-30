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
  onClose?: () => void;
  showCloseButton?: boolean;
};

const stripeFieldOptions = {
  style: {
    base: {
      color: "#000000",
      fontFamily: "Univers, Arial, sans-serif",
      fontSize: "14px",
      "::placeholder": { color: "rgba(0, 0, 0, 0.4)" },
    },
    invalid: { color: "#b42318" },
  },
};

export function PaymentForm({
  clientSecret,
  eventTitle,
  amount,
  summaryLines = [],
  onSuccess,
  onClose,
  showCloseButton = false,
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
    <div className="payment-form">
      <div className="payment-form__express">
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckout}
          options={{ buttonType: { applePay: "buy" } }}
        />
      </div>

      <div className="payment-form__divider" role="presentation">
        Or pay with card
      </div>

      <form onSubmit={handleCardPayment} className="payment-form__fields">
        <label className="payment-form__label">
          Card information
          <span className="payment-form__field">
            <CardNumberElement
              options={{ ...stripeFieldOptions, showIcon: true, disableLink: true }}
              className="payment-form__field-el"
            />
          </span>
        </label>

        <label className="payment-form__label" htmlFor="cardholderName">
          Cardholder name
          <span className="payment-form__field">
            <input
              id="cardholderName"
              name="cardholderName"
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              placeholder="Full name on card"
              autoComplete="cc-name"
              className="payment-form__input"
            />
          </span>
        </label>

        <div className="payment-form__row">
          <label className="payment-form__label">
            Expiry date
            <span className="payment-form__field">
              <CardExpiryElement options={stripeFieldOptions} className="payment-form__field-el" />
            </span>
          </label>
          <label className="payment-form__label">
            CVC
            <span className="payment-form__field">
              <CardCvcElement options={stripeFieldOptions} className="payment-form__field-el" />
            </span>
          </label>
        </div>

        <div className="payment-form__summary">
          <p className="payment-form__summary-total">Total amount: {formattedAmount}</p>
          {summaryLines.length ? (
            summaryLines.map((line) => (
              <p key={line.label} className="payment-form__summary-line">
                {line.qty} × {line.label}
              </p>
            ))
          ) : (
            <p className="payment-form__summary-line">{eventTitle}</p>
          )}
        </div>

        {errorMessage ? (
          <p role="alert" className="payment-form__error">
            {errorMessage}
          </p>
        ) : null}

        <div className="payment-form__actions">
          <button
            type="submit"
            disabled={!stripe || !elements || isSubmitting || !cardholderName.trim()}
            className="form-footer-btn form-footer-btn-primary"
          >
            {isSubmitting ? "Processing payment..." : `Pay ${formattedAmount}`}
          </button>

          {showCloseButton && onClose ? (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="form-footer-btn form-footer-btn-secondary"
            >
              Close payment
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
