"use client";

import Image from "next/image";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";

export type StripeConnectModalVariant =
  | "connect"
  | "incomplete"
  | "success"
  | "failed";

type StripeConnectModalProps = {
  open?: boolean;
  variant?: StripeConnectModalVariant;
  onConnect?: () => void;
  onClose?: () => void;
  onPrimary?: () => void;
  /** Disables the primary CTA while a Stripe request is in flight. */
  isBusy?: boolean;
};

const copy: Record<
  StripeConnectModalVariant,
  {
    titleId: string;
    title: string;
    paragraphs: string[];
    primaryLabel: string;
    busyLabel: string;
    footnote: string;
    showClose: boolean;
  }
> = {
  connect: {
    titleId: "stripe-connect-title",
    title: "Connect your stripe account",
    paragraphs: [
      "To start selling tickets and receive payments for your events, you need to connect your Stripe account to Y.",
      "This securely connects your business to Stripe and allows Y to process customer payments and manage your event payouts.",
    ],
    primaryLabel: "Connect stripe account",
    busyLabel: "Connecting...",
    footnote: "You'll be redirected to Stripe to complete your\nbusiness and payment setup.",
    showClose: false,
  },
  incomplete: {
    titleId: "stripe-incomplete-title",
    title: "Complete your stripe onboarding",
    paragraphs: [
      "Your Stripe onboarding is not completed yet.",
      "Finish setting up your connected account so you can sell tickets, receive payments, and manage payouts for your events.",
    ],
    primaryLabel: "Complete onboarding",
    busyLabel: "Opening Stripe...",
    footnote: "You'll be redirected to Stripe to finish your account setup.",
    showClose: false,
  },
  success: {
    titleId: "stripe-success-title",
    title: "Stripe account connected",
    paragraphs: [
      "Your Stripe account has been successfully connected.",
      "You can now sell tickets, receive customer payments, and manage payouts for your events.",
    ],
    primaryLabel: "Go to dashboard",
    busyLabel: "Go to dashboard",
    footnote: "Your account is ready to receive payments.",
    showClose: true,
  },
  failed: {
    titleId: "stripe-failed-title",
    title: "Stripe connection failed",
    paragraphs: [
      "We couldn’t connect your Stripe account.",
      "Something went wrong while completing your Stripe setup. Please try again to connect your account.",
    ],
    primaryLabel: "Try again",
    busyLabel: "Connecting...",
    footnote: "No payment setup has been completed yet.",
    showClose: true,
  },
};

function StripeWordmark() {
  return (
    <Image
      src="/organiser/stripe-logo.png"
      alt="Stripe"
      width={112}
      height={47}
      className="organiser-modal__brand"
      priority
    />
  );
}

function StatusMark({ variant }: { variant: StripeConnectModalVariant }) {
  if (variant === "success") {
    return (
      <Image
        src="/organiser/stripe-success-check.png"
        alt=""
        width={80}
        height={80}
        className="organiser-modal__status organiser-modal__status--success"
        aria-hidden
      />
    );
  }

  if (variant === "failed" || variant === "incomplete") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/organiser/stripe-fail-warning.svg"
        alt=""
        width={89}
        height={89}
        className="organiser-modal__status organiser-modal__status--warning"
        aria-hidden
      />
    );
  }

  return null;
}

/**
 * Stripe Connect / incomplete / success / failed modals for the organiser dashboard.
 * Uses shared `OrganiserModal` chrome; only inner content changes by `variant`.
 */
export function StripeConnectModal({
  open = true,
  variant = "connect",
  onConnect,
  onClose,
  onPrimary,
  isBusy = false,
}: StripeConnectModalProps) {
  const content = copy[variant];
  const handlePrimary = onPrimary ?? onConnect;
  const primaryLabel = isBusy ? content.busyLabel : content.primaryLabel;

  return (
    <OrganiserModal
      open={open}
      titleId={content.titleId}
      showClose={content.showClose && !isBusy}
      onClose={isBusy ? undefined : onClose}
    >
      <div className="organiser-modal__body">
        <StripeWordmark />
        <StatusMark variant={variant} />

        <h2 id={content.titleId} className="organiser-modal__title">
          {content.title}
        </h2>

        <div className="organiser-modal__copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={handlePrimary}
          className="organiser-modal__cta"
        >
          {primaryLabel}
        </button>

        <p className="organiser-modal__footnote">{content.footnote}</p>
      </div>
    </OrganiserModal>
  );
}
