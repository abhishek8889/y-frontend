"use client";

import { useMemo, useState } from "react";
import { DataTable, StatusBadge, type DataTableColumn } from "@/components/common";
import { ExportButton, TabSearch } from "./TabControls";

type RefundRow = {
  id: string;
  refundId: string;
  orderId: string;
  customer: string;
  email: string;
  amount: number;
  reason: string;
  date: string;
  status: string;
};

const initialRefunds: RefundRow[] = [
  {
    id: "1",
    refundId: "#REF-1204",
    orderId: "#ORD-4812",
    customer: "Jamie Lee",
    email: "jamie@example.com",
    amount: 100,
    reason: "Event rescheduled",
    date: "30 Aug 2026, 2:10 PM",
    status: "completed",
  },
  {
    id: "2",
    refundId: "#REF-1198",
    orderId: "#ORD-4799",
    customer: "Taylor Reed",
    email: "taylor@example.com",
    amount: 25,
    reason: "Duplicate purchase",
    date: "28 Aug 2026, 9:45 AM",
    status: "completed",
  },
  {
    id: "3",
    refundId: "#REF-1191",
    orderId: "#ORD-4788",
    customer: "Morgan Ellis",
    email: "morgan@example.com",
    amount: 50,
    reason: "Customer request",
    date: "27 Aug 2026, 6:20 PM",
    status: "pending",
  },
];

function formatGbp(amount: number) {
  return `£${amount.toFixed(2)}`;
}

export default function RefundsTab({ eventTitle }: { eventTitle: string }) {
  const [refunds] = useState(initialRefunds);
  const [search, setSearch] = useState("");
  const filteredRefunds = useMemo(
    () =>
      refunds.filter((row) => {
        const haystack = `${row.refundId} ${row.orderId} ${row.customer} ${row.email} ${row.reason}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [refunds, search],
  );

  const columns = useMemo<DataTableColumn<RefundRow>[]>(
    () => [
      { id: "refundId", header: "REFUND ID", accessorKey: "refundId" },
      { id: "orderId", header: "ORDER ID", accessorKey: "orderId" },
      {
        id: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => (
          <div>
            <strong className="block font-bold">{row.customer}</strong>
            <span className="text-[14px] text-[#666]">{row.email}</span>
          </div>
        ),
      },
      {
        id: "amount",
        header: "AMOUNT",
        cell: ({ row }) => formatGbp(row.amount),
      },
      { id: "reason", header: "REASON", accessorKey: "reason" },
      { id: "date", header: "DATE", accessorKey: "date" },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => <StatusBadge status={row.status} className="text-[14px]" />,
      },
    ],
    [],
  );

  return (
    <section className="pt-4" aria-label={`${eventTitle} refunds`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-[26px] font-bold uppercase leading-none tracking-[-0.03em] text-black">
          Refunds
        </h3>
        <ExportButton
          fileName="event-refunds"
          headers={["Refund ID", "Order ID", "Customer", "Email", "Amount", "Reason", "Date", "Status"]}
          rows={filteredRefunds.map((row) => [
            row.refundId,
            row.orderId,
            row.customer,
            row.email,
            row.amount,
            row.reason,
            row.date,
            row.status,
          ])}
        />
      </div>

      <TabSearch value={search} onChange={setSearch} />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredRefunds}
          getRowId={(row) => row.id}
          features={{ search: false, filters: false, pagination: false }}
          bodyHeightClassName={false}
          emptyMessage="No refunds match your search."
        />
      </div>
    </section>
  );
}
