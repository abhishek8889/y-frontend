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

type CustomerProduct = {
  id: string;
  product: string;
  orderId: string;
  offer: string;
  amount: string;
  event: string;
  status: string;
  date: string;
  month: string;
};

const customerProducts: CustomerProduct[] = [
  {
    id: "#TCK-4821",
    product: "Adult GA",
    orderId: "#ORD-4821",
    offer: "Late",
    amount: "£18.00",
    event: "The Closing Party",
    status: "paid",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#TCK-4822",
    product: "VIP",
    orderId: "#ORD-4819",
    offer: "General",
    amount: "£25.00",
    event: "Comedy Nights",
    status: "paid",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#TCK-4823",
    product: "VIP",
    orderId: "#ORD-4806",
    offer: "General",
    amount: "£25.00",
    event: "Summer Party",
    status: "paid",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#TCK-4824",
    product: "VIP",
    orderId: "#ORD-4798",
    offer: "General",
    amount: "£25.00",
    event: "Summer Party",
    status: "refunded",
    date: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "#TCK-4788",
    product: "Adult GA",
    orderId: "#ORD-4782",
    offer: "General",
    amount: "£9.00",
    event: "Saturday Social",
    status: "paid",
    date: "Jun 18, 2026, 09:12 AM",
    month: "2026-06",
  },
  {
    id: "#TCK-4789",
    product: "Adult GA",
    orderId: "#ORD-4782",
    offer: "General",
    amount: "£9.00",
    event: "Saturday Social",
    status: "paid",
    date: "Jun 18, 2026, 09:12 AM",
    month: "2026-06",
  },
];

function TicketQr() {
  const size = 21;
  const finder = (row: number, column: number) => {
    const corners = [
      [0, 0],
      [0, 14],
      [14, 0],
    ];
    return corners.some(([top, left]) => {
      const inside = row >= top && row < top + 7 && column >= left && column < left + 7;
      if (!inside) return false;
      const edge = row === top || row === top + 6 || column === left || column === left + 6;
      const center = row >= top + 2 && row <= top + 4 && column >= left + 2 && column <= left + 4;
      return edge || center;
    });
  };
  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      if (finder(row, column)) return true;
      if ((row < 7 && column < 7) || (row < 7 && column > 13) || (row > 13 && column < 7)) {
        return false;
      }
      return (row * 7 + column * 11 + row * column) % 5 < 2;
    }),
  );

  return (
    <svg
      role="img"
      aria-label="Ticket QR code"
      viewBox={`0 0 ${size} ${size}`}
      className="h-9 w-9 bg-white"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="white" />
      {modules.flatMap((row, rowIndex) =>
        row.map((filled, columnIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex}
              y={rowIndex}
              width="1"
              height="1"
              fill="black"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export default function TicketsTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customerProducts.filter(
        (item) =>
          `${item.id} ${item.product} ${item.orderId} ${item.event}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (eventFilter === "all" || item.event === eventFilter) &&
          (statusFilter === "all" || item.status === statusFilter) &&
          (!month || item.month === month),
      ),
    [search, eventFilter, statusFilter, month],
  );

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const actions = useMemo<ActionMenuItem<CustomerProduct>[]>(
    () => [
      { key: "view", label: "View ticket", onClick: () => setOpenActionId(null) },
      { key: "resend", label: "Resend ticket email", onClick: () => setOpenActionId(null) },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<CustomerProduct>[]>(
    () => [
      { id: "id", header: "Ticket ID", accessorKey: "id" },
      { id: "product", header: "Product", accessorKey: "product" },
      { id: "orderId", header: "Order ID", accessorKey: "orderId" },
      { id: "offer", header: "Offer", accessorKey: "offer" },
      { id: "amount", header: "Amount", accessorKey: "amount" },
      { id: "event", header: "Event", accessorKey: "event" },
      {
        id: "qr",
        header: "QR code",
        cell: () => <TicketQr />,
      },
      {
        id: "status",
        header: "Ticket status",
        cell: ({ row }) => <StatusBadge status={row.status} className="datatable-status" />,
      },
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
    <section className="customer-tab-panel" aria-label="Customer products">
      <div className="customer-tab-header">
        <h2 className="customer-tab-title">Products</h2>
        <ExportButton
          fileName="customer-products"
          headers={[
            "Ticket ID",
            "Product",
            "Order ID",
            "Offer",
            "Amount",
            "Event",
            "Status",
            "Date",
          ]}
          rows={filtered.map((item) => [
            item.id,
            item.product,
            item.orderId,
            item.offer,
            item.amount,
            item.event,
            item.status,
            item.date,
          ])}
        />
      </div>

      <DataTable
        columns={columns}
        data={paged}
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
              ...Array.from(new Set(customerProducts.map((item) => item.event))).map((event) => ({
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
        pagination={{ page, pageSize, total: filtered.length }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        bodyHeightClassName={false}
        emptyMessage="No products match these filters."
      />
    </section>
  );
}
