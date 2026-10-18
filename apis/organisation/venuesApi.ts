import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type VenueAddress = {
  id?: number;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  google_maps_url?: string | null;
};

export type VenueType = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export type VenueImage = {
  id: number;
  type: string;
  path: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type VenueContact = {
  id?: number;
  type?: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  alternative_phone?: string | null;
  website: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
};

export type VenueAccessibility = {
  id?: number;
  accessible_entrance: boolean;
  accessible_toilet: boolean;
  wheelchair_access: boolean;
  notes?: string | null;
};

export type VenueLogistics = {
  id?: number;
  parking_information: string | null;
  public_transport_information: string | null;
  travel_information: string | null;
};

export type VenueFacility = {
  id: number;
  organisation_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export type VenueSuitableForOption = {
  id: number;
  organisation_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export type Venue = {
  id: number;
  organisation_id: number;
  unique_id: string;
  name: string;
  venue_type_id: number | null;
  venue_type: VenueType | null;
  description: string | null;
  maximum_capacity: number | null;
  standing_capacity: number | null;
  seated_capacity: number | null;
  status: "active" | "inactive" | "draft" | string;
  is_private_hire_available: boolean;
  private_hire_description: string | null;
  address: VenueAddress | null;
  contact?: VenueContact | null;
  accessibility?: VenueAccessibility | null;
  logistics?: VenueLogistics | null;
  facilities?: VenueFacility[];
  suitable_for_options?: VenueSuitableForOption[];
  images: VenueImage[];
};

export type VenueListParams = {
  per_page?: number;
  status?: string;
  search?: string;
  venue_type_id?: number | string;
  cursor?: string;
};

export type VenueListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Venue[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type VenueForEvent = {
  id: number;
  name: string;
  maximum_capacity: number | null;
};

export type VenueListForEventsResponse = {
  success: boolean;
  message: string;
  data: VenueForEvent[];
};

export type VenueTypesResponse = {
  success: boolean;
  message: string;
  data: VenueType[];
};

export type VenuePageOverview = {
  total_venue: number;
  active_venue: number;
  inactive_venue: number;
};

export type VenuePageOverviewResponse = {
  success: boolean;
  message: string;
  data: VenuePageOverview;
};

export type VenueDetailsResponse = {
  success: boolean;
  message: string;
  data: Venue;
};

export type VenueFacilitiesResponse = {
  success: boolean;
  message: string;
  data: VenueFacility[];
};

export type VenueSuitableForOptionsResponse = {
  success: boolean;
  message: string;
  data: VenueSuitableForOption[];
};

export type VenueMutationResponse = {
  success: boolean;
  message: string;
  data: Venue;
};

export type VenueImageInput = {
  id?: number;
  type: "banner" | "gallery";
  path: string;
  alt_text?: string | null;
  sort_order?: number;
};

export type VenuePayload = {
  name: string;
  venue_type_id?: number | null;
  description?: string | null;
  maximum_capacity?: number | null;
  standing_capacity?: number | null;
  seated_capacity?: number | null;
  status?: "active" | "inactive" | "draft";
  is_private_hire_available?: boolean;
  private_hire_description?: string | null;
  address?: {
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    google_maps_url?: string | null;
  } | null;
  contact?: {
    type?: string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    alternative_phone?: string | null;
    website?: string | null;
  } | null;
  accessibility?: {
    accessible_entrance?: boolean;
    accessible_toilet?: boolean;
    wheelchair_access?: boolean;
    notes?: string | null;
  } | null;
  logistics?: {
    parking_information?: string | null;
    public_transport_information?: string | null;
    travel_information?: string | null;
  } | null;
  facility_ids?: number[];
  suitable_for_option_ids?: number[];
  images?: VenueImageInput[];
};

export const venuesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVenueTypes: build.query<VenueTypesResponse, void>({
      query: () => ({
        url: "venue/types",
        method: "GET",
      }),
      providesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenuePageOverview: build.query<VenuePageOverviewResponse, void>({
      query: () => ({
        url: "organisation/venue/page-overview",
        method: "GET",
      }),
      providesTags: ["venuePageOverview"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenues: build.query<VenueListResponse, VenueListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const perPage = params?.per_page ?? 10;

        searchParams.set("per_page", String(perPage));

        if (params?.status && params.status !== "all") {
          searchParams.set("status", params.status);
        } else {
          searchParams.set("status", "");
        }

        searchParams.set("search", params?.search?.trim() ?? "");

        if (params?.venue_type_id !== undefined && params.venue_type_id !== "" && params.venue_type_id !== "all") {
          searchParams.set("venue_type_id", String(params.venue_type_id));
        }

        if (params?.cursor) {
          searchParams.set("cursor", params.cursor);
        }

        return {
          url: `organisation/venue/list?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenuesForEvents: build.query<VenueListForEventsResponse, void>({
      query: () => ({
        url: "organisation/venue/venue-list-for-events",
        method: "GET",
      }),
      providesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenueDetails: build.query<VenueDetailsResponse, number | string>({
      query: (venueId) => ({
        url: `organisation/venue/details/${venueId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, venueId) => [{ type: "Venues", id: String(venueId) }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenueFacilities: build.query<VenueFacilitiesResponse, void>({
      query: () => ({
        url: "organisation/venue/facilities",
        method: "GET",
      }),
      providesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getVenueSuitableForOptions: build.query<VenueSuitableForOptionsResponse, void>({
      query: () => ({
        url: "organisation/venue/suitable-for-options",
        method: "GET",
      }),
      providesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createCustomFacility: build.mutation<
      { success: boolean; message: string; data: VenueFacility },
      { name: string }
    >({
      query: (body) => ({
        url: "organisation/venue/create-custom-facilities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteCustomFacility: build.mutation<
      { success: boolean; message: string; data: { facility_id: number } },
      number | string
    >({
      query: (facilityId) => ({
        url: `organisation/venue/delete-facility/${facilityId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    createCustomSuitableForOption: build.mutation<
      { success: boolean; message: string; data: VenueSuitableForOption },
      { name: string }
    >({
      query: (body) => ({
        url: "organisation/venue/create-custom-suitable-for-option",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteCustomSuitableForOption: build.mutation<
      { success: boolean; message: string; data: { option_id: number } },
      number | string
    >({
      query: (optionId) => ({
        url: `organisation/venue/delete-suitable-for-option/${optionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Venues"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    createVenue: build.mutation<VenueMutationResponse, VenuePayload>({
      query: (body) => ({
        url: "organisation/venue/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Venues", "venuePageOverview"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateVenue: build.mutation<VenueMutationResponse, { venueId: number | string; body: VenuePayload }>({
      query: ({ venueId, body }) => ({
        url: `organisation/venue/update/${venueId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Venues",
        "venuePageOverview",
        { type: "Venues", id: String(arg.venueId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    manageVenueStatus: build.mutation<
      VenueMutationResponse,
      { venue_id: number | string; status: "active" | "inactive" }
    >({
      query: (body) => ({
        url: "organisation/venue/manage-status",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Venues",
        "venuePageOverview",
        { type: "Venues", id: String(arg.venue_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteVenue: build.mutation<
      { success: boolean; message: string; data: { venue_id: number } },
      number | string
    >({
      query: (venueId) => ({
        url: `organisation/venue/delete/${venueId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, venueId) => [
        "Venues",
        "venuePageOverview",
        { type: "Venues", id: String(venueId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    duplicateVenue: build.mutation<VenueMutationResponse, number | string>({
      query: (venueId) => ({
        url: `organisation/venue/duplicate/${venueId}`,
        method: "POST",
      }),
      invalidatesTags: ["Venues", "venuePageOverview"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetVenueTypesQuery,
  useGetVenuePageOverviewQuery,
  useGetVenuesQuery,
  useLazyGetVenuesQuery,
  useGetVenuesForEventsQuery,
  useGetVenueDetailsQuery,
  useLazyGetVenueDetailsQuery,
  useGetVenueFacilitiesQuery,
  useGetVenueSuitableForOptionsQuery,
  useCreateCustomFacilityMutation,
  useDeleteCustomFacilityMutation,
  useCreateCustomSuitableForOptionMutation,
  useDeleteCustomSuitableForOptionMutation,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useManageVenueStatusMutation,
  useDeleteVenueMutation,
  useDuplicateVenueMutation,
} = venuesApi;
