import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type MyOrderVenueAddress = {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type MyOrderEvent = {
  id?: number;
  unique_id?: string | null;
  name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
  venue?: {
    id?: number;
    unique_id?: string | null;
    name?: string | null;
    address?: MyOrderVenueAddress | null;
  } | null;
};

export type IssuedTicket = {
  unique_id?: string | null;
  code?: string | null;
  ticket_name?: string | null;
  offer_name?: string | null;
  status?: string | null;
  status_updated_at?: string | null;
};

export type MyOrderItem = {
  id: number;
  ticket_name?: string | null;
  offer_name?: string | null;
  quantity?: number | null;
  unit_price?: string | null;
  total_price?: string | null;
  currency?: string | null;
  formatted_unit_price?: string | null;
  formatted_total_price?: string | null;
  event?: MyOrderEvent | null;
  issued_tickets?: IssuedTicket[] | null;
};

export type MyOrder = {
  id: number;
  unique_id: string;
  status?: string | null;
  currency?: string | null;
  currency_sign?: string | null;
  subtotal?: string | null;
  discount_amount?: string | null;
  platform_fee_amount?: string | null;
  total_amount?: string | null;
  formatted_total?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  items?: MyOrderItem[] | null;
};

export type MyOrdersListParams = {
  per_page?: number;
  cursor?: string;
};

export type MyOrdersListResponse = {
  success: boolean;
  message: string;
  data: {
    items: MyOrder[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyOrders: build.query<MyOrdersListResponse, MyOrdersListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.per_page) searchParams.set("per_page", String(params.per_page));
        if (params?.cursor) searchParams.set("cursor", params.cursor);
        const query = searchParams.toString();
        return query ? `public/my-orders-list?${query}` : "public/my-orders-list";
      },
      providesTags: ["MyOrders"],
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, response, { arg }) => {
        if (!arg?.cursor) {
          currentCache.data.items = response.data.items;
          currentCache.data.pagination = response.data.pagination;
          return;
        }
        currentCache.data.items.push(...response.data.items);
        currentCache.data.pagination = response.data.pagination;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
  }),
});

export const { useGetMyOrdersQuery } = ordersApi;
