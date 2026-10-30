"use client";

import { useEffect, useMemo, useState } from "react";
import {
  customerOrderAmount,
  customerOrderEventNames,
  customerOrderProductLines,
  customerOrdersPagination,
  formatCustomerOrderPayment,
  formatCustomerOrderSource,
  normalizeCustomerOrders,
  useGetCustomerOrdersQuery,
  type CustomerOrder,
} from "@/apis/organisation/customersApi";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";
import {
  DateRangeFilter,
  ExportButton,
} from "../../events/tabs/TabControls";

type OrdersTabProps = {
  customerId: number;
};

export default function OrdersTab({ customerId }: OrdersTabProps) {
  const organisationTimezone = useOrganisationTimezone();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  function formatOrderDateTime(value: string | null | undefined) {
    return formatDateTime(value, {
      withAt: false,
      includeYear: true,
      emptyLabel: "—",
      timeZone: organisationTimezone,
    });
  }

  useEffect(() => {
    setCursor(undefined);
    setPage(1);
  }, [debouncedSearch, statusFilter, searchFrom, searchTo, pageSize]);

  const { data, isLoading, isFetching, isError } = useGetCustomerOrdersQuery({
    customerId,
    search: debouncedSearch.trim(),
    status: statusFilter === "all" ? "" : statusFilter,
    search_from: searchFrom || undefined,
    search_to: searchTo || undefined,
    per_page: pageSize,
    cursor,
  });

  const orders = useMemo(
    () => normalizeCustomerOrders(data?.data),
    [data?.data],
  );

  const pagination = customerOrdersPagination(data?.data);
  const canGoNext =
    Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const paginationTotal =
    pagination?.total != null
      ? pagination.total
      : canGoNext
        ? page * pageSize + 1
        : (page - 1) * pageSize + orders.length;

  function handlePageChange(nextPage: number) {
    if (nextPage > page && pagination?.next_cursor) {
      setCursor(pagination.next_cursor);
      setPage(nextPage);
      return;
    }

    if (nextPage < page && pagination?.prev_cursor) {
      setCursor(pagination.prev_cursor);
      setPage(nextPage);
    }
  }

  const actions = useMemo<ActionMenuItem<CustomerOrder>[]>(
    () => [
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
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<CustomerOrder>[]>(
    () => [
      {
        id: "orderId",
        header: "Order ID",
        cell: ({ row }) => `#${row.unique_id}`,
      },
      {
        id: "event",
        header: "Event",
        cell: ({ row }) => customerOrderEventNames(row),
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => {
          const lines = customerOrderProductLines(row);
          const preview = lines[0] ?? "—";
          const extraCount = Math.max(0, lines.length - 1);
          return (
            <span className="datatable-cell-preview">
              {preview}
              {extraCount > 0 ? ` +${extraCount}` : ""}
            </span>
          );
        },
        tooltip: {
          label: "Product details",
          content: ({ row }) => {
            const lines = customerOrderProductLines(row);
            if (!lines.length || lines[0] === "—") return null;
            return lines.join("\n");
          },
        },
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => customerOrderAmount(row),
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => formatCustomerOrderSource(row).channel,
        tooltip: {
          label: "Request origin",
          content: ({ row }) => formatCustomerOrderSource(row).origin,
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.status} className="datatable-status" />
        ),
      },
      {
        id: "paymentMethod",
        header: "Payment method",
        cell: ({ row }) => formatCustomerOrderPayment(row.payment),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) =>
          formatOrderDateTime(row.paid_at || row.created_at),
      },
      {
        id: "actions",
        header: "Action",
        align: "center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={actions}
            open={openActionId === row.id}
            onOpenChange={(next) => setOpenActionId(next ? row.id : null)}
            ariaLabel={`Actions for ${row.unique_id}`}
          />
        ),
      },
    ],
    [actions, openActionId],
  );

  return (
    <section className="customer-tab-panel" aria-label="Customer orders">
      <div className="customer-tab-header">
        <h2 className="customer-tab-title">Orders</h2>
        <ExportButton
          fileName="customer-orders"
          headers={[
            "Order ID",
            "Event",
            "Product",
            "Amount",
            "Source",
            "Status",
            "Payment method",
            "Date",
          ]}
          rows={orders.map((order) => {
            const source = formatCustomerOrderSource(order);
            return [
              `#${order.unique_id}`,
              customerOrderEventNames(order),
              customerOrderProductLines(order).join("; "),
              customerOrderAmount(order),
              source.origin
                ? `${source.channel} (${source.origin})`
                : source.channel,
              order.status,
              formatCustomerOrderPayment(order.payment),
              formatOrderDateTime(order.paid_at || order.created_at),
            ];
          })}
        />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        getRowId={(row) => row.id}
        features={{
          search: true,
          filters: true,
          pagination: true,
          pageSize: true,
        }}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search..",
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            value: statusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "partially_refunded", label: "Partially refunded" },
              { value: "refunded", label: "Refunded" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value);
        }}
        toolbarExtra={
          <DateRangeFilter
            from={searchFrom}
            to={searchTo}
            onFromChange={setSearchFrom}
            onToChange={setSearchTo}
          />
        }
        pagination={{ page, pageSize, total: paginationTotal }}
        onPageChange={handlePageChange}
        onPageSizeChange={setPageSize}
        isLoading={isLoading || isFetching}
        isError={isError}
        bodyHeightClassName={false}
        emptyMessage="No orders match these filters."
      />
    </section>
  );
}
