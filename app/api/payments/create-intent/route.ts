import Stripe from "stripe";

type PublicTicketLookup = {
  success?: unknown;
  message?: unknown;
  data?: unknown;
};

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!secretKey) {
    return Response.json({ error: "Stripe payments are not configured yet." }, { status: 503 });
  }

  if (!apiBaseUrl) {
    return Response.json({ error: "The ticket API is not configured." }, { status: 503 });
  }

  let body: { eventId?: unknown; ticketId?: unknown; offerId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payment request." }, { status: 400 });
  }

  const { eventId, ticketId, offerId } = body;
  if (
    typeof eventId !== "string" ||
    eventId.length === 0 ||
    eventId.length > 128 ||
    typeof ticketId !== "string" ||
    ticketId.length === 0 ||
    ticketId.length > 128 ||
    (offerId !== undefined && (typeof offerId !== "string" || offerId.length > 128))
  ) {
    return Response.json({ error: "Choose a valid ticket type." }, { status: 400 });
  }

  let ticketLookupResponse: Response;
  try {
    ticketLookupResponse = await fetch(
      `${apiBaseUrl}/public/events/tickets/${encodeURIComponent(eventId)}`,
      {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      },
    );
  } catch {
    return Response.json({ error: "Unable to verify ticket availability." }, { status: 502 });
  }

  let ticketLookup: PublicTicketLookup;
  try {
    ticketLookup = await ticketLookupResponse.json();
  } catch {
    return Response.json({ error: "The ticket service returned an invalid response." }, { status: 502 });
  }

  if (!ticketLookupResponse.ok || ticketLookup.success !== true || !Array.isArray(ticketLookup.data)) {
    const message =
      typeof ticketLookup.message === "string" && ticketLookup.message.trim()
        ? ticketLookup.message
        : "Unable to verify ticket availability.";
    return Response.json({ error: message }, { status: 502 });
  }

  const tickets = ticketLookup.data as Array<{
    unique_id?: unknown;
    name?: unknown;
    base_price?: unknown;
    currency?: unknown;
    status?: unknown;
    offers?: Array<{
      unique_id?: unknown;
      name?: unknown;
      price?: unknown;
      remaining_quantity?: unknown;
      access?: unknown;
      status?: unknown;
      sale_starts_at?: unknown;
      sale_ends_at?: unknown;
    }>;
  }>;
  const ticket = tickets.find((item) => item.unique_id === ticketId);

  if (!ticket || ticket.status !== "active") {
    return Response.json({ error: "This ticket is no longer available." }, { status: 400 });
  }

  let selectedPrice = ticket.base_price;
  let selectedName = typeof ticket.name === "string" ? ticket.name : "Ticket";
  let selectedOfferId: string | undefined;

  if (offerId !== undefined) {
    const offer = ticket.offers?.find((item) => item.unique_id === offerId);
    const now = Date.now();
    const saleStartsAt =
      typeof offer?.sale_starts_at === "string" ? Date.parse(offer.sale_starts_at) : null;
    const saleEndsAt =
      typeof offer?.sale_ends_at === "string" ? Date.parse(offer.sale_ends_at) : null;
    const saleWindowIsValid =
      (saleStartsAt === null || (Number.isFinite(saleStartsAt) && saleStartsAt <= now)) &&
      (saleEndsAt === null || (Number.isFinite(saleEndsAt) && saleEndsAt > now));

    if (
      !offer ||
      offer.status !== "active" ||
      offer.access !== "public" ||
      typeof offer.remaining_quantity !== "number" ||
      offer.remaining_quantity <= 0 ||
      !saleWindowIsValid
    ) {
      return Response.json({ error: "This ticket offer is no longer available." }, { status: 400 });
    }

    selectedPrice = offer.price;
    selectedName = `${selectedName} - ${typeof offer.name === "string" ? offer.name : "Offer"}`;
    selectedOfferId = offerId;
  }

  if (
    (typeof selectedPrice !== "number" && typeof selectedPrice !== "string") ||
    !Number.isFinite(Number(selectedPrice)) ||
    Number(selectedPrice) < 0 ||
    typeof ticket.currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(ticket.currency)
  ) {
    return Response.json({ error: "The selected ticket has invalid pricing." }, { status: 502 });
  }

  let currencyDigits: number;
  try {
    currencyDigits = new Intl.NumberFormat("en", {
      style: "currency",
      currency: ticket.currency,
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    return Response.json({ error: "The selected ticket has an unsupported currency." }, { status: 400 });
  }

  const amount = Math.round(Number(selectedPrice) * 10 ** currencyDigits);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return Response.json({ error: "The selected ticket has invalid pricing." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: ticket.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId,
        ticketId,
        ...(selectedOfferId ? { offerId: selectedOfferId } : {}),
        ticketName: selectedName,
      },
    });

    if (!paymentIntent.client_secret) {
      return Response.json({ error: "Unable to start payment." }, { status: 502 });
    }

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    return Response.json({ error: "Unable to start payment. Please try again." }, { status: 502 });
  }
}
