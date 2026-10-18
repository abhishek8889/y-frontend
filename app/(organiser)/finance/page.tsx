"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { ExportButton } from "@/app/(organiser)/events/tabs/TabControls";

const venueSales = [
  { venue: "Key Corner", events: 2, tickets: 1290, gross: 8415, refunds: 215, net: 8200 },
  { venue: "Function Room", events: 3, tickets: 640, gross: 4415, refunds: 115, net: 4300 },
  { venue: "Outdoor Area", events: 1, tickets: 200, gross: 2415, refunds: 340, net: 2132 },
];

const recentTransactions = [
  { order: "#ORD-4821", customer: "James", event: "The Closing Party", amount: 50, status: "Paid" },
  { order: "#ORD-4822", customer: "Mark", event: "Comedy nights", amount: 40, status: "Paid" },
  { order: "#ORD-4823", customer: "Arora", event: "The Closing Party", amount: 75, status: "Refund" },
  { order: "#ORD-4824", customer: "Charlie", event: "Summer Social", amount: 35, status: "Paid" },
];

const dailyRevenue = [
  680, 270, 420, 950, 510, 190, 790, 420, 870, 420,
  110, 210, 40, 550, 420, 90, 660, 420, 860, 950,
  420, 210, 670, 420, 190, 220, 420, 210, 420, 420,
];

const metrics = [
  { label: "Gross sales", value: "£48,250.00", detail: "642 transactions" },
  { label: "Refunds", value: "£2,150.00", detail: "18 refunds", id: "refunds" },
  { label: "Net sales", value: "£46,100.00", detail: "After refunds" },
  { label: "Payouts", value: "£43,800.00", detail: "£2,300 pending", id: "payouts" },
];

const chartData = dailyRevenue.map((gross, index) => ({
  date: index + 1,
  gross,
  net: Math.round(gross * (index % 4 === 0 ? 0.88 : 0.91)),
}));

function formatPounds(amount: number) {
  return `£${amount.toLocaleString("en-GB")}`;
}

export default function FinancePage() {
  const [period, setPeriod] = useState("30");
  const [venue, setVenue] = useState("all");
  const [event, setEvent] = useState("all");

  const filteredVenues = useMemo(
    () => venueSales.filter((row) => venue === "all" || row.venue === venue),
    [venue],
  );
  const filteredTransactions = useMemo(
    () => recentTransactions.filter((row) => event === "all" || row.event === event),
    [event],
  );

  const exportRows = [
    ...filteredVenues.map((row) => [
      "Venue sale",
      row.venue,
      row.events,
      row.tickets,
      formatPounds(row.gross),
      formatPounds(row.refunds),
      formatPounds(row.net),
    ]),
    ...filteredTransactions.map((row) => [
      "Transaction",
      row.order,
      row.customer,
      row.event,
      formatPounds(row.amount),
      row.status,
    ]),
  ];

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <main id="overview" className="min-h-full bg-white px-4 py-5 md:px-5 md:py-5">
        <header>
          <h1 className="text-[26px] font-black uppercase leading-6 text-black">Finance</h1>
          <p className="mt-1 text-[14px] leading-5 text-[#777]">
            Track sales, refunds, payouts and financial performance across all your venues and events.
          </p>
        </header>

        <section className="mt-9" aria-labelledby="finance-overview-heading">
          <h2 id="finance-overview-heading" className="text-[26px] font-black uppercase leading-6 text-black">
            Overview
          </h2>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex min-w-[125px] flex-col gap-1 text-[10px] font-bold uppercase text-[#777]">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-[44px] border border-black bg-white px-2 text-[14px] font-bold text-black"              >
                <option value="30">Last 30 days</option>
                <option value="7">Last 7 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </label>
            <label className="flex min-w-[125px] flex-col gap-1 text-[10px] font-bold uppercase text-[#777]">
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="h-[44px] border border-black bg-white px-2 text-[14px] font-bold text-black"
              >
                <option value="all">All venues</option>
                {venueSales.map((row) => <option key={row.venue} value={row.venue}>{row.venue}</option>)}
              </select>
            </label>
            <label className="flex min-w-[125px] flex-col gap-1 text-[10px] font-bold uppercase text-[#777]">
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="h-[44px] border border-black bg-white px-2 text-[14px] font-bold text-black"
              >
                <option value="all">All events</option>
                {[...new Set(recentTransactions.map((row) => row.event))].map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <div className="ml-auto">
              <ExportButton
                fileName="finance-overview"
                headers={["Record type", "Reference", "Events / customer", "Tickets / event", "Gross / amount", "Refunds / status", "Net sales"]}
                rows={exportRows}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                id={metric.id}
                className="min-h-[72px] border border-black/65 px-3 py-3"
              >
                <h3 className="text-[14px] font-bold uppercase text-[#AAAAAC]">{metric.label}</h3>
                <p className="mt-[6px] mb-[10px] text-[22px] font-bold leading-[22px] text-black">{metric.value}</p>
                <p className="text-[14px] text-[#6F6E69]">{metric.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-[24px] border border-black py-[28px] px-[20]" aria-labelledby="revenue-chart-heading">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <h2 id="revenue-chart-heading" className="text-[18px] font-bold uppercase text-black">
              Revenue overview
            </h2>
            <p className="flex items-center gap-4 text-[14px] text-[#000000]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-black" />Gross sales</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-[#999]" />Net sales</span>
            </p>
          </div>
          <div className="h-[220px] w-full sm:h-[250px]" role="img" aria-label={`Gross and net sales over the last ${period} days`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(-Number(period))}
                margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
                barCategoryGap="18%"
              >
                <CartesianGrid vertical={false} stroke="#dedede" strokeDasharray="3 4" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: number) => `${date} Sep`}
                  ticks={[1, 5, 10, 15, 20, 25, 30].filter((date) => date <= chartData.slice(-Number(period)).length)}
                  tick={{ fill: "#999", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#bbb" }}
                  interval={0}
                  minTickGap={12}
                />
                <YAxis
                  domain={[0, 1000]}
                  ticks={[0, 250, 500, 750, 1000]}
                  tickFormatter={(value: number) => `£${value}`}
                  tick={{ fill: "#999", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <Tooltip
                  formatter={(value, name) => [formatPounds(Number(value)), name === "gross" ? "Gross sales" : "Net sales"]}
                  labelFormatter={(date) => `${date} Sep`}
                  contentStyle={{ borderColor: "#777", borderRadius: 0, fontSize: 11 }}
                  cursor={{ fill: "#000", fillOpacity: 0.05 }}
                />
                <Legend content={() => null} />
                <Bar dataKey="gross" name="Gross sales" fill="#000" maxBarSize={12} isAnimationActive={false} />
                <Bar dataKey="net" name="Net sales" fill="#999" maxBarSize={12} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="mt-[40px] grid gap-3 xl:grid-cols-2">
          <section className="min-w-0 border border-black py-[28px] px-[20px]" aria-labelledby="venue-sales-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="venue-sales-heading" className="text-[18px] font-bold uppercase text-black">Sales by venue</h2>
              <a
                href="#venue-sales-heading"
                className="border border-black  px-2.5 py-1 text-[14px] rounded text-black hover:bg-black hover:text-white"
              >
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
                    <th className="px-1.5 py-2.5">Venue</th>
                    <th className="px-1.5 py-2.5">Events</th>
                    <th className="px-1.5 py-2.5">Tickets sold</th>
                    <th className="px-1.5 py-2.5">Gross sale</th>
                    <th className="px-1.5 py-2.5">Refunds</th>
                    <th className="px-1.5 py-2.5">Net sales</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVenues.map((row) => (
                    <tr key={row.venue} className="border-b border-black text-[16px] text-black">
                      <td className="px-1.5 py-2.5">{row.venue}</td>
                      <td className="px-1.5 py-2.5">{row.events}</td>
                      <td className="px-1.5 py-2.5">{row.tickets.toLocaleString("en-GB")}</td>
                      <td className="px-1.5 py-2.5">{formatPounds(row.gross)}</td>
                      <td className="px-1.5 py-2.5">{formatPounds(row.refunds)}</td>
                      <td className="px-1.5 py-2.5">{formatPounds(row.net)}</td>
                    </tr>
                  ))}
                  {filteredVenues.length === 0 ? (
                    <tr><td colSpan={6} className="px-2 py-5 text-center text-[11px] text-black/55">No venue sales for this filter.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section id="recent-transactions" className="min-w-0 border border-black py-[28px] px-[20px]" aria-labelledby="transactions-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="transactions-heading" className="text-[18px] font-bold uppercase text-black">Recent transactions</h2>
              <a
                href="#recent-transactions"
                className="border border-black px-2.5 py-1 text-[14px] rounded text-black hover:bg-black hover:text-white"
              >
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
                    <th className="px-1.5 py-2.5">Order ID</th>
                    <th className="px-1.5 py-2.5">Customer</th>
                    <th className="px-1.5 py-2.5">Event</th>
                    <th className="px-1.5 py-2.5">Amount</th>
                    <th className="px-1.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((row) => (
                    <tr key={row.order} className="border-b border-black text-[16px] text-black">
                      <td className="px-1.5 py-2.5">{row.order}</td>
                      <td className="px-1.5 py-2.5">{row.customer}</td>
                      <td className="px-1.5 py-2.5">{row.event}</td>
                      <td className="px-1.5 py-2.5">{formatPounds(row.amount)}</td>
                      <td className="px-1.5 py-2.5">
                        <span className={row.status === "Paid" ? "font-bold text-[#2dbb5a]" : "font-bold text-[#ef4343]"}>
                          <span aria-hidden="true">● </span>{row.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-2 py-5 text-center text-[11px] text-black/55">No transactions for this event.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
