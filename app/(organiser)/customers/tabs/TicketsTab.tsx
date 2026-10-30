"use client";

import { useEffect, useMemo, useState } from "react";
import {
  customerProductAmount,
  customerProductLabel,
  customerProductOrderId,
  customerProductQuantity,
  customerProductsPagination,
  customerProductTicketId,
  customerProductTicketStatus,
  normalizeCustomerProducts,
  useGetCustomerProductsQuery,
  type CustomerProduct,
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

type TicketsTabProps = {
  customerId: number;
};

export default function TicketsTab({ customerId }: TicketsTabProps) {
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

  function formatProductDateTime(value: string | null | undefined) {
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

  const { data, isLoading, isFetching, isError } = useGetCustomerProductsQuery({
    customerId,
    search: debouncedSearch.trim(),
    status: statusFilter === "all" ? "" : statusFilter,
    search_from: searchFrom || undefined,
    search_to: searchTo || undefined,
    per_page: pageSize,
    cursor,
  });

  const products = useMemo(
    () => normalizeCustomerProducts(data?.data),
    [data?.data],
  );

  const pagination = customerProductsPagination(data?.data);
  const canGoNext =
    Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const paginationTotal =
    pagination?.total != null
      ? pagination.total
      : canGoNext
        ? page * pageSize + 1
        : (page - 1) * pageSize + products.length;

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

  const actions = useMemo<ActionMenuItem<CustomerProduct>[]>(
    () => [
      {
        key: "view",
        label: "View product",
        onClick: () => setOpenActionId(null),
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<CustomerProduct>[]>(
    () => [
      {
        id: "ticketId",
        header: "Ticket ID",
        cell: ({ row }) => customerProductTicketId(row),
      },
      {
        id: "orderId",
        header: "Order ID",
        cell: ({ row }) => customerProductOrderId(row),
      },
      {
        id: "event",
        header: "Event",
        cell: ({ row }) => row.event_name?.trim() || "—",
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => customerProductLabel(row),
      },
      {
        id: "quantity",
        header: "Quantity",
        cell: ({ row }) => customerProductQuantity(row),
      },
      {
        id: "totalPrice",
        header: "Total price",
        cell: ({ row }) => customerProductAmount(row),
      },
      {
        id: "status",
        header: "Ticket status",
        cell: ({ row }) => (
          <StatusBadge
            status={customerProductTicketStatus(row)}
            className="datatable-status"
          />
        ),
      },
      {
        id: "date",
        header: "Date & time",
        cell: ({ row }) =>
          formatProductDateTime(row.paid_at || row.created_at),
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
            ariaLabel={`Actions for ${customerProductTicketId(row)}`}
          />
        ),
      },
    ],
    [actions, openActionId, organisationTimezone],
  );

  return (
    <section className="customer-tab-panel" aria-label="Customer products">
      <div className="customer-tab-header">
        <h2 className="customer-tab-title">Products</h2>
        <ExportButton
          fileName="customer-products"
          headers={[
            "Ticket ID",
            "Order ID",
            "Event",
            "Product",
            "Quantity",
            "Total price",
            "Ticket status",
            "Date & time",
          ]}
          rows={products.map((item) => [
            customerProductTicketId(item),
            customerProductOrderId(item),
            item.event_name?.trim() || "—",
            customerProductLabel(item),
            customerProductQuantity(item),
            customerProductAmount(item),
            customerProductTicketStatus(item),
            formatProductDateTime(item.paid_at || item.created_at),
          ])}
        />
      </div>

      <DataTable
        columns={columns}
        data={products}
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
        emptyMessage="No products match these filters."
      />
    </section>
  );
}
