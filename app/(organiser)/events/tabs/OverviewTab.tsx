"use client";

import { useMemo } from "react";
import type { OrganisationEvent } from "@/apis/events/eventsApi";
import { DataTable, GridCard, StatusBadge, type DataTableColumn } from "@/components/common";
import { getEventPlaceholderMetrics } from "@/components/organiser/events/EventListCard";
import { Button } from "@/components/ui/Button";

type RecentOrder = {
  id: string;
  orderId: string;
  customer: string;
  tickets: number;
  amount: number;
  date: string;
  status: string;
};

const revenueBySource = [
  { label: "Website", value: 62 },
  { label: "Box office", value: 24 },
  { label: "Partner", value: 9 },
  { label: "Complimentary", value: 5 },
];

const recentOrdersSeed: RecentOrder[] = [
  {
    id: "1",
    orderId: "#ORD-4821",
    customer: "Smith Jon",
    tickets: 2,
    amount: 50,
    date: "01 Sep 2026, 10:00 AM",
    status: "paid",
  },
  {
    id: "2",
    orderId: "#ORD-4819",
    customer: "Alex Morgan",
    tickets: 1,
    amount: 25,
    date: "31 Aug 2026, 4:15 PM",
    status: "paid",
  },
  {
    id: "3",
    orderId: "#ORD-4812",
    customer: "Jamie Lee",
    tickets: 4,
    amount: 100,
    date: "30 Aug 2026, 11:30 AM",
    status: "refunded",
  },
];

function formatGbp(amount: number) {
  return `£${amount.toLocaleString("en-GB")}`;
}

export default function OverviewTab({
  event,
  onViewAllOrders,
}: {
  event: OrganisationEvent;
  onViewAllOrders?: () => void;
}) {
  const { total, sold, gross } = getEventPlaceholderMetrics(event);
  const netSales = Math.round(gross * 0.92);
  const checkedIn = Math.min(sold, Math.round(sold * 0.72));

  const overviewItems = useMemo(
    () => [
      {
        id: "tickets-sold",
        label: "Tickets Sold",
        value: `${sold}/${total}`,
        description: total > 0 ? `${Math.round((sold / total) * 100)}% of capacity` : "No capacity set",
      },
      {
        id: "gross-sales",
        label: "Gross Sales",
        value: formatGbp(gross),
        description: "Before refunds and fees",
      },
      {
        id: "net-sales",
        label: "Net Sales",
        value: formatGbp(netSales),
        description: "After refunds and fees",
      },
      {
        id: "checked-in",
        label: "Attendees Checked In",
        value: `${checkedIn}/${sold || 0}`,
        description: sold > 0 ? `${Math.round((checkedIn / sold) * 100)}% checked in` : "No tickets sold",
      },
    ],
    [checkedIn, gross, netSales, sold, total],
  );

  const orderColumns = useMemo<DataTableColumn<RecentOrder>[]>(
    () => [
      { id: "orderId", header: "ORDER ID", accessorKey: "orderId" },
      { id: "customer", header: "CUSTOMER", accessorKey: "customer" },
      {
        id: "tickets",
        header: "TICKETS",
        cell: ({ row }) => String(row.tickets),
      },
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
    ],
    [],
  );

  return (
    <section className="pt-4" aria-label={`${event.name} overview`}>
      <h3 className="font-heading mb-6 text-[26px] font-bold uppercase leading-none tracking-[-0.03em] text-black">
        Overview
      </h3>

      <GridCard items={overviewItems} columns={4} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section
          className="flex min-h-[220px] flex-col border border-black p-4"
          aria-label="Sales trend placeholder"
        >
          <h4 className="font-heading text-[14px] font-bold uppercase text-black">Sales trend</h4>
          <div className="mt-4 flex flex-1 items-center justify-center border border-dashed border-black/25 bg-black/[0.02] px-4 py-10 text-center text-[13px] text-black/45">
            Chart placeholder — daily ticket sales
          </div>
        </section>
        <section
          className="flex min-h-[220px] flex-col border border-black p-4"
          aria-label="Check-in trend placeholder"
        >
          <h4 className="font-heading text-[14px] font-bold uppercase text-black">Check-in trend</h4>
          <div className="mt-4 flex flex-1 items-center justify-center border border-dashed border-black/25 bg-black/[0.02] px-4 py-10 text-center text-[13px] text-black/45">
            Chart placeholder — attendees checked in over time
          </div>
        </section>
      </div>

      <section className="mt-6 border border-black p-4" aria-label="Revenue by source">
        <h4 className="font-heading text-[14px] font-bold uppercase text-black">Revenue by source</h4>
        <ul className="mt-5 space-y-4">
          {revenueBySource.map((item) => (
            <li key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                <span className="font-bold uppercase text-black">{item.label}</span>
                <span className="text-[#6F6E69]">{item.value}%</span>
              </div>
              <div className="h-[8px] w-full bg-black/10">
                <div className="h-full bg-black" style={{ width: `${item.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" aria-label="Recent orders">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-heading text-[18px] font-bold uppercase text-black">Recent orders</h4>
          {onViewAllOrders ? (
            <Button
              type="button"
              onClick={onViewAllOrders}
              className="h-[34px] rounded-[3px] border border-black bg-white px-3 text-[11px] font-bold uppercase text-black hover:bg-black hover:text-white"
            >
              View all
            </Button>
          ) : null}
        </div>
        <DataTable
          columns={orderColumns}
          data={recentOrdersSeed}
          getRowId={(row) => row.id}
          features={{ search: false, filters: false, pagination: false }}
          bodyHeightClassName={false}
        />
      </section>
    </section>
  );
}
