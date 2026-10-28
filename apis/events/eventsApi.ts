import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type EventCategory = {
  id: number;
  organisation_id: number | null;
  name: string;
};

export type EventCategoriesResponse = {
  success: boolean;
  message: string;
  data: EventCategory[];
};

export type CreateCustomEventCategoryResponse = {
  success: boolean;
  message: string;
  data: EventCategory;
};

export type EventImageInput = {
  id?: number;
  type: "banner" | "gallery";
  path: string;
  alt_text?: string | null;
  sort_order?: number;
};

export type EventImage = EventImageInput & {
  url?: string | null;
  /** `image` | `video` — used for list card media preview. */
  media_type?: "image" | "video" | string | null;
  mime?: string | null;
};

export type EventLifecycleStatus = "draft" | "published" | "cancelled" | "completed";

export type EventPayload = {
  name: string;
  event_category_id: number;
  description?: string | null;
  venue_id: number;
  capacity: number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: EventLifecycleStatus;
  images?: EventImageInput[];
};

export type EventListVenue = {
  id: number;
  organisation_id?: number;
  unique_id?: string;
  name: string;
  venue_type_id?: number | null;
  description?: string | null;
  maximum_capacity?: number | null;
  standing_capacity?: number | null;
  seated_capacity?: number | null;
  status?: string;
  is_private_hire_available?: boolean;
  private_hire_description?: string | null;
  created_by?: number;
  updated_by?: number;
};

export type OrganisationEvent = {
  id: number;
  organisation_id?: number;
  unique_id?: string;
  name: string;
  event_category_id: number | null;
  category?: EventCategory | null;
  description: string | null;
  venue_id: number | null;
  venue?: EventListVenue | null;
  capacity: number | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status?: string;
  published_at?: string | null;
  images?: EventImage[];
  created_by?: number;
  updated_by?: number;
};

export type OrganisationEventListParams = {
  per_page?: number;
  search?: string;
  cursor?: string;
  status?: string;
  event_category_id?: number | string;
  /** Inclusive range start in UTC (`YYYY-MM-DD HH:mm:ss`). */
  starts_at?: string;
  /** Inclusive range end in UTC (`YYYY-MM-DD HH:mm:ss`). */
  ends_at?: string;
};

export type OrganisationEventListResponse = {
  success: boolean;
  message: string;
  data: {
    items: OrganisationEvent[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type EventMutationResponse = {
  success: boolean;
  message: string;
  data: OrganisationEvent;
};

export type EventDetailsResponse = {
  success: boolean;
  message: string;
  data: OrganisationEvent;
};

export type EventTicketOffer = {
  id: number | string;
  name: string;
  price?: number | string | null;
  quantity_cap?: number | null;
  max_tickets_per_order?: number | null;
  max_per_order?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  access?: string | null;
  status?: string | null;
  sort_order?: number | null;
};

export type EventTicketStatus = "draft" | "active" | "inactive" | "sold_out";

export type EventTicketOfferPayload = {
  ticket_id: number;
  name: string;
  price: number;
  quantity_cap: number;
  sale_starts_at: string;
  sale_ends_at: string;
  max_per_order: number;
  access: string;
  status: EventTicketStatus;
  sort_order: number;
};

export type EventTicketOfferMutationResponse = {
  success: boolean;
  message: string;
  data: EventTicketOffer;
};

export type EventTicket = {
  id: number | string;
  event_id?: number;
  name: string;
  description?: string | null;
  base_price?: number | string | null;
  price?: number | string | null;
  quantity_cap?: number | null;
  quantity?: number | null;
  sold?: number | null;
  currency?: string | null;
  badge_label?: string | null;
  entitlement?: string | null;
  sort_order?: number | null;
  status?: string | null;
  offers?: EventTicketOffer[];
};

export type EventTicketPayload = {
  event_id: number;
  name: string;
  description?: string | null;
  base_price: number;
  currency: string;
  quantity_cap: number;
  badge_label?: string | null;
  entitlement?: string | null;
  sort_order?: number;
  status: EventTicketStatus;
};

export type EventTicketMutationResponse = {
  success: boolean;
  message: string;
  data: EventTicket;
};

export type EventTicketsResponse = {
  success: boolean;
  message: string;
  data: EventTicket[] | { items: EventTicket[] };
};

export function normalizeEventTickets(data: EventTicketsResponse["data"] | undefined): EventTicket[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationEvents: build.query<
      OrganisationEventListResponse,
      OrganisationEventListParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const perPage = params?.per_page ?? 15;

        searchParams.set("per_page", String(perPage));
        searchParams.set("search", params?.search?.trim() ?? "");

        if (params?.status && params.status !== "all") {
          searchParams.set("status", params.status);
        }

        if (params?.event_category_id != null && String(params.event_category_id).trim() !== "") {
          searchParams.set("event_category_id", String(params.event_category_id));
        }

        if (params?.starts_at?.trim()) {
          searchParams.set("starts_at", params.starts_at.trim());
        }

        if (params?.ends_at?.trim()) {
          searchParams.set("ends_at", params.ends_at.trim());
        }

        if (params?.cursor) {
          searchParams.set("cursor", params.cursor);
        }

        return {
          url: `organisation/event/list?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Events"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getEventCategories: build.query<EventCategoriesResponse, void>({
      query: () => ({
        url: "event/categories",
        method: "GET",
      }),
      providesTags: ["EventCategories"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createCustomEventCategory: build.mutation<
      CreateCustomEventCategoryResponse,
      { name: string }
    >({
      query: (body) => ({
        url: "organisation/event/create-custom-category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EventCategories"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    getEventDetails: build.query<EventDetailsResponse, number | string>({
      query: (eventId) => ({
        url: `organisation/event/details/${eventId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, eventId) => [{ type: "Events", id: String(eventId) }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createEvent: build.mutation<EventMutationResponse, EventPayload>({
      query: (body) => ({
        url: "organisation/event/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateEvent: build.mutation<
      EventMutationResponse,
      { eventId: number | string; body: EventPayload }
    >({
      query: ({ eventId, body }) => ({
        url: `organisation/event/update/${eventId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Events",
        { type: "Events", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    getEventTickets: build.query<EventTicketsResponse, number | string>({
      query: (eventId) => ({
        url: `organisation/event/ticket/list/${eventId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, eventId) => [
        "EventTickets",
        { type: "EventTickets", id: String(eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createEventTicket: build.mutation<EventTicketMutationResponse, EventTicketPayload>({
      query: (body) => ({
        url: "organisation/event/ticket/create",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.event_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateEventTicket: build.mutation<
      EventTicketMutationResponse,
      { ticketId: number | string; body: EventTicketPayload }
    >({
      query: ({ ticketId, body }) => ({
        url: `organisation/event/ticket/update/${ticketId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.body.event_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteEventTicket: build.mutation<
      { success: boolean; message: string },
      { ticketId: number | string; eventId: number | string }
    >({
      query: ({ ticketId }) => ({
        url: `organisation/event/ticket/delete/${ticketId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    createEventTicketOffer: build.mutation<
      EventTicketOfferMutationResponse,
      { eventId: number | string; body: EventTicketOfferPayload }
    >({
      query: ({ body }) => ({
        url: "organisation/event/ticket/offer/create",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateEventTicketOffer: build.mutation<
      EventTicketOfferMutationResponse,
      {
        offerId: number | string;
        eventId: number | string;
        body: EventTicketOfferPayload;
      }
    >({
      query: ({ offerId, body }) => ({
        url: `organisation/event/ticket/offer/update/${offerId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteEventTicketOffer: build.mutation<
      { success: boolean; message: string },
      { offerId: number | string; eventId: number | string }
    >({
      query: ({ offerId }) => ({
        url: `organisation/event/ticket/offer/delete/${offerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        "EventTickets",
        { type: "EventTickets", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    manageEventStatus: build.mutation<
      EventMutationResponse,
      { eventId: number | string; status: EventLifecycleStatus }
    >({
      query: ({ eventId, status }) => ({
        url: `organisation/event/manage-status/${eventId}`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Events",
        { type: "Events", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    duplicateEvent: build.mutation<EventMutationResponse, number | string>({
      query: (eventId) => ({
        url: `organisation/event/duplicate/${eventId}`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationEventsQuery,
  useGetEventCategoriesQuery,
  useCreateCustomEventCategoryMutation,
  useGetEventDetailsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetEventTicketsQuery,
  useCreateEventTicketMutation,
  useUpdateEventTicketMutation,
  useDeleteEventTicketMutation,
  useCreateEventTicketOfferMutation,
  useUpdateEventTicketOfferMutation,
  useDeleteEventTicketOfferMutation,
  useManageEventStatusMutation,
  useDuplicateEventMutation,
} = eventsApi;
