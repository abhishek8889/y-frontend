import Stripe from "stripe";

const ticketPrices: Record<string, number> = {
  general: 6500,
  vip: 18000,
};

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json({ error: "Stripe payments are not configured yet." }, { status: 503 });
  }

  let body: { ticketType?: unknown; eventId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payment request." }, { status: 400 });
  }

  const { ticketType, eventId } = body;
  if (
    typeof ticketType !== "string" ||
    !Object.hasOwn(ticketPrices, ticketType) ||
    typeof eventId !== "string" ||
    eventId.length === 0 || 
    eventId.length > 128
  ) {
    return Response.json({ error: "Choose a valid ticket type." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: ticketPrices[ticketType],
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: { eventId, ticketType },
    });

    if (!paymentIntent.client_secret) {
      return Response.json({ error: "Unable to start payment." }, { status: 502 });
    }

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    return Response.json({ error: "Unable to start payment. Please try again." }, { status: 502 });
  }
}
