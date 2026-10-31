import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type PublicEventImage = {
  id?: number;
  type?: string;
  path?: string | null;
  url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  /** `image` | `video` — drives public card media preview. */
  media_type?: "image" | "video" | string | null;
  mime?: string | null;
};

export type PublicEventListItem = {
  id: number;
  unique_id: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  timezone?: string | null;
  venue_name?: string | null;
  images?: PublicEventImage[];
};

export type PublicEventListParams = {
  search?: string;
  per_page?: number;
  cursor?: string;
  organisation_id?: number;
  organisation_unique_id?: string;
  event_category_id?: number;
  /** Filter by category slug from `public/events/list`. */
  event_category_slug?: string;
};

export type PublicEventListResponse = {
  success: boolean;
  message: string;
  data: {
    items: PublicEventListItem[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type PublicEventOrganisation = {
  id: number;
  unique_id?: string | null;
  name?: string | null;
  logo?: string | null;
  banner?: string | null;
};

export type PublicEventVenueAddress = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address_line_1?: string | null;
};

export type PublicEventVenue = {
  id: number;
  name?: string | null;
  address?: PublicEventVenueAddress | null;
};

export type PublicEventCategory = {
  id: number;
  name?: string | null;
};

export type PublicEventDetails = {
  id: number;
  organisation_id?: number | null;
  organisation?: PublicEventOrganisation | null;
  unique_id: string;
  name: string;
  event_category_id?: number | null;
  category?: PublicEventCategory | null;
  description?: string | null;
  venue_id?: number | null;
  venue?: PublicEventVenue | null;
  capacity?: number | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone?: string | null;
  status?: string | null;
  images?: PublicEventImage[];
  platform_fee?: number | string | null;
  platform_fee_rate?: number | string | null;
  platform_fee_percentage?: number | string | null;
  booking_platform_fees_percentage?: number | string | null;
};

export type PublicEventDetailsResponse = {
  success: boolean;
  message: string;
  data: PublicEventDetails;
};

export type PublicEventTicketOffer = {
  id: number;
  event_ticket_id?: number;
  unique_id?: string;
  name: string;
  price?: number | string | null;
  quantity_cap?: number | null;
  remaining_quantity?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  max_per_order?: number | null;
  access?: string | null;
  status?: string | null;
  sort_order?: number | null;
};

export type PublicEventTicket = {
  id: number;
  event_id?: number;
  unique_id?: string;
  name: string;
  description?: string | null;
  base_price?: number | string | null;
  currency?: string | null;
  quantity_cap?: number | null;
  badge_label?: string | null;
  entitlement?: string | null;
  status?: string | null;
  sort_order?: number | null;
  offers?: PublicEventTicketOffer[];
};

export type PublicEventTicketsResponse = {
  success: boolean;
  message: string;
  data: PublicEventTicket[];
};

export type StartBookingOfferPayload = {
  offer_id: number;
  qty: number;
};

export type StartBookingTicketPayload = {
  offers: StartBookingOfferPayload[];
};

export type StartBookingOrderItem = {
  ticket_name: string;
  offer_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency: string;
};

export type PublicOrderStatusEvent = {
  name?: string | null;
  starts_at?: string | null;
  timezone?: string | null;
  venue_name?: string | null;
  location?: string | null;
  organisation_name?: string | null;
};

export type PublicOrderStatusItem = {
  ticket_name?: string | null;
  offer_name?: string | null;
  quantity?: number | string | null;
  total_price?: string | number | null;
};

export type PublicOrderStatus = {
  unique_id: string;
  status: string;
  sales_channel?: string | null;
  subtotal?: string | number | null;
  discount_amount?: string | number | null;
  platform_fee_amount?: string | number | null;
  total_amount?: string | number | null;
  currency?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  paid_at?: string | null;
  tickets_pdf_path?: string | null;
  event?: PublicOrderStatusEvent | null;
  items?: PublicOrderStatusItem[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Accepts the order object, or the usual `{ success, data }` envelope. */
export function readPublicOrderStatus(response: unknown): PublicOrderStatus {
  const record = isRecord(response) ? response : null;
  const payload =
    record && isRecord(record.data) && typeof record.data.unique_id === "string"
      ? record.data
      : record;

  if (!payload || typeof payload.unique_id !== "string" || !payload.unique_id.trim()) {
    throw new Error("Order details were not returned.");
  }

  return payload as PublicOrderStatus;
}

export type StartBookingTicketResponse = {
  success: boolean;
  message: string;
  data: {
    order: {
      unique_id: string;
      checkout_key: string;
      status: string;
      subtotal: string;
      discount_amount: string;
      platform_fee_amount: string;
      total_amount: string;
      currency: string;
      expires_at?: string | null;
      items: StartBookingOrderItem[];
    };
    payment: {
      payment_intent_id: string;
      client_secret: string | null;
      status: string;
      amount: string;
      currency: string;
    };
  };
};

export const publicEventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicEvents: build.query<PublicEventListResponse, PublicEventListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set("search", params.search);
        if (params?.per_page) searchParams.set("per_page", String(params.per_page));
        if (params?.cursor) searchParams.set("cursor", params.cursor);
        if (params?.organisation_id) {
          searchParams.set("organisation_id", String(params.organisation_id));
        }
        if (params?.organisation_unique_id) {
          searchParams.set("organisation_unique_id", params.organisation_unique_id);
        }
        if (params?.event_category_id != null && String(params.event_category_id).trim() !== "") {
          searchParams.set("event_category_id", String(params.event_category_id));
        }
        if (params?.event_category_slug?.trim()) {
          searchParams.set("event_category_slug", params.event_category_slug.trim());
        }
        const query = searchParams.toString();
        return query ? `public/events/list?${query}` : "public/events/list";
      },
      providesTags: ["PublicEvents"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getPublicEventDetails: build.query<PublicEventDetailsResponse, string>({
      query: (uniqueId) => `public/events/details/${encodeURIComponent(uniqueId)}`,
      providesTags: (_result, _error, uniqueId) => [{ type: "PublicEvents", id: uniqueId }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getPublicEventTickets: build.query<PublicEventTicketsResponse, string>({
      query: (uniqueId) => `public/events/tickets/${encodeURIComponent(uniqueId)}`,
      providesTags: (_result, _error, uniqueId) => [{ type: "EventTickets", id: uniqueId }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    startBookingTicket: build.mutation<StartBookingTicketResponse, StartBookingTicketPayload>({
      query: (body) => ({
        url: "public/start-booking-ticket",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getPublicOrderStatus: build.query<PublicOrderStatus, string>({
      query: (orderUniqueId) =>
        `public/order-status/${encodeURIComponent(orderUniqueId)}`,
      transformResponse: (response: unknown) => readPublicOrderStatus(response),
    }),
  }),
});

export const {
  useGetPublicEventsQuery,
  useLazyGetPublicEventsQuery,
  useGetPublicEventDetailsQuery,
  useGetPublicEventTicketsQuery,
  useStartBookingTicketMutation,
  useGetPublicOrderStatusQuery,
} = publicEventsApi;
