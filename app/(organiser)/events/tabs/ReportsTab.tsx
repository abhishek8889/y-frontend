"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthFilter } from "./TabControls";

const revenueByDay = [680, 270, 420, 950, 510, 190, 790, 420, 870, 420, 110, 210, 40, 550, 420, 90, 660, 420, 860, 950, 420, 210, 670, 420, 190, 220, 420, 210, 420, 420];
const salesByTicket = [
  { ticket: "General Admission", offers: 3, sold: 435, gross: 50, refund: 50, net: 50 },
  { ticket: "VIP", offers: 1, sold: 532, gross: 40, refund: 40, net: 40 },
  { ticket: "Complimentary", offers: 3, sold: 132, gross: 75, refund: 75, net: 75 },
];

const summary = [
  { label: "Tickets sold", value: "120/220" },
  { label: "Revenue", value: "$1,247" },
  { label: "Attendance", value: "96" },
  { label: "Remaining check in", value: "80" },
];

export default function ReportsTab({ eventTitle }: { eventTitle: string }) {
  const [month, setMonth] = useState("2026-06");
  const monthLabel = month
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`))
    : "Select month";
  const monthDate = month ? new Date(`${month}-01T12:00:00`) : new Date();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const monthShort = new Intl.DateTimeFormat("en", { month: "short" }).format(monthDate);
  const chartData = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    revenue: revenueByDay[Math.round((index * (revenueByDay.length - 1)) / (daysInMonth - 1))],
  }));
  const chartTicks = chartData
    .filter(({ day }) => day === 1 || day % 5 === 0)
    .map(({ day }) => day);

  return (
    <section className="pt-4" aria-label={`${eventTitle} reports`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[26px] font-black uppercase leading-none text-black">Report</h3>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="border border-black/65 p-[18px]">
            <h4 className="text-[14px] font-bold uppercase text-[#AAAAAC]">{item.label}</h4>
            <p className="mt-1 text-[22px] leading-[24px] font-bold leading-none text-black">{item.value}</p>
          </article>
        ))}
      </div>

      <section className="border border-black/65 p-4" aria-label="Revenue overview chart">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-[18px] font-bold uppercase text-black">Revenue overview</h4>
          <p className="text-[11px] text-[#888]">{monthLabel}</p>
        </div>
        <div className="h-[250px] w-full" role="img" aria-label={`Daily revenue in pounds for ${monthLabel}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#d9d9d9" strokeDasharray="3 4" />
              <XAxis
                dataKey="day"
                type="number"
                scale="band"
                domain={[1, daysInMonth]}
                ticks={chartTicks}
                tickFormatter={(day: number) => `${day} ${monthShort}`}
                tick={{ fill: "#999", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#b5b5b5" }}
                interval={0}
                minTickGap={12}
              />
              <YAxis
                domain={[0, 1000]}
                ticks={[0, 250, 500, 750, 1000]}
                tickFormatter={(value: number) => `£${value.toLocaleString("en-GB")}`}
                tick={{ fill: "#999", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value) => [`£${Number(value).toLocaleString("en-GB")}`, "Revenue"]}
                labelFormatter={(day) => `${day} ${monthShort} ${monthDate.getFullYear()}`}
                contentStyle={{ borderColor: "#777", borderRadius: 0, fontSize: 12 }}
                cursor={{ fill: "#000", fillOpacity: 0.06 }}
              />
              <Bar dataKey="revenue" fill="#000" maxBarSize={12} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-5 border border-black/65 p-4">
        <h4 className="mb-[30px] text-[18px] font-bold uppercase text-black">Sales by ticket type</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-y border-black/65 text-[14px] font-bold uppercase text-black">
                <th className="px-2.5 py-3.5">Ticket</th>
                <th className="px-2.5 py-3.5">Offer</th>
                <th className="px-2.5 py-3.5">Sold</th>
                <th className="px-2.5 py-3.5">Gross sale</th>
                <th className="px-2.5 py-3.5">Refund</th>
                <th className="px-2.5 py-3.5">Net sale</th>
              </tr>
            </thead>
            <tbody>
              {salesByTicket.map((row) => (
                <tr key={row.ticket} className="border-b border-black text-[16px] text-black">
                  <td className="px-2.5 py-4">{row.ticket}</td>
                  <td className="px-2.5 py-4">{row.offers}</td>
                  <td className="px-2.5 py-4">{row.sold}</td>
                  <td className="px-2.5 py-4">${row.gross}</td>
                  <td className="px-2.5 py-4">${row.refund}</td>
                  <td className="px-2.5 py-4">${row.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}