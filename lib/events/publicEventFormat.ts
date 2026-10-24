import type {
  PublicEventImage,
  PublicEventListItem,
  PublicEventTicket,
} from "@/apis/public/publicEventsApi";

export function getEventBannerUrl(images?: PublicEventImage[] | null) {
  if (!images?.length) return null;
  const banner = images.find((image) => image.type === "banner") ?? images[0];
  return banner?.url?.trim() || null;
}

export type UtcDateTimeFormat = "date" | "time" | "datetime";

function timeZoneAbbreviation(date: Date, timeZone?: string) {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    hour12: true,
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  };
  const read = (locale: string) =>
    new Intl.DateTimeFormat(locale, options)
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;

  try {
    const primary = read("en-US");
    if (primary && !primary.startsWith("GMT")) return primary;
    const fallback = read("en-IN");
    if (fallback && !fallback.startsWith("GMT")) return fallback;
    return primary || fallback || "";
  } catch {
    return "";
  }
}

function formatZoned(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
  locale = "en-GB",
) {
  try {
    return new Intl.DateTimeFormat(locale, {
      ...options,
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

/** Convert a UTC timestamp into `timeZone` and render it with `format`. */
export function formatUtcDateTime(
  utcTime: string | null | undefined,
  timeZone?: string | null,
  format: UtcDateTimeFormat = "date",
) {
  if (!utcTime) return null;

  const date = new Date(utcTime);
  if (Number.isNaN(date.getTime())) return null;

  const zone = timeZone?.trim() || undefined;

  if (format === "date") {
    return formatZoned(
      date,
      { weekday: "long", day: "numeric", month: "long", year: "numeric" },
      zone,
    );
  }

  const clock = formatZoned(
    date,
    { hour: "numeric", minute: "2-digit", hour12: true },
    zone,
    "en-US",
  );

  if (format === "time") {
    const abbreviation = timeZoneAbbreviation(date, zone);
    return abbreviation ? `${clock} ${abbreviation}` : clock;
  }

  const day = formatZoned(date, { weekday: "short", day: "numeric", month: "short" }, zone);
  return `${day}, ${clock}`;
}

export function formatPublicEventDate(value: string | null | undefined, timezone?: string | null) {
  return formatUtcDateTime(value, timezone, "datetime") ?? (value?.trim() || "Date TBA");
}

export function formatPublicEventLongDate(value: string | null | undefined, timezone?: string | null) {
  return formatUtcDateTime(value, timezone, "date") ?? (value?.trim() || "Date TBA");
}

export function formatPublicEventTime(value: string | null | undefined, timezone?: string | null) {
  return formatUtcDateTime(value, timezone, "time") ?? (value?.trim() || "Time TBA");
}

export function parseMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function formatMoney(value: number | string | null | undefined, currency = "GBP") {
  const amount = parseMoney(value);
  if (amount === null) return null;

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `£${amount.toFixed(2)}`;
  }
}

export type TicketSelectOption = {
  value: string;
  label: string;
  ticketId: number;
  ticketName: string;
  offerId: number;
  offerName: string;
  amount: number;
  currency: string;
  maxPerOrder: number | null;
  remainingQuantity: number | null;
};

export function maxOfferQuantity(option: TicketSelectOption) {
  const remaining = option.remainingQuantity ?? 20;
  const perOrder = option.maxPerOrder ?? remaining;
  return Math.max(1, Math.min(remaining, perOrder, 20));
}

export type CheckoutPriceQuote = {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  platformFee: number;
  total: number;
  currency: string;
};

/**
 * Provisional checkout total before `start-booking-ticket` responds.
 * Matches the backend: fee is a percentage of the discounted line, added to the customer total.
 * The booking response replaces this estimate.
 */
export function estimateCheckoutPricing(
  lines: { amount: number; qty: number }[],
  feeRate: number,
  currency = "GBP",
): CheckoutPriceQuote {
  const rate = Number.isFinite(feeRate) && feeRate > 0 ? feeRate : 0;
  let subtotalCents = 0;
  let discountCents = 0;
  let feeCents = 0;

  for (const line of lines) {
    const quantity = Math.max(0, Math.trunc(line.qty));
    const unitCents = Math.round(Math.max(0, line.amount) * 100);
    const lineSubtotalCents = unitCents * quantity;
    const lineDiscountCents = 0;
    const discountedCents = Math.max(0, lineSubtotalCents - lineDiscountCents);
    const lineFeeCents = Math.round((discountedCents * rate) / 100);

    subtotalCents += lineSubtotalCents;
    discountCents += lineDiscountCents;
    feeCents += lineFeeCents;
  }

  const discountedSubtotalCents = subtotalCents - discountCents;

  return {
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    discountedSubtotal: discountedSubtotalCents / 100,
    platformFee: feeCents / 100,
    total: (discountedSubtotalCents + feeCents) / 100,
    currency,
  };
}

export function formatFeePercent(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const rounded = Math.round(rate * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/** Percentage taken from event details when the backend includes a fee field. */
export function getEventPlatformFeeRate(event?: {
  platform_fee_percentage?: number | string | null;
  platform_fee_rate?: number | string | null;
  platform_fee?: number | string | null;
  booking_platform_fees_percentage?: number | string | null;
} | null) {
  const raw =
    event?.platform_fee_percentage ??
    event?.platform_fee_rate ??
    event?.booking_platform_fees_percentage ??
    event?.platform_fee;
  const amount = parseMoney(raw);
  return amount !== null && amount >= 0 ? amount : 0;
}

/** Build selectable ticket/offer rows for the public event details UI. */
export function buildTicketSelectOptions(tickets: PublicEventTicket[]): TicketSelectOption[] {
  const options: TicketSelectOption[] = [];

  for (const ticket of tickets) {
    const currency = ticket.currency?.trim() || "GBP";
    const offers = ticket.offers ?? [];

    for (const offer of offers) {
      const amount = parseMoney(offer.price);
      if (amount === null) continue;
      const priceLabel = formatMoney(amount, currency) ?? String(amount);
      options.push({
        value: `offer-${offer.id}`,
        label: `${ticket.name}${offer.name ? ` · ${offer.name}` : ""} - ${priceLabel}`,
        ticketId: ticket.id,
        ticketName: ticket.name,
        offerId: offer.id,
        offerName: offer.name,
        amount,
        currency,
        maxPerOrder: offer.max_per_order ?? null,
        remainingQuantity: offer.remaining_quantity ?? offer.quantity_cap ?? null,
      });
    }
  }

  return options;
}

export function formatTicketPriceRange(tickets: PublicEventTicket[]) {
  const amounts = buildTicketSelectOptions(tickets).map((option) => option.amount);
  if (!amounts.length) return null;

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const currency = tickets[0]?.currency?.trim() || "GBP";

  if (min === max) return formatMoney(min, currency);
  return `${formatMoney(min, currency)}–${formatMoney(max, currency)}`;
}

export function toEventCardModel(event: PublicEventListItem) {
  return {
    id: event.id,
    uniqueId: event.unique_id,
    name: event.name,
    dateLabel: formatPublicEventDate(event.starts_at, event.timezone),
    venueName: event.venue_name?.trim() || "Venue TBA",
    imageUrl: getEventBannerUrl(event.images),
  };
}
