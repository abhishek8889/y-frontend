"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import {
  OrderDetailsModal,
  type EventOrderDetails,
} from "@/components/organiser/events/OrderDetailsModal";
import { ExportButton, ResultNotice } from "./TabControls";

type EventOrder = EventOrderDetails;

const initialOrders: EventOrder[] = [
  {
    id: "1",
    orderId: "#ORD-4821",
    customerName: "Smith Jon",
    customerEmail: "user@gmail.com",
    tickets: "Adult GA",
    ticketCount: 2,
    payment: "Card",
    source: "Website",
    amount: 50,
    status: "paid",
    date: "01 Sep 2026, 10:00 AM",
  },
  {
    id: "2",
    orderId: "#ORD-4819",
    customerName: "Alex Morgan",
    customerEmail: "alex@example.com",
    tickets: "VIP",
    ticketCount: 1,
    payment: "Apple Pay",
    source: "Website",
    amount: 75,
    status: "paid",
    date: "31 Aug 2026, 4:15 PM",
  },
  {
    id: "3",
    orderId: "#ORD-4812",
    customerName: "Jamie Lee",
    customerEmail: "jamie@example.com",
    tickets: "Adult GA",
    ticketCount: 4,
    payment: "Card",
    source: "Box office",
    amount: 100,
    status: "refunded",
    date: "30 Aug 2026, 11:30 AM",
  },
  {
    id: "4",
    orderId: "#ORD-4808",
    customerName: "Priya Shah",
    customerEmail: "priya@example.com",
    tickets: "Early Bird",
    ticketCount: 2,
    payment: "Cash",
    source: "Box office",
    amount: 36,
    status: "paid",
    date: "29 Aug 2026, 1:05 PM",
  },
  {
    id: "5",
    orderId: "#ORD-4801",
    customerName: "Chris Evans",
    customerEmail: "chris@example.com",
    tickets: "VIP",
    ticketCount: 3,
    payment: "Card",
    source: "Partner",
    amount: 225,
    status: "paid",
    date: "28 Aug 2026, 9:40 AM",
  },
];

function formatGbp(amount: number) {
  return `£${amount.toFixed(2)}`;
}

export default function OrdersTab({ eventTitle }: { eventTitle: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState("");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<EventOrder | null>(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch = `${order.orderId} ${order.customerName} ${order.customerEmail} ${order.tickets}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (ticketFilter === "all" || order.tickets === ticketFilter) &&
          (statusFilter === "all" || order.status === statusFilter) &&
          (sourceFilter === "all" || order.source === sourceFilter)
        );
      }),
    [orders, search, ticketFilter, statusFilter, sourceFilter],
  );

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const handleRefund = useCallback((order: EventOrder) => {
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? { ...item, status: "refunded" } : item)),
    );
    setNotice(`${order.orderId} has been marked as refunded.`);
    setDetailsOrder((current) =>
      current?.id === order.id ? { ...order, status: "refunded" } : current,
    );
  }, []);

  const orderActions = useMemo<ActionMenuItem<EventOrder>[]>(
    () => [
      {
        key: "view",
        label: "View details",
        onClick: (order) => setDetailsOrder(order),
      },
      {
        key: "refund",
        label: "Refund order",
        hidden: (order) => order.status === "refunded",
        onClick: (order) => handleRefund(order),
      },
      {
        key: "resend",
        label: "Resend ticket email",
        onClick: (order) => setNotice(`Ticket email resent for ${order.orderId}.`),
      },
    ],
    [handleRefund],
  );

  const columns = useMemo<DataTableColumn<EventOrder>[]>(
    () => [
      { id: "orderId", header: "ORDER ID", accessorKey: "orderId" },
      {
        id: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => (
          <div>
            <strong className="block font-bold">{row.customerName}</strong>
            <span className="text-[14px] text-[#666]">{row.customerEmail}</span>
          </div>
        ),
      },
      {
        id: "tickets",
        header: "TICKETS",
        cell: ({ row }) => `${row.tickets} × ${row.ticketCount}`,
      },
      { id: "payment", header: "PAYMENT", accessorKey: "payment" },
      { id: "source", header: "SOURCE", accessorKey: "source" },
      {
        id: "amount",
        header: "AMOUNT",
        cell: ({ row }) => formatGbp(row.amount),
      },
      { id: "date", header: "DATE", accessorKey: "date" },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => <StatusBadge status={row.status} className="text-[14px]" />,
      },
      {
        id: "actions",
        header: "ACTION",
        align: "center",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={orderActions}
            open={openActionId === row.id}
            onOpenChange={(nextOpen) => setOpenActionId(nextOpen ? row.id : null)}
            ariaLabel={`Open actions for ${row.orderId}`}
          />
        ),
      },
    ],
    [openActionId, orderActions],
  );

  return (
    <section className="pt-4" aria-label={`${eventTitle} orders`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-[22px] font-bold uppercase leading-none tracking-[-0.03em] text-black sm:text-[26px]">
          Orders
        </h3>
        <ExportButton
          fileName="event-orders"
          headers={[
            "Order ID",
            "Customer",
            "Email",
            "Tickets",
            "Payment",
            "Source",
            "Amount",
            "Date",
            "Status",
          ]}
          rows={filteredOrders.map((order) => [
            order.orderId,
            order.customerName,
            order.customerEmail,
            `${order.tickets} × ${order.ticketCount}`,
            order.payment,
            order.source,
            order.amount,
            order.date,
            order.status,
          ])}
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
          placeholder: "SEARCH",
        }}
        filters={[
          {
            key: "ticket",
            label: "Ticket type",
            type: "select",
            value: ticketFilter,
            options: [
              { value: "all", label: "All ticket type" },
              { value: "Adult GA", label: "Adult GA" },
              { value: "VIP", label: "VIP" },
              { value: "Early Bird", label: "Early Bird" },
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
              { value: "refunded", label: "Refunded" },
            ],
          },
          {
            key: "source",
            label: "Source",
            type: "select",
            value: sourceFilter,
            options: [
              { value: "all", label: "All sources" },
              { value: "Website", label: "Website" },
              { value: "Box office", label: "Box office" },
              { value: "Partner", label: "Partner" },
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
        emptyMessage="No orders match these filters."
        bodyHeightClassName={false}
      />

      <OrderDetailsModal
        open={Boolean(detailsOrder)}
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />
    </section>
  );
}
