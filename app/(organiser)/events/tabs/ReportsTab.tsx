"use client";

import { useState } from "react";
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

  return (
    <section className="pt-4" aria-label={`${eventTitle} reports`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] font-black uppercase leading-none text-black">Report</h3>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="border border-black/65 px-3 py-3">
            <h4 className="text-[10px] font-bold uppercase text-[#A0A0A0]">{item.label}</h4>
            <p className="mt-1 text-[17px] font-bold leading-none text-black">{item.value}</p>
          </article>
        ))}
      </div>

      <section className="border border-black/65 p-4" aria-label="Revenue overview chart">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-[12px] font-bold uppercase text-black">Revenue overview</h4>
          <p className="text-[11px] text-[#888]">{monthLabel}</p>
        </div>
        <div className="relative h-[210px] pl-12">
          <div className="absolute inset-x-12 inset-y-2 flex flex-col justify-between" aria-hidden="true">
            {["$1,000", "$750", "$500", "$250", "$0"].map((label) => (
              <div key={label} className="flex h-0 items-center border-t border-dashed border-black/10 text-[10px] text-[#999]">
                <span className="absolute -left-11 w-9 text-right">{label}</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-12 bottom-7 top-2 flex items-end justify-between gap-1 border-b border-black/15">
            {revenueByDay.map((value, index) => (
              <div key={`${index}-${value}`} className="flex h-full min-w-0 flex-1 items-end justify-center" title={`Day ${index + 1}: $${value}`}>
                <div className="w-full max-w-[10px] bg-black" style={{ height: `${Math.max(4, (value / 1000) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-12 bottom-0 flex justify-between text-[10px] text-[#999]">
            {["1 Sep", "5 Sep", "10 Sep", "15 Sep", "20 Sep", "25 Sep", "30 Sep"].map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
      </section>

      <section className="mt-5 border border-black/65 p-4">
        <h4 className="mb-4 text-[12px] font-bold uppercase text-black">Sales by ticket type</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-y border-black/65 text-[10px] font-bold uppercase text-black">
                <th className="px-2.5 py-3">Ticket</th>
                <th className="px-2.5 py-3">Offer</th>
                <th className="px-2.5 py-3">Sold</th>
                <th className="px-2.5 py-3">Gross sale</th>
                <th className="px-2.5 py-3">Refund</th>
                <th className="px-2.5 py-3">Net sale</th>
              </tr>
            </thead>
            <tbody>
              {salesByTicket.map((row) => (
                <tr key={row.ticket} className="border-b border-black/55 text-[12px] text-black">
                  <td className="px-2.5 py-3.5">{row.ticket}</td>
                  <td className="px-2.5 py-3.5">{row.offers}</td>
                  <td className="px-2.5 py-3.5">{row.sold}</td>
                  <td className="px-2.5 py-3.5">${row.gross}</td>
                  <td className="px-2.5 py-3.5">${row.refund}</td>
                  <td className="px-2.5 py-3.5">${row.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}