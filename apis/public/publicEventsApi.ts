import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type PublicEventImage = {
  id?: number;
  type?: string;
  path?: string | null;
  url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
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
        if (params?.event_category_id) {
          searchParams.set("event_category_id", String(params.event_category_id));
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
  }),
});

export const {
  useGetPublicEventsQuery,
  useGetPublicEventDetailsQuery,
  useGetPublicEventTicketsQuery,
} = publicEventsApi;
