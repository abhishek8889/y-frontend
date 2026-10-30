"use client";

import { useMemo, useState } from "react";
import {
  formatSalesChannel,
  normalizeEventOrderList,
  orderTicketSummary,
  useGetEventOrderDetailsQuery,
  useGetEventOrdersQuery,
  type EventOrderListItem,
} from "@/apis/organisation/eventOrdersApi";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import { OrderDetailsDrawer } from "@/components/organiser/events/OrderDetailsDrawer";
import { RefundOrderModal } from "@/components/organiser/events/RefundOrderModal";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";
import { ExportButton, ResultNotice } from "./TabControls";

type OrdersTabProps = {
  eventId: number;
  eventTitle: string;
};

export default function OrdersTab({ eventId, eventTitle }: OrdersTabProps) {
  const organisationTimezone = useOrganisationTimezone();

  function formatOrderDate(value: string | null | undefined) {
    return formatDateTime(value, {
      includeYear: true,
      emptyLabel: "—",
      timeZone: organisationTimezone,
    });
  }

  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState("");
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [detailsOrderId, setDetailsOrderId] = useState<number | null>(null);
  const [refundOrderId, setRefundOrderId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError } = useGetEventOrdersQuery({
    eventId,
  });

  const {
    data: detailsData,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    isError: isDetailsError,
  } = useGetEventOrderDetailsQuery(detailsOrderId as number, {
    skip: detailsOrderId == null,
  });

  const { data: refundDetailsData } = useGetEventOrderDetailsQuery(
    refundOrderId as number,
    { skip: refundOrderId == null },
  );

  const orders = useMemo(() => normalizeEventOrderList(data?.data), [data?.data]);

  const ticketOptions = useMemo(() => {
    const names = new Set<string>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        if (item.ticket_name?.trim()) names.add(item.ticket_name.trim());
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const sourceOptions = useMemo(() => {
    const channels = new Set<string>();
    for (const order of orders) {
      if (order.sales_channel?.trim()) channels.add(order.sales_channel.trim());
    }
    return Array.from(channels).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const ticketSummary = orderTicketSummary(order);
      const matchesSearch =
        !query ||
        [
          order.unique_id,
          order.customer_name,
          order.customer_email,
          ticketSummary.label,
          order.status,
          order.sales_channel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesTicket =
        ticketFilter === "all" ||
        (order.items ?? []).some((item) => item.ticket_name === ticketFilter);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSource =
        sourceFilter === "all" || order.sales_channel === sourceFilter;

      return matchesSearch && matchesTicket && matchesStatus && matchesSource;
    });
  }, [orders, search, ticketFilter, statusFilter, sourceFilter]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const orderActions = useMemo<ActionMenuItem<EventOrderListItem>[]>(
    () => [
      {
        key: "view",
        label: "View details",
        onClick: (order) => {
          setDetailsOrderId(order.id);
          setOpenActionId(null);
        },
      },
      {
        key: "pdf",
        label: "Download tickets PDF",
        hidden: (order) => !order.tickets_pdf_path?.trim(),
        onClick: (order) => {
          const url = order.tickets_pdf_path?.trim();
          if (url) window.open(url, "_blank", "noopener,noreferrer");
          setOpenActionId(null);
        },
      },
      {
        key: "resend",
        label: "Resend ticket email",
        onClick: (order) => {
          setNotice(`Resend email is not available yet for ${order.unique_id}.`);
          setOpenActionId(null);
        },
      },
      {
        key: "refund",
        label: "Issue refund",
        variant: "danger",
        hidden: (order) => {
          const status = String(order.status ?? "").toLowerCase();
          return status === "refunded" || status === "cancelled";
        },
        onClick: (order) => {
          setRefundOrderId(order.id);
          setOpenActionId(null);
        },
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<EventOrderListItem>[]>(
    () => [
      {
        id: "orderId",
        header: "ORDER ID",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[14px] font-normal text-black">
            {`#${row.unique_id}`}
          </span>
        ),
      },
      {
        id: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <strong className="block font-bold">{row.customer_name || "—"}</strong>
            <span className="text-[14px] text-[#666]">{row.customer_email || "—"}</span>
          </div>
        ),
      },
      {
        id: "tickets",
        header: "TICKETS",
        cell: ({ row }) => {
          const summary = orderTicketSummary(row);
          return `${summary.label} × ${summary.quantity}`;
        },
      },
      {
        id: "source",
        header: "SOURCE",
        cell: ({ row }) => formatSalesChannel(row.sales_channel),
      },
      {
        id: "amount",
        header: "AMOUNT",
        cell: ({ row }) => row.formatted_total || `${row.currency_sign || "£"}${row.total_amount || "0.00"}`,
      },
      {
        id: "date",
        header: "DATE",
        cell: ({ row }) => formatOrderDate(row.paid_at || row.created_at),
      },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => <StatusBadge status={row.status} className="datatable-status" />,
      },
      {
        id: "actions",
        header: "ACTION",
        align: "center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={orderActions}
            open={openActionId === row.id}
            onOpenChange={(nextOpen) => setOpenActionId(nextOpen ? row.id : null)}
            ariaLabel={`Open actions for ${row.unique_id}`}
          />
        ),
      },
    ],
    [openActionId, orderActions],
  );

  return (
    <section className="pt-5" aria-label={`${eventTitle} orders`}>
      <div className="event-panel-header">
        <div>
          <h3 className="event-panel-title">Orders</h3>
          <p className="event-panel-subtitle">Search, filter, and export orders for this event.</p>
        </div>
        <ExportButton
          fileName="event-orders"
          headers={[
            "Order ID",
            "Customer",
            "Email",
            "Tickets",
            "Source",
            "Amount",
            "Date",
            "Status",
          ]}
          rows={filteredOrders.map((order) => {
            const summary = orderTicketSummary(order);
            return [
              order.unique_id,
              order.customer_name || "",
              order.customer_email || "",
              `${summary.label} × ${summary.quantity}`,
              formatSalesChannel(order.sales_channel),
              order.formatted_total || order.total_amount || "",
              formatOrderDate(order.paid_at || order.created_at),
              order.status,
            ];
          })}
        />
      </div>

      {notice ? <ResultNotice onClose={() => setNotice("")}>{notice}</ResultNotice> : null}

      <DataTable
        columns={columns}
        data={pagedOrders}
        getRowId={(row) => row.id}
        features={{
          search: true,
          filters: true,
          pagination: true,
          pageSize: true,
        }}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          placeholder: "Search..",
        }}
        filters={[
          {
            key: "ticket",
            label: "Ticket type",
            type: "select",
            value: ticketFilter,
            options: [
              { value: "all", label: "All ticket type" },
              ...ticketOptions.map((name) => ({ value: name, label: name })),
            ],
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: statusFilter,
            options: [
              { value: "all", label: "All status" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "partially_refunded", label: "Partially refunded" },
              { value: "refunded", label: "Refunded" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            key: "source",
            label: "Source",
            type: "select",
            value: sourceFilter,
            options: [
              { value: "all", label: "All sources" },
              ...sourceOptions.map((channel) => ({
                value: channel,
                label: formatSalesChannel(channel),
              })),
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "ticket") setTicketFilter(value);
          if (key === "status") setStatusFilter(value);
          if (key === "source") setSourceFilter(value);
          setPage(1);
        }}
        pagination={{
          page,
          pageSize,
          total: filteredOrders.length,
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        isLoading={isLoading || isFetching}
        isError={isError}
        errorMessage="Unable to load orders."
        emptyMessage="No orders match these filters."
        bodyHeightClassName={false}
      />

      <OrderDetailsDrawer
        open={detailsOrderId != null}
        order={detailsData?.data ?? null}
        eventTitle={eventTitle}
        isLoading={isDetailsLoading || isDetailsFetching}
        isError={isDetailsError}
        onClose={() => setDetailsOrderId(null)}
      />

      <RefundOrderModal
        open={refundOrderId != null}
        order={
          refundDetailsData?.data?.id === refundOrderId
            ? refundDetailsData.data
            : null
        }
        eventTitle={eventTitle}
        onClose={() => setRefundOrderId(null)}
        onSuccess={() => setRefundOrderId(null)}
      />
    </section>
  );
}
