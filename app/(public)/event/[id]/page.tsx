"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import eventCover from "@/assets/event-cover.jpg";
import homeHeroImage from "@/assets/home-hero.jpg";
import yourlistLogo from "@/assets/yourlist-logo.png";
import signupImage from "@/assets/signup-image.png";
import { SelectField } from "@/components/ui/SelectField";
import { PaymentForm } from "./PaymentForm";

const galleryImages = [homeHeroImage, eventCover, signupImage];
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [ticketType, setTicketType] = useState<"" | "general" | "vip">("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const ticketAmount = ticketType === "vip" ? 18000 : 6500;

  async function handleBookTicket() {
    if (!ticketType) return;

    if (isPaymentOpen) {
      setIsPaymentOpen(false);
      return;
    }

    setIsPaymentOpen(true);
    setPaymentClientSecret(null);
    setPaymentError("");
    setBookingMessage("");

    if (!stripePromise) {
      setPaymentError("Add your Stripe publishable and secret keys to enable checkout.");
      return;
    }

    setIsCreatingPayment(true);
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, ticketType }),
      });
      const result: { clientSecret?: unknown; error?: unknown } = await response.json();

      if (!response.ok || typeof result.clientSecret !== "string") {
        throw new Error(typeof result.error === "string" ? result.error : "Unable to start payment.");
      }

      setPaymentClientSecret(result.clientSecret);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to start payment. Please try again.");
    } finally {
      setIsCreatingPayment(false);
    }
  }

  function handlePaymentSuccess(paymentIntentId: string) {
    const params = new URLSearchParams({
      ticket: ticketType,
      reference: paymentIntentId,
    });
    router.push(`/payment/success?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="relative flex h-[44px] items-center justify-between border-b border-black/80 px-5 md:px-8">
        <Link href="/" className="text-[11px] font-medium uppercase hover:opacity-60">Events</Link>
        <Link href="/" aria-label="Yourlist home" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image src={yourlistLogo} alt="Yourlist" priority className="h-auto w-[76px]" />
        </Link>
        <Link href="/login" className="ml-auto text-[11px] font-medium uppercase hover:opacity-60">Login</Link>
      </header>

      <nav aria-label="Breadcrumb" className="flex h-[34px] items-center border-b border-black/70 px-5 text-[10px] uppercase text-black/70 md:px-8">
        <Link href="/" className="hover:text-black">Events</Link>
        <span className="mx-2">/</span>
        <span>Venue</span>
        <span className="mx-2">/</span>
        <span className="truncate text-black">The Closing Party</span>
      </nav>

      <div className="grid lg:grid-cols-2">
        <section aria-label="Event photos" className="relative h-[62svh] min-h-[390px] overflow-hidden bg-black lg:sticky lg:top-0 lg:h-[calc(100svh-78px)] lg:min-h-[540px]">
          <div className={`event-gallery-track ${isPlaying ? "" : "event-gallery-paused"}`}>
            {[...galleryImages, ...galleryImages].map((image, index) => (
              <div key={`${index}-${image.src}`} className="relative h-[62svh] min-h-[390px] w-full lg:h-[78svh] lg:min-h-[540px]">
                <Image
                  src={image}
                  alt={`The Closing Party event photo ${index % galleryImages.length + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            onClick={() => setIsFavorite((favorite) => !favorite)}
            className="absolute right-5 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true">
              <path d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause photo carousel" : "Play photo carousel"}
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying((playing) => !playing)}
            className="absolute bottom-4 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black transition hover:bg-white"
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 2h3v10H3zM8 2h3v10H8z" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="m4 2 8 5-8 5V2Z" /></svg>
            )}
          </button>
        </section>

        <section className="flex min-h-[660px] flex-col px-6 py-10 sm:px-10 lg:min-h-[calc(100svh-78px)] lg:px-[min(8vw,112px)] lg:py-12">
          <div className="mx-auto w-full max-w-[540px]">
            <div className="text-center">
              <h1 className="text-[23px] font-bold uppercase leading-[28px]">The Closing Party</h1>
              <p className="mt-2 text-[12px] uppercase text-black/60">Organised by</p>
              <div className="mt-1 flex items-center justify-center gap-2 text-[13px] font-bold uppercase">
                <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-black text-[10px]">H</span>
                Hednesford Town
              </div>
            </div>

            <div className="mt-7 flex justify-between gap-4 border-t border-black/50 pt-3 text-[12px]">
              <p><strong>Date:</strong> Saturday, 18 January 2026</p>
              <p className="shrink-0"><strong>Time:</strong> 7:30 PM IST</p>
            </div>
            <p className="mt-3 text-[12px]"><strong>Price:</strong> £65–£180</p>

            <SelectField
              id="event-ticket-type"
              name="ticketType"
              aria-label="Ticket type"
              value={ticketType}
              onChange={(event) => {
                setTicketType(event.target.value as "" | "general" | "vip");
                setIsPaymentOpen(false);
                setPaymentClientSecret(null);
                setPaymentError("");
                setBookingMessage("");
              }}
              options={[
                { value: "general", label: "General admission - £65" },
                { value: "vip", label: "VIP - £180" },
              ]}
              placeholder="Select ticket type"
              containerClassName="mt-4"
              className="!h-[42px] !rounded-[3px] !border-black/60 !px-3 !text-[13px]"
            />
            {isPaymentOpen ? (
              <div className="mt-2">
                {isCreatingPayment ? (
                  <p role="status" className="border-y border-black/20 py-4 text-center text-[13px] text-black/60">Preparing secure checkout...</p>
                ) : paymentError ? (
                  <p role="alert" className="border-y border-[#d92d20]/40 py-4 text-[13px] leading-5 text-[#b42318]">{paymentError}</p>
                ) : paymentClientSecret && stripePromise ? (
                  <Elements
                    key={paymentClientSecret}
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentClientSecret,
                      appearance: { theme: "stripe", variables: { colorPrimary: "#000000", borderRadius: "3px" } },
                    }}
                  >
                    <PaymentForm
                      clientSecret={paymentClientSecret}
                      eventTitle="The Closing Party"
                      ticketType={ticketType === "vip" ? "vip" : "general"}
                      amount={ticketAmount}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              disabled={!ticketType}
              onClick={handleBookTicket}
              className="mt-4 h-[44px] w-full rounded-[3px] bg-black text-[12px] font-medium uppercase text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/35"
            >
              {isPaymentOpen ? "Close payment" : "Book ticket"}
            </button>
            {bookingMessage ? <p role="status" className="mt-2 text-center text-[12px] text-[#16834a]">{bookingMessage}</p> : null}

            <section aria-labelledby="event-information-title" className="mt-7">
              <h2 id="event-information-title" className="text-[13px] font-bold">Event information</h2>
              <dl className="mt-2 space-y-1 text-[11px] uppercase leading-[17px]">
                <div><dt className="inline font-bold">Event type: </dt><dd className="inline">Live music / party</dd></div>
                <div><dt className="inline font-bold">Event starts: </dt><dd className="inline">7:30 PM</dd></div>
                <div><dt className="inline font-bold">Venue: </dt><dd className="inline">Keys Corner</dd></div>
                <div><dt className="inline font-bold">Location: </dt><dd className="inline">Hednesford, Staffordshire</dd></div>
              </dl>
            </section>

            <details className="mt-6 border-y border-black/40 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase">
                About the event
                <span aria-hidden="true">⌄</span>
              </summary>
              <p className="pt-3 text-[13px] leading-5 text-black/70">Join us for a night of live music, dancing, and celebration at The Closing Party.</p>
            </details>
            <details className="border-b border-black/40 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase">
                Terms &amp; conditions
                <span aria-hidden="true">⌄</span>
              </summary>
              <p className="pt-3 text-[13px] leading-5 text-black/70">Tickets are subject to availability. Entry is subject to venue terms and age restrictions.</p>
            </details>
          </div>

          <p className="mt-auto pt-12 text-center text-[11px] leading-[17px] text-black/45">You can pay securely with credit card (VISA,<br className="hidden sm:block" /> Mastercard, American Express)</p>
          <span className="sr-only">Event reference {id}</span>
        </section>
      </div>
    </main>
  );
}