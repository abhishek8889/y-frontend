import Image from "next/image";
import Link from "next/link";
import yourlistLogo from "@/assets/yourlist-logo.png";
import { SiteFooter } from "@/components/public/SiteFooter";

type SuccessPageProps = {
  searchParams: Promise<{
    ticket?: string | string[];
    reference?: string | string[];
  }>;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const ticketType = query.ticket === "vip" ? "VIP" : "General admission";
  const ticketAmount = query.ticket === "vip" ? 18000 : 6500;
  const reference = typeof query.reference === "string" ? query.reference : "";
  const ticketId = /^pi_[a-zA-Z0-9]+$/.test(reference) ? reference : "Confirmed";

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="relative flex h-[44px] shrink-0 items-center justify-center border-b border-black/70 px-5">
        <Link href="/" aria-label="Yourlist home" className="inline-flex">
          <Image src={yourlistLogo} alt="Yourlist" priority className="h-auto w-[76px]" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
        <section aria-labelledby="payment-success-title" className="w-full max-w-[760px]">
          <div className="flex flex-col items-center text-center">
            <svg
              aria-hidden="true"
              className="h-[64px] w-[64px]"
              viewBox="0 0 64 64"
              fill="none"
            >
              <circle cx="29" cy="35" r="25" stroke="currentColor" strokeWidth="4" strokeDasharray="145 14" transform="rotate(-45 29 35)" />
              <path d="m19 32 8 8 26-27" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 id="payment-success-title" className="mt-3 text-[18px] font-bold uppercase leading-6">
              Payment successful!
            </h1>
            <p className="mt-3 text-[13px] leading-5">
              Your ticket has been successfully booked.
              <br />
              Your payment confirmation and booking details are shown below.
            </p>
            <h2 className="mt-5 text-[16px] font-bold uppercase leading-5">The Closing Party</h2>
          </div>

          <section aria-labelledby="event-details-title" className="mt-5 border border-black/55 px-5 py-4 sm:px-7">
            <h3 id="event-details-title" className="text-[13px] font-bold uppercase leading-5">Event details</h3>
            <dl className="mt-2 grid gap-x-8 gap-y-1 text-[12px] leading-[18px] sm:grid-cols-2">
              <div><dt className="inline font-bold">Date: </dt><dd className="inline">Saturday, 18 January 2026</dd></div>
              <div><dt className="inline font-bold">Ticket type: </dt><dd className="inline">{ticketType}</dd></div>
              <div><dt className="inline font-bold">Time: </dt><dd className="inline">7:30 PM IST</dd></div>
              <div><dt className="inline font-bold">Quantity: </dt><dd className="inline">1</dd></div>
              <div><dt className="inline font-bold">Event type: </dt><dd className="inline">Live music / party</dd></div>
              <div><dt className="inline font-bold">Seat: </dt><dd className="inline">Allocated on arrival</dd></div>
              <div><dt className="inline font-bold">Venue: </dt><dd className="inline">Keys Corner</dd></div>
              <div><dt className="inline font-bold">Ticket ID: </dt><dd className="inline break-all">{ticketId}</dd></div>
              <div><dt className="inline font-bold">Location: </dt><dd className="inline">Hednesford, Staffordshire</dd></div>
              <div><dt className="inline font-bold">Organised by: </dt><dd className="inline">Hednesford Town</dd></div>
            </dl>
          </section>

          <section aria-labelledby="price-summary-title" className="mt-3 border border-black/55 px-5 py-4 sm:px-7">
            <h3 id="price-summary-title" className="text-[13px] font-bold uppercase leading-5">Price summary</h3>
            <dl className="mt-2 space-y-1 text-[12px] leading-[18px]">
              <div><dt className="inline font-bold">Tickets (1 × {formatAmount(ticketAmount)}): </dt><dd className="inline">{formatAmount(ticketAmount)}</dd></div>
              <div><dt className="inline font-bold">Total amount: </dt><dd className="inline font-bold">{formatAmount(ticketAmount)}</dd></div>
            </dl>
          </section>

          <Link
            href="/"
            className="mx-auto mt-6 flex min-h-[44px] w-full max-w-[390px] items-center justify-center rounded-[3px] bg-black px-5 text-center text-[12px] font-medium uppercase text-white transition hover:bg-black/80"
          >
            Explore more events
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
