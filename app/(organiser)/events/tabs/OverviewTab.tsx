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
  email: string;
  tickets: number;
  paymentMethod: string;
  source: string;
  amount: number;
  date: string;
  time: string;
  status: string;
};

type TicketShare = {
  label: string;
  count: number;
  percent: number;
  color: string;
};

type RevenueSource = {
  label: string;
  amount: number;
  sold: number;
  capacity: number;
  note: string;
};

const ticketShares: TicketShare[] = [
  { label: "General Admission", count: 80, percent: 56, color: "#00bc75" },
  { label: "VIP", count: 40, percent: 28, color: "#2478ff" },
  { label: "Early Bird", count: 15, percent: 11, color: "#ff9d14" },
  { label: "Group", count: 7, percent: 5, color: "#aaaaac" },
];

const revenueBySource: RevenueSource[] = [
  { label: "Y Native", amount: 75848, sold: 152, capacity: 152, note: "Sold out" },
  { label: "HTFC", amount: 136629, sold: 220, capacity: 300, note: "73% sold" },
  { label: "Key Corner", amount: 42150, sold: 98, capacity: 180, note: "54% sold" },
  { label: "Box Office", amount: 18420, sold: 64, capacity: 120, note: "53% sold" },
];

const recentOrdersSeed: RecentOrder[] = [
  {
    id: "1",
    orderId: "#ORD-4821",
    customer: "John Doe",
    email: "sarah@email.com",
    tickets: 6,
    paymentMethod: "Stripe",
    source: "Website",
    amount: 150,
    date: "5 Dec 2026,",
    time: "19:18",
    status: "paid",
  },
  {
    id: "2",
    orderId: "#ORD-4819",
    customer: "Mike Bell",
    email: "sarah@email.com",
    tickets: 4,
    paymentMethod: "Cash",
    source: "Box Office",
    amount: 12,
    date: "5 Dec 2026,",
    time: "19:18",
    status: "paid",
  },
  {
    id: "3",
    orderId: "#ORD-4818",
    customer: "Laura Black",
    email: "sarah@email.com",
    tickets: 1,
    paymentMethod: "Stripe",
    source: "Box Office",
    amount: 3,
    date: "5 Dec 2026,",
    time: "19:18",
    status: "paid",
  },
];

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

function MetricProgress({
  percent,
  tone = "green",
}: {
  percent: number;
  tone?: "green" | "blue";
}) {
  return (
    <div className="event-progress" aria-hidden="true">
      <div className="event-progress-track" style={{ height: 6, maxWidth: 130 }}>
        <div
          className={`event-progress-fill ${tone === "blue" ? "event-progress-fill-blue" : ""}`}
          style={{ width: `${percent}%`, height: 6 }}
        />
      </div>
      <span className="event-progress-label event-progress-label-muted">{percent}%</span>
    </div>
  );
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
  const soldPercent = total > 0 ? Math.round((sold / total) * 100) : 0;
  const checkedPercent = sold > 0 ? Math.round((checkedIn / sold) * 100) : 0;
  const ticketTotal = ticketShares.reduce((sum, item) => sum + item.count, 0);

  const overviewItems = useMemo(
    () => [
      {
        id: "tickets-sold",
        label: "Tickets sold",
        value: `${sold}/${total}`,
        description: <MetricProgress percent={soldPercent} tone="green" />,
      },
      {
        id: "gross-sales",
        label: "Gross sales",
        value: formatMoney(gross),
        description: "Before refunds and fees",
      },
      {
        id: "net-sales",
        label: "Net Sales",
        value: formatMoney(netSales),
        description: "After refunds and fees",
      },
      {
        id: "checked-in",
        label: "Attendees checked in",
        value: `${checkedIn}/${sold || 0}`,
        description: <MetricProgress percent={checkedPercent} tone="blue" />,
      },
    ],
    [checkedIn, checkedPercent, gross, netSales, sold, soldPercent, total],
  );

  const orderColumns = useMemo<DataTableColumn<RecentOrder>[]>(
    () => [
      { id: "orderId", header: "Order ID", accessorKey: "orderId" },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p className="m-0 text-[12px] leading-[1.4] text-black">{row.customer}</p>
            <p className="m-0 text-[12px] leading-[1.4] text-[#6f6e69]">{row.email}</p>
          </div>
        ),
      },
      {
        id: "tickets",
        header: "Tickets",
        cell: ({ row }) => String(row.tickets),
      },
      { id: "paymentMethod", header: "Payment method", accessorKey: "paymentMethod" },
      { id: "source", header: "SOURCE", accessorKey: "source" },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => formatMoney(row.amount),
      },
      {
        id: "date",
        header: "date & Time",
        cell: ({ row }) => (
          <div>
            <p className="m-0 text-[12px] leading-[1.4] text-black">{row.date}</p>
            <p className="m-0 text-[12px] leading-[1.4] text-black">{row.time}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.status} className="datatable-status !text-[12px]" />
        ),
      },
    ],
    [],
  );

  return (
    <section className="pt-5" aria-label={`${event.name} overview`}>
      <div className="event-panel-header">
        <div>
          <h3 className="event-panel-title">Overview</h3>
          <p className="event-panel-subtitle">Sales, attendance, and recent activity for this event.</p>
        </div>
      </div>

      <GridCard items={overviewItems} columns={4} className="gap-[13px]" />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <section className="event-panel-section flex min-h-[301px] flex-col" aria-label="Ticket sales over time">
          <div className="flex items-center justify-between gap-3">
            <h4 className="event-panel-section-title">Ticket sales over time</h4>
            <span className="inline-flex h-[26px] items-center gap-1 rounded border border-black/28 px-3.5 text-[10px] text-black">
              Last 30 days
            </span>
          </div>
          <div className="mt-3 flex flex-1 flex-col justify-end">
            <div className="flex min-h-[193px] flex-1 items-end justify-center border border-dashed border-black/15 bg-black/[0.015] px-3 py-6 text-center text-[12px] text-black/40">
              Chart placeholder — tickets sold vs revenue
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-5">
              <span className="inline-flex items-center gap-2 text-[12px] font-heading font-bold uppercase text-black">
                <span className="size-2 rounded-full bg-[#00bc75]" aria-hidden />
                Tickets sold
              </span>
              <span className="inline-flex items-center gap-2 text-[12px] font-heading font-bold uppercase text-black">
                <span className="size-2 rounded-full bg-[#2478ff]" aria-hidden />
                Revenue ($)
              </span>
            </div>
          </div>
        </section>

        <section className="event-panel-section flex min-h-[301px] flex-col" aria-label="Sales by ticket type">
          <h4 className="event-panel-section-title">Sales by ticket type</h4>
          <div className="event-donut-body">
            <div className="event-donut event-donut-tickets">
              <div className="event-donut-center">
                <p className="event-donut-value">{ticketTotal}</p>
                <p className="event-donut-label">Tickets sold</p>
              </div>
            </div>
            <ul className="event-donut-legend">
              {ticketShares.map((item) => (
                <li key={item.label} className="event-donut-legend-row">
                  <span
                    className="event-donut-swatch"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-[12px] leading-[19px] text-black">
                    {item.label}
                  </span>
                  <span className="text-[12px] font-bold leading-[19px] text-black">{item.count}</span>
                  <span className="w-8 text-right text-[10px] leading-[19px] text-[#6f6e69]">
                    {item.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="event-panel-section mt-4" aria-label="Recent orders">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="event-panel-section-title">Recent Orders</h4>
          {onViewAllOrders ? (
            <Button type="button" onClick={onViewAllOrders} className="event-panel-ghost-btn">
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

      <section className="event-panel-section mt-4" aria-label="Revenue by source">
        <h4 className="event-panel-section-title">Revenue by Source</h4>
        <ul className="mt-3 space-y-3.5">
          {revenueBySource.map((item) => {
            const percent =
              item.capacity > 0 ? Math.round((item.sold / item.capacity) * 100) : 0;
            return (
              <li key={item.label} className="event-source-row">
                <div className="event-source-top">
                  <p className="event-source-name">{item.label}</p>
                  <p className="event-source-amount">{formatMoney(item.amount)}</p>
                </div>
                <div className="event-source-track">
                  <div className="event-source-fill" style={{ width: `${percent}%` }} />
                </div>
                <div className="event-source-foot">
                  <span>
                    Tickets: {item.sold} / {item.capacity} sold
                  </span>
                  <span>{item.note}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
