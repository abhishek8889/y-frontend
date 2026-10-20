import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";
import type { PublicEventListItem } from "@/apis/public/publicEventsApi";

export type WishlistItem = {
  id: number;
  organisation_id?: number | null;
  event_id: number;
  event?: PublicEventListItem | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WishlistListParams = {
  per_page?: number;
  cursor?: string;
  organisation_id?: number;
};

export type WishlistListResponse = {
  success: boolean;
  message: string;
  data: {
    items: WishlistItem[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type WishlistMutationResponse = {
  success: boolean;
  message: string;
  data: WishlistItem;
};

export type WishlistEventPayload = {
  event_id: number;
  organisation_id?: number;
};

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistListResponse, WishlistListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.per_page) searchParams.set("per_page", String(params.per_page));
        if (params?.cursor) searchParams.set("cursor", params.cursor);
        if (params?.organisation_id) {
          searchParams.set("organisation_id", String(params.organisation_id));
        }
        const query = searchParams.toString();
        return query ? `public/get-wishlist?${query}` : "public/get-wishlist";
      },
      providesTags: ["Wishlist"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    addToWishlist: build.mutation<WishlistMutationResponse, WishlistEventPayload>({
      query: (body) => ({
        url: "public/move-to-wishlist",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    removeFromWishlist: build.mutation<
      { success: boolean; message: string; data?: unknown },
      WishlistEventPayload
    >({
      query: (body) => ({
        url: "public/remove-from-wishlist",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
