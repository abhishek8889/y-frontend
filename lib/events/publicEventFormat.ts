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

export function formatPublicEventDate(value: string | null | undefined, timezone?: string | null) {
  if (!value) return "Date TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
}

export function formatPublicEventLongDate(value: string | null | undefined, timezone?: string | null) {
  if (!value) return "Date TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
}

export function formatPublicEventTime(value: string | null | undefined, timezone?: string | null) {
  if (!value) return "Time TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
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
