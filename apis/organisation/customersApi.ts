import { withQueryToast } from "@/lib/api/queryToast";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { baseApi } from "@/lib/store/baseApi";
import type {
  Customer,
  CustomerStatus,
} from "@/app/(organiser)/customers/customerTypes";

export type OrganisationCustomerLastOrder = {
  id?: number;
  unique_id?: string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  paid_at?: string | null;
};

export type OrganisationCustomer = {
  id: number;
  membership_id?: number | null;
  unique_id?: string | null;
  customer_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  country_code?: string | null;
  status?: string | null;
  entitlement?: string | null;
  profile_image?: string | null;
  total_orders?: number | string | null;
  orders_count?: number | string | null;
  attended?: number | string | null;
  events_attended?: number | string | null;
  total_spent?: number | string | null;
  total_spend?: number | string | null;
  spend?: number | string | null;
  formatted_total_spent?: string | null;
  total_refunded?: number | string | null;
  formatted_total_refunded?: string | null;
  currency?: string | null;
  tickets_purchased?: number | string | null;
  last_order?: OrganisationCustomerLastOrder | null;
  last_activity?: string | null;
  last_activity_at?: string | null;
  customer_since?: string | null;
  created_at?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
};

export type CustomerListParams = {
  search?: string;
  status?: "" | "active" | "inactive" | "suspended" | string;
  per_page?: number;
  cursor?: string;
};

export type CustomerListPagination = {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  total?: number;
};

export type CustomerListSummary = {
  total?: number;
  active?: number;
  inactive?: number;
  suspended?: number;
};

export type CustomerListResponse = {
  success: boolean;
  message: string;
  data: {
    items?: OrganisationCustomer[];
    customers?: OrganisationCustomer[];
    pagination?: CustomerListPagination;
    summary?: CustomerListSummary;
  } | OrganisationCustomer[];
};

function asNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatActivityDate(
  value: string | null | undefined,
  timeZone?: string | null,
) {
  if (!value?.trim()) return "—";
  return formatDateTime(value, {
    dateOnly: true,
    includeYear: true,
    emptyLabel: value,
    timeZone,
  });
}

function normalizeStatus(status: string | null | undefined): CustomerStatus {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "inactive") return "inactive";
  if (normalized === "suspended") return "suspended";
  return "active";
}

function splitName(name: string | null | undefined) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function formatPhone(countryCode?: string | null, phone?: string | null) {
  return [countryCode?.trim(), phone?.trim()].filter(Boolean).join(" ").trim();
}

export function mapOrganisationCustomer(
  item: OrganisationCustomer,
  timeZone?: string | null,
): Customer {
  const fromParts = {
    firstName: item.first_name?.trim() || "",
    lastName: item.last_name?.trim() || "",
  };
  const fromName =
    !fromParts.firstName && !fromParts.lastName
      ? splitName(item.name)
      : fromParts;

  const location =
    item.location?.trim() ||
    [item.city?.trim(), item.country?.trim()].filter(Boolean).join(", ") ||
    undefined;

  return {
    id: item.id,
    customerId:
      item.unique_id?.trim() ||
      item.customer_id?.trim() ||
      `CUST-${item.id}`,
    firstName: fromName.firstName || "—",
    lastName: fromName.lastName,
    email: item.email?.trim() || "—",
    phone: formatPhone(item.country_code, item.phone),
    entitlement: item.entitlement?.trim() || "",
    status: normalizeStatus(item.status),
    totalOrders: asNumber(item.total_orders ?? item.orders_count),
    attended: asNumber(item.attended ?? item.events_attended),
    totalSpend: asNumber(
      item.total_spent ?? item.total_spend ?? item.spend,
    ),
    totalRefunded: asNumber(item.total_refunded),
    ticketsPurchased: asNumber(item.tickets_purchased),
    lastActivity: formatActivityDate(
      item.last_order?.paid_at ||
        item.last_activity_at ||
        item.last_activity,
      timeZone,
    ),
    customerSince: formatActivityDate(
      item.customer_since || item.created_at,
      timeZone,
    ),
    location,
    lastOrder: item.last_order?.id
      ? {
          id: item.last_order.id,
          uniqueId:
            item.last_order.unique_id?.trim() ||
            `ORD-${item.last_order.id}`,
          totalAmount: asNumber(item.last_order.total_amount),
          paidAt: formatActivityDate(item.last_order.paid_at, timeZone),
        }
      : null,
  };
}

export function normalizeCustomerListItems(
  data: CustomerListResponse["data"] | undefined,
): OrganisationCustomer[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.customers)) return data.customers;
  return [];
}

export function customerListPagination(
  data: CustomerListResponse["data"] | undefined,
): CustomerListPagination | undefined {
  if (!data || Array.isArray(data)) return undefined;
  return data.pagination;
}

export function customerListSummary(
  data: CustomerListResponse["data"] | undefined,
  customers: Customer[],
): Required<CustomerListSummary> {
  if (data && !Array.isArray(data) && data.summary) {
    return {
      total: asNumber(data.summary.total, customers.length),
      active: asNumber(data.summary.active),
      inactive: asNumber(data.summary.inactive),
      suspended: asNumber(data.summary.suspended),
    };
  }

  return {
    total: customers.length,
    active: customers.filter((customer) => customer.status === "active").length,
    inactive: customers.filter((customer) => customer.status === "inactive")
      .length,
    suspended: customers.filter((customer) => customer.status === "suspended")
      .length,
  };
}

export type CustomerOrderEvent = {
  id: number;
  unique_id?: string | null;
  name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
};

export type CustomerOrderLineItem = {
  id: number;
  ticket_name?: string | null;
  offer_name?: string | null;
  quantity?: number | string | null;
  event?: CustomerOrderEvent | null;
};

export type CustomerOrderPayment = {
  payment_method?: string | null;
  provider?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
};

export type CustomerOrder = {
  id: number;
  unique_id: string;
  status: string;
  sales_channel?: string | null;
  request_origin?: string | null;
  currency?: string | null;
  currency_sign?: string | null;
  total_amount?: number | string | null;
  formatted_total?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  tickets_pdf_path?: string | null;
  payment?: CustomerOrderPayment | null;
  items?: CustomerOrderLineItem[] | null;
};

export type CustomerOrdersParams = {
  customerId: number | string;
  search?: string;
  status?: string;
  search_from?: string;
  search_to?: string;
  per_page?: number;
  cursor?: string;
};

export type CustomerOrdersResponse = {
  success: boolean;
  message: string;
  data:
    | CustomerOrder[]
    | {
        items?: CustomerOrder[];
        pagination?: CustomerListPagination;
      };
};

export function normalizeCustomerOrders(
  data: CustomerOrdersResponse["data"] | undefined,
): CustomerOrder[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export function customerOrdersPagination(
  data: CustomerOrdersResponse["data"] | undefined,
): CustomerListPagination | undefined {
  if (!data || Array.isArray(data)) return undefined;
  return data.pagination;
}

export function customerOrderEventNames(order: CustomerOrder): string {
  const names = Array.from(
    new Set(
      (order.items ?? [])
        .map((item) => item.event?.name?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  );
  if (!names.length) return "—";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

export function customerOrderProductLines(order: CustomerOrder): string[] {
  const lines = (order.items ?? [])
    .map((item) => {
      const quantity = asNumber(item.quantity, 0);
      const ticket = item.ticket_name?.trim() || "Ticket";
      const offer = item.offer_name?.trim();
      const label = offer ? `${ticket} · ${offer}` : ticket;
      return quantity > 0 ? `${quantity} × ${label}` : label;
    })
    .filter(Boolean);

  return lines.length ? lines : ["—"];
}

export function formatCustomerOrderSource(order: CustomerOrder): {
  channel: string;
  origin: string | null;
} {
  const channelRaw = String(order.sales_channel ?? "").trim();
  const channel = channelRaw
    ? channelRaw
        .split(/[_\s-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    : "—";

  const isOnline = channelRaw.toLowerCase() === "online";
  const origin = isOnline ? order.request_origin?.trim() || null : null;

  return { channel, origin };
}

export function formatCustomerOrderPayment(
  payment: CustomerOrderPayment | null | undefined,
): string {
  if (!payment) return "—";

  const method = String(payment.payment_method ?? payment.provider ?? "")
    .trim()
    .toLowerCase();
  const brand = payment.card_brand?.trim();
  const last4 = payment.card_last4?.trim();

  if (method === "card" || brand || last4) {
    const brandLabel = brand
      ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
      : "Card";
    if (last4) return `${brandLabel} ending ${last4}`;
    return brandLabel;
  }

  if (!method) return "—";
  return method
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function customerOrderAmount(order: CustomerOrder): string {
  if (order.formatted_total?.trim()) return order.formatted_total.trim();
  const sign = order.currency_sign?.trim() || "£";
  return `${sign}${order.total_amount ?? "0.00"}`;
}

export type CustomerProductIssuedTicket = {
  unique_id?: string | null;
  code?: string | null;
  status?: string | null;
};

export type CustomerProduct = {
  id: number;
  order_id: number;
  order_unique_id?: string | null;
  status?: string | null;
  ticket_name?: string | null;
  offer_name?: string | null;
  quantity?: number | string | null;
  total_price?: string | null;
  formatted_total_price?: string | null;
  currency?: string | null;
  pricing_type?: string | null;
  event_name?: string | null;
  sales_channel?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  ticket_unique_id?: string | null;
  offer_unique_id?: string | null;
  issued_tickets?: CustomerProductIssuedTicket[] | null;
};

export type CustomerProductsParams = {
  customerId: number | string;
  search?: string;
  status?: string;
  search_from?: string;
  search_to?: string;
  per_page?: number;
  cursor?: string;
};

export type CustomerProductsResponse = {
  success: boolean;
  message: string;
  data:
    | CustomerProduct[]
    | {
        items?: CustomerProduct[];
        pagination?: CustomerListPagination;
      };
};

export function normalizeCustomerProducts(
  data: CustomerProductsResponse["data"] | undefined,
): CustomerProduct[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}

export function customerProductsPagination(
  data: CustomerProductsResponse["data"] | undefined,
): CustomerListPagination | undefined {
  if (!data || Array.isArray(data)) return undefined;
  return data.pagination;
}

export function customerProductTicketId(product: CustomerProduct): string {
  const issued = product.issued_tickets?.find((ticket) => ticket.unique_id?.trim());
  const value =
    issued?.unique_id?.trim() ||
    product.ticket_unique_id?.trim() ||
    `ITEM-${product.id}`;
  return value.startsWith("#") ? value : `#${value}`;
}

export function customerProductOrderId(product: CustomerProduct): string {
  const value =
    product.order_unique_id?.trim() || `ORD-${product.order_id}`;
  return value.startsWith("#") ? value : `#${value}`;
}

export function customerProductLabel(product: CustomerProduct): string {
  const ticket = product.ticket_name?.trim() || "Ticket";
  const offer = product.offer_name?.trim();
  return offer ? `${ticket} · ${offer}` : ticket;
}

export function customerProductQuantity(product: CustomerProduct): string {
  const quantity = Number(product.quantity);
  return Number.isFinite(quantity) ? String(quantity) : "—";
}

export function customerProductAmount(product: CustomerProduct): string {
  if (product.formatted_total_price?.trim()) {
    return product.formatted_total_price.trim();
  }
  return `£${product.total_price ?? "0.00"}`;
}

export function customerProductTicketStatus(product: CustomerProduct): string {
  return product.status?.trim() || "—";
}

export type CustomerOverviewCustomer = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profile_image?: string | null;
  phone?: string | null;
  country_code?: string | null;
  country?: string | null;
  status?: string | null;
  organisation_customer_status?: string | null;
  customer_since?: string | null;
  last_activity?: string | null;
};

export type CustomerOverviewSummary = {
  total_orders?: number | string | null;
  total_tickets_purchased?: number | string | null;
  total_spent?: string | null;
  formatted_total_spent?: string | null;
  total_refunded?: string | null;
  formatted_total_refunded?: string | null;
  events_attended?: number | string | null;
  currency?: string | null;
};

export type CustomerOverviewActivityRefund = {
  id?: number;
  unique_id?: string | null;
  amount?: string | null;
  currency?: string | null;
  status?: string | null;
  order_id?: number;
  order_unique_id?: string | null;
};

export type CustomerOverviewActivityOrder = {
  id?: number;
  unique_id?: string | null;
  status?: string | null;
  total_amount?: string | null;
  currency?: string | null;
};

export type CustomerOverviewActivity = {
  type?: string | null;
  occurred_at?: string | null;
  title?: string | null;
  description?: string | null;
  refund?: CustomerOverviewActivityRefund | null;
  order?: CustomerOverviewActivityOrder | null;
};

export type CustomerOverviewUpcomingEvent = {
  id: number;
  unique_id?: string | null;
  name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
  status?: string | null;
  venue?: {
    id?: number;
    unique_id?: string | null;
    name?: string | null;
  } | null;
};

export type CustomerOverviewData = {
  customer: CustomerOverviewCustomer;
  summary: CustomerOverviewSummary;
  recent_activity?: CustomerOverviewActivity[] | null;
  recent_orders?: CustomerOrder[] | null;
  upcoming_events?: CustomerOverviewUpcomingEvent[] | null;
};

export type CustomerOverviewResponse = {
  success: boolean;
  message: string;
  data: CustomerOverviewData;
};

export function mapCustomerOverviewToCustomer(
  data: CustomerOverviewData,
  timeZone?: string | null,
  fallback?: Customer | null,
): Customer {
  const item = data.customer;
  const summary = data.summary;
  const firstRecent = data.recent_orders?.[0];

  return {
    id: item.id,
    customerId: fallback?.customerId || `CUST-${item.id}`,
    firstName: item.first_name?.trim() || fallback?.firstName || "—",
    lastName: item.last_name?.trim() || fallback?.lastName || "",
    email: item.email?.trim() || fallback?.email || "—",
    phone:
      formatPhone(item.country_code, item.phone) || fallback?.phone || "",
    entitlement: fallback?.entitlement || "",
    status: normalizeStatus(
      item.organisation_customer_status || item.status,
    ),
    totalOrders: asNumber(summary.total_orders, fallback?.totalOrders ?? 0),
    attended: asNumber(
      summary.events_attended,
      fallback?.attended ?? 0,
    ),
    totalSpend: asNumber(summary.total_spent, fallback?.totalSpend ?? 0),
    totalRefunded: asNumber(
      summary.total_refunded,
      fallback?.totalRefunded ?? 0,
    ),
    ticketsPurchased: asNumber(
      summary.total_tickets_purchased,
      fallback?.ticketsPurchased ?? 0,
    ),
    lastActivity: formatActivityDate(item.last_activity, timeZone),
    customerSince: formatActivityDate(item.customer_since, timeZone),
    location: item.country?.trim() || fallback?.location,
    lastOrder: firstRecent
      ? {
          id: firstRecent.id,
          uniqueId: firstRecent.unique_id?.trim() || `ORD-${firstRecent.id}`,
          totalAmount: asNumber(firstRecent.total_amount),
          paidAt: formatActivityDate(
            firstRecent.paid_at || firstRecent.created_at,
            timeZone,
          ),
        }
      : (fallback?.lastOrder ?? null),
  };
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomerList: build.query<
      CustomerListResponse,
      CustomerListParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.set("search", params?.search?.trim() ?? "");
        searchParams.set("status", params?.status ?? "");
        searchParams.set("per_page", String(params?.per_page ?? 10));
        if (params?.cursor) {
          searchParams.set("cursor", params.cursor);
        }

        return {
          url: `organisation/customer/list?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["CustomerList"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),

    getCustomerOrders: build.query<CustomerOrdersResponse, CustomerOrdersParams>({
      query: ({
        customerId,
        search,
        status,
        search_from,
        search_to,
        per_page,
        cursor,
      }) => {
        const searchParams = new URLSearchParams();
        searchParams.set("search", search?.trim() ?? "");
        searchParams.set("status", status && status !== "all" ? status : "");
        if (search_from?.trim()) {
          searchParams.set("search_from", search_from.trim());
        }
        if (search_to?.trim()) {
          searchParams.set("search_to", search_to.trim());
        }
        searchParams.set("per_page", String(per_page ?? 10));
        if (cursor) searchParams.set("cursor", cursor);

        return {
          url: `organisation/customer/${customerId}/orders?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "CustomerOrders", id: String(arg.customerId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),

    getCustomerProducts: build.query<
      CustomerProductsResponse,
      CustomerProductsParams
    >({
      query: ({
        customerId,
        search,
        status,
        search_from,
        search_to,
        per_page,
        cursor,
      }) => {
        const searchParams = new URLSearchParams();
        searchParams.set("search", search?.trim() ?? "");
        searchParams.set("status", status && status !== "all" ? status : "");
        if (search_from?.trim()) {
          searchParams.set("search_from", search_from.trim());
        }
        if (search_to?.trim()) {
          searchParams.set("search_to", search_to.trim());
        }
        searchParams.set("per_page", String(per_page ?? 10));
        if (cursor) searchParams.set("cursor", cursor);

        return {
          url: `organisation/customer/${customerId}/products?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "CustomerProducts", id: String(arg.customerId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),

    getCustomerOverview: build.query<
      CustomerOverviewResponse,
      { customerId: number | string }
    >({
      query: ({ customerId }) => ({
        url: `organisation/customer/${customerId}/overview`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        { type: "CustomerOverview", id: String(arg.customerId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
  }),
});

export const {
  useGetCustomerListQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerProductsQuery,
  useGetCustomerOverviewQuery,
} = customersApi;
