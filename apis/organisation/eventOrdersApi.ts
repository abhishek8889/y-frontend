import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type EventOrderIssuedTicket = {
  unique_id: string;
  code: string;
  ticket_name: string;
  offer_name?: string | null;
  status: string;
  status_updated_at?: string | null;
};

export type EventOrderLineItem = {
  id: number;
  ticket_name: string;
  offer_name?: string | null;
  quantity: number;
  pricing_type?: string | null;
  unit_price?: string | null;
  total_price?: string | null;
  currency?: string | null;
  formatted_unit_price?: string | null;
  formatted_total_price?: string | null;
  issued_tickets?: EventOrderIssuedTicket[];
  event?: {
    id: number;
    unique_id?: string;
    name?: string;
    starts_at?: string | null;
    ends_at?: string | null;
    timezone?: string | null;
    banner?: string | null;
    venue?: {
      id: number;
      unique_id?: string;
      name?: string | null;
      address?: {
        address_line_1?: string | null;
        address_line_2?: string | null;
        city?: string | null;
        state?: string | null;
        postal_code?: string | null;
        country?: string | null;
        google_maps_url?: string | null;
      } | null;
    } | null;
  } | null;
};

export type EventOrderListItem = {
  id: number;
  unique_id: string;
  status: string;
  sales_channel?: string | null;
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
  tickets_pdf_path?: string | null;
  items?: EventOrderLineItem[];
};

export type EventOrderRefundPerson = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export type EventOrderRefund = {
  id: number;
  unique_id: string;
  order_id?: number;
  payment_id?: number | null;
  amount?: string | null;
  formatted_amount?: string | null;
  currency?: string | null;
  reason?: string | null;
  status?: string | null;
  stripe_refund_id?: string | null;
  requested_by?: number | null;
  approved_by?: number | null;
  failure_reason?: string | null;
  refunded_at?: string | null;
  customer_notified_at?: string | null;
  created_at?: string | null;
  payment?: {
    id?: number;
    provider?: string | null;
    amount?: string | null;
    currency?: string | null;
    payment_intent_id?: string | null;
  } | null;
  requester?: EventOrderRefundPerson | null;
  approver?: EventOrderRefundPerson | null;
};

/** Order row in the event refunds list (may contain multiple refunds). */
export type EventRefundOrderItem = {
  id: number;
  unique_id: string;
  status: string;
  currency?: string | null;
  currency_sign?: string | null;
  total_amount?: string | null;
  formatted_total?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  total_refunded?: string | null;
  formatted_total_refunded?: string | null;
  refunds?: EventOrderRefund[];
};

export type EventRefundListParams = {
  eventId: number | string;
  search?: string;
  per_page?: number;
  cursor?: string;
};

export type EventRefundListResponse = {
  success: boolean;
  message: string;
  data:
    | EventRefundOrderItem[]
    | {
        items: EventRefundOrderItem[];
        pagination?: {
          per_page?: number;
          next_cursor?: string | null;
          prev_cursor?: string | null;
          has_more?: boolean;
        };
      };
};

export type EventOrderDetails = {
  id: number;
  unique_id: string;
  status: string;
  sales_channel?: string | null;
  request_origin?: string | null;
  currency?: string | null;
  currency_sign?: string | null;
  subtotal?: string | null;
  discount_amount?: string | null;
  platform_fee_amount?: string | null;
  total_amount?: string | null;
  formatted_total?: string | null;
  total_refunded?: string | null;
  formatted_total_refunded?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  tickets_pdf_path?: string | null;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    country_code?: string | null;
    user_id?: number | null;
    orders_count?: number | string | null;
    customer_since?: string | null;
  } | null;
  created_by?: {
    id?: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  payment?: {
    provider?: string | null;
    payment_method?: string | null;
    status?: string | null;
    amount?: string | null;
    currency?: string | null;
    formatted_amount?: string | null;
    reference_name?: string | null;
    external_reference_id?: string | null;
    payment_intent_id?: string | null;
    charge_id?: string | null;
    card_brand?: string | null;
    card_last4?: string | null;
    notes?: string | null;
    paid_at?: string | null;
  } | null;
  refunds?: EventOrderRefund[];
  items?: EventOrderLineItem[];
};

export type EventOrderListParams = {
  eventId: number | string;
  search?: string;
  status?: string;
  sales_channel?: string;
  per_page?: number;
  cursor?: string;
};

export type EventOrderListResponse = {
  success: boolean;
  message: string;
  data:
    | EventOrderListItem[]
    | {
        items: EventOrderListItem[];
        pagination?: {
          per_page?: number;
          next_cursor?: string | null;
          prev_cursor?: string | null;
          has_more?: boolean;
        };
      };
};

export type EventOrderDetailsResponse = {
  success: boolean;
  message: string;
  data: EventOrderDetails;
};

export type IssueOrderRefundRequest = {
  orderId: number | string;
  amount: string | number;
  reason: string;
};

export type IssueOrderRefundResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export function normalizeEventOrderList(
  data: EventOrderListResponse["data"] | undefined,
): EventOrderListItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export function normalizeEventRefundList(
  data: EventRefundListResponse["data"] | undefined,
): EventRefundOrderItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export function orderTicketSummary(order: {
  items?: EventOrderLineItem[] | null;
}) {
  const items = order.items ?? [];
  if (!items.length) return { label: "—", quantity: 0 };

  const quantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const names = Array.from(
    new Set(items.map((item) => item.ticket_name?.trim()).filter(Boolean)),
  );
  const label =
    names.length === 0
      ? "—"
      : names.length === 1
        ? names[0]
        : `${names[0]} +${names.length - 1}`;

  return { label, quantity };
}

export function formatSalesChannel(channel: string | null | undefined) {
  const value = String(channel ?? "").trim();
  if (!value) return "—";
  return value
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatPaymentProvider(payment: EventOrderDetails["payment"]) {
  if (!payment) return "—";
  const provider = payment.provider?.trim();
  if (!provider) return payment.payment_method?.trim() || "—";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export const eventOrdersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEventOrders: build.query<EventOrderListResponse, EventOrderListParams>({
      query: ({ eventId, search, status, sales_channel, per_page, cursor }) => {
        const params = new URLSearchParams();
        if (search?.trim()) params.set("search", search.trim());
        if (status && status !== "all") params.set("status", status);
        if (sales_channel && sales_channel !== "all") {
          params.set("sales_channel", sales_channel);
        }
        if (per_page != null) params.set("per_page", String(per_page));
        if (cursor) params.set("cursor", cursor);

        const query = params.toString();
        return {
          url: query
            ? `organisation/event/orders/${eventId}?${query}`
            : `organisation/event/orders/${eventId}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "EventOrders", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getEventOrderDetails: build.query<
      EventOrderDetailsResponse,
      number | string
    >({
      query: (orderId) => ({
        url: `organisation/event/orders/detail/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, orderId) => [
        { type: "EventOrders", id: `detail-${orderId}` },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getEventRefunds: build.query<EventRefundListResponse, EventRefundListParams>({
      query: ({ eventId, search, per_page, cursor }) => {
        const params = new URLSearchParams();
        if (search?.trim()) params.set("search", search.trim());
        if (per_page != null) params.set("per_page", String(per_page));
        if (cursor) params.set("cursor", cursor);

        const query = params.toString();
        return {
          url: query
            ? `organisation/event/${eventId}/refunds?${query}`
            : `organisation/event/${eventId}/refunds`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "EventRefunds", id: String(arg.eventId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    issueOrderRefund: build.mutation<
      IssueOrderRefundResponse,
      IssueOrderRefundRequest
    >({
      query: ({ orderId, amount, reason }) => ({
        url: `organisation/orders/${orderId}/issue-refund`,
        method: "POST",
        body: {
          amount,
          reason,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "EventOrders", id: `detail-${arg.orderId}` },
        { type: "EventOrders" },
        { type: "EventRefunds" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetEventOrdersQuery,
  useGetEventOrderDetailsQuery,
  useGetEventRefundsQuery,
  useIssueOrderRefundMutation,
} = eventOrdersApi;
