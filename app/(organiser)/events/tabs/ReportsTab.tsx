"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataTable, GridCard, type DataTableColumn, type GridCardItem } from "@/components/common";
import { MonthFilter } from "./TabControls";

type SalesMetric = "revenue" | "tickets" | "orders";

type TicketTypeRow = {
  id: string;
  name: string;
  price: number;
  sold: number;
  remaining: number;
  capacity: number;
  revenue: number;
};

type DonutShare = {
  label: string;
  count: number | string;
  percent: number;
  color: string;
};

const ONLINE_COLOR = "#000000";
const BOX_OFFICE_COLOR = "#aaaaac";

const kpiItems: GridCardItem[] = [
  {
    id: "tickets-sold",
    label: "Tickets sold",
    value: (
      <span className="report-metric-value-row">
        <span>1,248</span>
        <span className="report-metric-delta report-metric-delta-up">+12%</span>
      </span>
    ),
    description: "of 1,500 total",
  },
  {
    id: "total-revenue",
    label: "Total revenue",
    value: (
      <span className="report-metric-value-row">
        <span>£18,720</span>
        <span className="report-metric-delta report-metric-delta-up">+8%</span>
      </span>
    ),
    description: "Before refunds and fees",
  },
  {
    id: "total-orders",
    label: "Total orders",
    value: (
      <span className="report-metric-value-row">
        <span>842</span>
        <span className="report-metric-delta report-metric-delta-up">+6%</span>
      </span>
    ),
    description: "Average order value £22.24",
  },
  {
    id: "checked-in",
    label: "Attendees checked in",
    value: (
      <span className="report-metric-value-row">
        <span>986</span>
        <span className="report-metric-delta report-metric-delta-muted">79%</span>
      </span>
    ),
    description: "of tickets sold",
  },
  {
    id: "refunds",
    label: "Refunds",
    value: (
      <span className="report-metric-value-row">
        <span>£240</span>
        <span className="report-metric-delta report-metric-delta-down">+15%</span>
      </span>
    ),
    description: "12 orders refunded",
  },
  {
    id: "net-revenue",
    label: "Net revenue",
    value: (
      <span className="report-metric-value-row">
        <span>£16,420</span>
        <span className="report-metric-delta report-metric-delta-down">−3%</span>
      </span>
    ),
    description: "After fees and refunds",
  },
];

const kpiRows = [kpiItems.slice(0, 3), kpiItems.slice(3, 6)];

const salesSeries = [
  { label: "1 Aug", online: 12, boxOffice: 8 },
  { label: "8 Aug", online: 18, boxOffice: 14 },
  { label: "15 Aug", online: 22, boxOffice: 16 },
  { label: "22 Aug", online: 28, boxOffice: 20 },
  { label: "29 Aug", online: 36, boxOffice: 36 },
  { label: "5 Sep", online: 30, boxOffice: 24 },
  { label: "12 Sep", online: 34, boxOffice: 22 },
  { label: "18 Sep", online: 40, boxOffice: 28 },
];

const salesBySource: DonutShare[] = [
  { label: "Online sales", count: "£14,400", percent: 77, color: ONLINE_COLOR },
  { label: "Box office", count: "£4,320", percent: 23, color: BOX_OFFICE_COLOR },
];

const attendanceShares: DonutShare[] = [
  { label: "Checked in", count: 986, percent: 79, color: ONLINE_COLOR },
  { label: "Not checked in", count: 262, percent: 21, color: BOX_OFFICE_COLOR },
  { label: "Total sold", count: 1248, percent: 100, color: ONLINE_COLOR },
];

const ticketTypes: TicketTypeRow[] = [
  {
    id: "ga",
    name: "General Admission",
    price: 15,
    sold: 840,
    remaining: 160,
    capacity: 1000,
    revenue: 12600,
  },
  {
    id: "vip",
    name: "VIP",
    price: 45,
    sold: 280,
    remaining: 20,
    capacity: 300,
    revenue: 12600,
  },
  {
    id: "early",
    name: "Early Bird",
    price: 12,
    sold: 128,
    remaining: 0,
    capacity: 128,
    revenue: 1536,
  },
];

const revenueBreakdown = [
  { label: "Gross ticket sales", value: "£18,720" },
  { label: "Discounts", value: "−£420" },
  { label: "Refunds", value: "−£240" },
  { label: "Platform fees (5%)", value: "−£936" },
  { label: "Payment processing (2.9%)", value: "−£704" },
];

const orderStats = [
  { label: "Total orders", value: "842" },
  { label: "Average order value", value: "£22.24" },
  { label: "Average tickets per order", value: "1.48" },
  { label: "New customers", value: "612", note: "73%" },
  { label: "Returning customers", value: "230", note: "27%" },
];

const refundStats = [
  { label: "Total refunds", value: "£240" },
  { label: "Refunded orders", value: "12" },
];

const disputeStats = [
  { label: "Disputed amount", value: "£60" },
  { label: "Open disputes", value: "1" },
  { label: "Resolved disputes", value: "1" },
];

function formatMoney(amount: number) {
  return `£${amount.toLocaleString("en-GB")}`;
}

function DonutLegend({ items }: { items: DonutShare[] }) {
  return (
    <ul className="event-donut-legend">
      {items.map((item) => (
        <li key={item.label} className="event-donut-legend-row">
          <span
            className="event-donut-swatch"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-[12px] leading-[19px] text-black">
            {item.label}
          </span>
          <span className="text-[12px] font-bold leading-[19px] text-black">
            {typeof item.count === "number" ? item.count.toLocaleString("en-GB") : item.count}
          </span>
          <span className="w-8 text-right text-[10px] leading-[19px] text-[#6f6e69]">
            {item.percent}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsTab({ eventTitle }: { eventTitle: string }) {
  const [month, setMonth] = useState("2026-06");
  const [salesMetric, setSalesMetric] = useState<SalesMetric>("revenue");

  const ticketColumns = useMemo<DataTableColumn<TicketTypeRow>[]>(
    () => [
      { id: "name", header: "Ticket type", accessorKey: "name" },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => formatMoney(row.price),
      },
      {
        id: "sold",
        header: "Sold",
        cell: ({ row }) => {
          const percent =
            row.capacity > 0 ? Math.round((row.sold / row.capacity) * 100) : 0;
          return (
            <div className="report-ticket-sold">
              <span className="report-ticket-sold-count">
                {row.sold.toLocaleString("en-GB")}/{row.capacity.toLocaleString("en-GB")}
              </span>
              <div className="event-progress" aria-hidden="true">
                <div className="event-progress-track">
                  <div
                    className="event-progress-fill event-progress-fill-black"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "remaining",
        header: "Remaining",
        cell: ({ row }) => row.remaining.toLocaleString("en-GB"),
      },
      {
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => formatMoney(row.revenue),
      },
    ],
    [],
  );

  return (
    <section className="pt-5" aria-label={`${eventTitle} reports`}>
      <div className="event-panel-header">
        <h3 className="event-panel-title">Report</h3>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      <div className="report-layout">
        <div className="report-metrics">
          {kpiRows.map((row, index) => (
            <GridCard
              key={`report-kpi-row-${index}`}
              items={row}
              columns={3}
              className="gap-[13px]"
            />
          ))}
        </div>

        <div className="report-grid-split">
          <section className="report-panel" aria-label="Sales performance">
            <div className="report-panel-header">
              <h4 className="report-panel-title">Sales performance</h4>
              <div className="report-metric-toggle" role="group" aria-label="Sales metric">
                {(
                  [
                    ["revenue", "Revenue"],
                    ["tickets", "Tickets"],
                    ["orders", "Orders"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="report-metric-toggle-btn"
                    aria-pressed={salesMetric === value}
                    onClick={() => setSalesMetric(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="report-chart" role="img" aria-label="Sales performance over time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e6e6e6" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#999", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#d0d0d0" }}
                  />
                  <YAxis
                    tick={{ fill: "#999", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{ borderColor: "#777", borderRadius: 0, fontSize: 12 }}
                    formatter={(value, name) => [
                      Number(value).toLocaleString("en-GB"),
                      name === "online" ? "Online" : "Box office",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="online"
                    stroke={ONLINE_COLOR}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="boxOffice"
                    stroke={BOX_OFFICE_COLOR}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="report-legend">
              <span className="report-legend-item">
                <span
                  className="report-legend-dot"
                  style={{ backgroundColor: ONLINE_COLOR }}
                  aria-hidden
                />
                Online sales
              </span>
              <span className="report-legend-item">
                <span
                  className="report-legend-dot"
                  style={{ backgroundColor: BOX_OFFICE_COLOR }}
                  aria-hidden
                />
                Box office sales
              </span>
            </div>
          </section>

          <section className="report-panel flex min-h-[301px] flex-col" aria-label="Sales by source">
            <h4 className="report-panel-title">Sales by source</h4>
            <div className="event-donut-body">
              <div className="event-donut event-donut-source">
                <div className="event-donut-center">
                  <p className="event-donut-value">£18,720</p>
                  <p className="event-donut-label">Total sales</p>
                </div>
              </div>
              <DonutLegend items={salesBySource} />
            </div>
          </section>
        </div>

        <div className="report-grid-split">
          <section className="report-panel" aria-label="Ticket types">
            <div className="report-panel-header">
              <h4 className="report-panel-title">Ticket types</h4>
            </div>
            <DataTable
              columns={ticketColumns}
              data={ticketTypes}
              getRowId={(row) => row.id}
              features={{
                search: false,
                filters: false,
                pagination: false,
                pageSize: false,
              }}
              bodyHeightClassName={false}
              headerBackground="#EEEEEE"
              emptyMessage="No ticket types yet."
            />
          </section>

          <section className="report-panel flex min-h-[301px] flex-col" aria-label="Attendance">
            <h4 className="report-panel-title">Attendance</h4>
            <div className="event-donut-body">
              <div className="event-donut event-donut-attendance">
                <div className="event-donut-center">
                  <p className="event-donut-value">79%</p>
                  <p className="event-donut-label">Attendance rate</p>
                </div>
              </div>
              <DonutLegend items={attendanceShares} />
            </div>
          </section>
        </div>

        <div className="report-grid-triple">
          <section className="report-panel" aria-label="Revenue breakdown">
            <div className="report-panel-header">
              <h4 className="report-panel-title">Revenue breakdown</h4>
            </div>
            <ul className="report-breakdown-list">
              {revenueBreakdown.map((row) => (
                <li key={row.label} className="report-breakdown-row">
                  <span className="report-breakdown-label">{row.label}</span>
                  <span className="report-breakdown-value">{row.value}</span>
                </li>
              ))}
            </ul>
            <div className="report-breakdown-total">
              <span>Net revenue</span>
              <span>£16,420</span>
            </div>
          </section>

          <section className="report-panel" aria-label="Orders">
            <div className="report-panel-header">
              <h4 className="report-panel-title">Orders</h4>
            </div>
            <ul className="report-breakdown-list">
              {orderStats.map((row) => (
                <li key={row.label} className="report-breakdown-row">
                  <span className="report-breakdown-label">{row.label}</span>
                  <span className="report-breakdown-value">
                    {row.value}
                    {row.note ? (
                      <span className="report-breakdown-note"> ({row.note})</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="report-panel" aria-label="Refunds and disputes">
            <div className="report-panel-header">
              <h4 className="report-panel-title">Refunds & disputes</h4>
            </div>

            <div className="report-breakdown-section">
              <p className="report-breakdown-section-title">Refunds</p>
              <ul className="report-breakdown-list">
                {refundStats.map((row) => (
                  <li key={row.label} className="report-breakdown-row">
                    <span className="report-breakdown-label">{row.label}</span>
                    <span className="report-breakdown-value">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="report-breakdown-section">
              <p className="report-breakdown-section-title">Disputes</p>
              <ul className="report-breakdown-list">
                {disputeStats.map((row) => (
                  <li key={row.label} className="report-breakdown-row">
                    <span className="report-breakdown-label">{row.label}</span>
                    <span className="report-breakdown-value">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
