"use client";

import { useMemo, useState } from "react";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import { ExportButton, MonthFilter } from "../../events/tabs/TabControls";

type CustomerOrder = {
  id: string;
  event: string;
  products: string;
  quantity: number;
  amount: string;
  source: string;
  status: string;
  paymentMethod: string;
  date: string;
  month: string;
};

const customerOrders: CustomerOrder[] = [
  {
    id: "#ORD-4821",
    event: "The Closing Party",
    products: "3 x Adult GA",
    quantity: 3,
    amount: "£18.00",
    source: "Online Y native",
    status: "paid",
    paymentMethod: "Card",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#ORD-4819",
    event: "Comedy Nights",
    products: "4 x VIP",
    quantity: 4,
    amount: "£25.00",
    source: "Online Y native",
    status: "paid",
    paymentMethod: "Card",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#ORD-4806",
    event: "Summer Party",
    products: "1 x VIP",
    quantity: 1,
    amount: "£25.00",
    source: "Box Office",
    status: "pending",
    paymentMethod: "Card",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#ORD-4798",
    event: "Summer Party",
    products: "2 x VIP",
    quantity: 2,
    amount: "£25.00",
    source: "Online Y native",
    status: "refunded",
    paymentMethod: "Card",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#ORD-4782",
    event: "Saturday Social",
    products: "2 x Adult GA",
    quantity: 2,
    amount: "£18.00",
    source: "Website",
    status: "paid",
    paymentMethod: "Card",
    date: "Jun 18, 2026, 09:12 AM",
    month: "2026-06",
  },
];

export default function OrdersTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const filteredOrders = useMemo(
    () =>
      customerOrders.filter(
        (order) =>
          `${order.id} ${order.event} ${order.products} ${order.source}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (eventFilter === "all" || order.event === eventFilter) &&
          (statusFilter === "all" || order.status === statusFilter) &&
          (!month || order.month === month),
      ),
    [search, eventFilter, statusFilter, month],
  );

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const actions = useMemo<ActionMenuItem<CustomerOrder>[]>(
    () => [
      { key: "view", label: "View details", onClick: () => setOpenActionId(null) },
      { key: "pdf", label: "Download tickets PDF", onClick: () => setOpenActionId(null) },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<CustomerOrder>[]>(
    () => [
      { id: "id", header: "Order ID", accessorKey: "id" },
      { id: "event", header: "Event", accessorKey: "event" },
      { id: "products", header: "Products", accessorKey: "products" },
      {
        id: "quantity",
        header: "Quantity",
        cell: ({ row }) => String(row.quantity),
      },
      { id: "amount", header: "Amount", accessorKey: "amount" },
      { id: "source", header: "Source", accessorKey: "source" },
      {
        id: "status",
        header: "Ticket status",
        cell: ({ row }) => <StatusBadge status={row.status} className="datatable-status" />,
      },
      { id: "paymentMethod", header: "Payment method", accessorKey: "paymentMethod" },
      { id: "date", header: "Date & time", accessorKey: "date" },
      {
        id: "actions",
        header: "Action",
        align: "center",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={actions}
            open={openActionId === row.id}
            onOpenChange={(next) => setOpenActionId(next ? row.id : null)}
            ariaLabel={`Actions for ${row.id}`}
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
            "Products",
            "Quantity",
            "Amount",
            "Source",
            "Status",
            "Payment method",
            "Date",
          ]}
          rows={filteredOrders.map((order) => [
            order.id,
            order.event,
            order.products,
            order.quantity,
            order.amount,
            order.source,
            order.status,
            order.paymentMethod,
            order.date,
          ])}
        />
      </div>

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
            key: "event",
            label: "Event",
            type: "select",
            value: eventFilter,
            options: [
              { value: "all", label: "All events" },
              ...Array.from(new Set(customerOrders.map((order) => order.event))).map((event) => ({
                value: event,
                label: event,
              })),
            ],
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: statusFilter,
            options: [
              { value: "all", label: "All statuses" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "event") setEventFilter(value);
          if (key === "status") setStatusFilter(value);
          setPage(1);
        }}
        toolbarExtra={
          <MonthFilter
            value={month}
            onChange={(value) => {
              setMonth(value);
              setPage(1);
            }}
          />
        }
        pagination={{ page, pageSize, total: filteredOrders.length }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        bodyHeightClassName={false}
        emptyMessage="No orders match these filters."
      />
    </section>
  );
}
