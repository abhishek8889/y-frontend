"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { ExportButton } from "@/app/(organiser)/events/tabs/TabControls";

type Refund = {
  id: string;
  date: string;
  month: string;
  orderId: string;
  ticketId: string;
  customer: string;
  email: string;
  venue: string;
  event: string;
  amount: number;
  status: "Completed" | "Pending";
  reason: string;
};

const refunds: Refund[] = [
  { id: "#RF-4821", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", orderId: "#ORD-4821", ticketId: "#TKT-4821", customer: "Smith Jon", email: "user@gmail.com", venue: "Key Corner", event: "Party 1", amount: 18, status: "Completed", reason: "Customer request" },
  { id: "#RF-4822", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", orderId: "#ORD-4822", ticketId: "#TKT-4822", customer: "Smith Jon", email: "user@gmail.com", venue: "Key Corner", event: "Party 1", amount: 18, status: "Completed", reason: "Event cancellation" },
  { id: "#RF-4823", date: "Jun 30, 2026, 04:42 PM", month: "2026-06", orderId: "#ORD-4823", ticketId: "#TKT-4823", customer: "Alex Morgan", email: "alex.morgan@gmail.com", venue: "Function Room", event: "Summer Social", amount: 32, status: "Completed", reason: "Customer request" },
  { id: "#RF-4824", date: "Jun 29, 2026, 02:18 PM", month: "2026-06", orderId: "#ORD-4824", ticketId: "#TKT-4824", customer: "Priya Shah", email: "priya.shah@gmail.com", venue: "Outdoor Area", event: "The Closing Party", amount: 25, status: "Completed", reason: "Customer request" },
  { id: "#RF-4825", date: "Jun 28, 2026, 11:54 AM", month: "2026-06", orderId: "#ORD-4825", ticketId: "#TKT-4825", customer: "Jordan Lee", email: "jordan.lee@gmail.com", venue: "Key Corner", event: "Comedy night", amount: 18, status: "Completed", reason: "Customer request" },
  { id: "#RF-4826", date: "Jun 27, 2026, 08:21 PM", month: "2026-06", orderId: "#ORD-4826", ticketId: "#TKT-4826", customer: "Taylor Brown", email: "taylor.brown@gmail.com", venue: "Function Room", event: "Summer Social", amount: 32, status: "Completed", reason: "Customer request" },
  { id: "#RF-4827", date: "Jun 26, 2026, 07:36 PM", month: "2026-06", orderId: "#ORD-4827", ticketId: "#TKT-4827", customer: "Morgan Reed", email: "morgan.reed@gmail.com", venue: "Key Corner", event: "The Closing Party", amount: 25, status: "Pending", reason: "Customer request" },
  { id: "#RF-4828", date: "Jun 25, 2026, 06:49 PM", month: "2026-06", orderId: "#ORD-4828", ticketId: "#TKT-4828", customer: "Jamie Wilson", email: "jamie.wilson@gmail.com", venue: "Outdoor Area", event: "Summer Social", amount: 20, status: "Completed", reason: "Event cancellation" },
  { id: "#RF-4829", date: "Jun 24, 2026, 05:12 PM", month: "2026-06", orderId: "#ORD-4829", ticketId: "#TKT-4829", customer: "Riley Adams", email: "riley.adams@gmail.com", venue: "Function Room", event: "Comedy night", amount: 35, status: "Completed", reason: "Customer request" },
  { id: "#RF-4830", date: "Jun 23, 2026, 04:27 PM", month: "2026-06", orderId: "#ORD-4830", ticketId: "#TKT-4830", customer: "Casey Patel", email: "casey.patel@gmail.com", venue: "Key Corner", event: "The Closing Party", amount: 25, status: "Completed", reason: "Customer request" },
];

const selectClass = "h-[44px] min-w-[105px] border border-black bg-white px-2 text-[14px] font-bold uppercase text-black";

export default function FinanceRefundsPage() {
  const [search, setSearch] = useState("");
  const [venue, setVenue] = useState("all");
  const [event, setEvent] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredRefunds = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return refunds.filter((refund) => {
      const matchesSearch = !normalizedSearch || [
        refund.id,
        refund.orderId,
        refund.ticketId,
        refund.customer,
        refund.email,
        refund.event,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesSearch
        && (venue === "all" || refund.venue === venue)
        && (event === "all" || refund.event === event)
        && (status === "all" || refund.status === status)
        && (!month || refund.month === month);
    });
  }, [search, venue, event, status, month]);

  const pageCount = Math.max(1, Math.ceil(filteredRefunds.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRefunds.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstResult = filteredRefunds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, filteredRefunds.length);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <main className="min-h-full bg-white px-4 py-5 md:px-5 md:py-5">
        <header>
          <h1 className="text-[26px] font-black uppercase leading-6 text-black">Finance</h1>
          <p className="mt-1 text-[14px] leading-5 text-[#777]">
            Track sales, refunds, payouts and financial performance across all venues and events.
          </p>
        </header>

        <section className="mt-9" aria-labelledby="refunds-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="refunds-title" className="text-[26px] font-black uppercase leading-6 text-black">
              Refunds
            </h2>
            <ExportButton
              fileName="finance-refunds"
              headers={["Refund ID", "Date & time", "Order ID", "Ticket ID", "Customer", "Email", "Venue", "Event", "Amount", "Ticket status", "Reason"]}
              rows={filteredRefunds.map((refund) => [
                refund.id,
                refund.date,
                refund.orderId,
                refund.ticketId,
                refund.customer,
                refund.email,
                refund.venue,
                refund.event,
                `£${refund.amount.toFixed(2)}`,
                refund.status,
                refund.reason,
              ])}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2.5 xl:flex-row xl:items-center">
            <label className="flex h-[34px] min-w-0 flex-1 items-center gap-2 border-b border-black/55 px-2 text-black/60 focus-within:border-black xl:min-w-[220px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => updateFilter(setSearch, e.target.value)}
                placeholder="Search"
                aria-label="Search refunds by refund ID, order ID, ticket ID, customer or event"
                className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="refund-venue-filter">Venue</label>
              <select id="refund-venue-filter" className={selectClass} value={venue} onChange={(e) => updateFilter(setVenue, e.target.value)}>
                <option value="all">All venues</option>
                {["Key Corner", "Function Room", "Outdoor Area"].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <label className="sr-only" htmlFor="refund-event-filter">Event</label>
              <select id="refund-event-filter" className={selectClass} value={event} onChange={(e) => updateFilter(setEvent, e.target.value)}>
                <option value="all">All events</option>
                {["Party 1", "Comedy night", "Summer Social", "The Closing Party"].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <label className="sr-only" htmlFor="refund-status-filter">Refund status</label>
              <select id="refund-status-filter" className={selectClass} value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}>
                <option value="all">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
              <label className="sr-only" htmlFor="refund-month-filter">Refund month</label>
              <input
                id="refund-month-filter"
                type="month"
                value={month}
                onChange={(e) => updateFilter(setMonth, e.target.value)}
                aria-label="Filter refunds by month"
                className={`${selectClass} min-w-[112px]`}
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
                  <th className="px-3 py-5">Refund ID</th>
                  <th className="px-3 py-5">Date &amp; time</th>
                  <th className="px-3 py-5">Order ID</th>
                  <th className="px-3 py-5">Ticket ID</th>
                  <th className="px-3 py-5">Customer</th>
                  <th className="px-3 py-5">Event</th>
                  <th className="px-3 py-5">Amount</th>
                  <th className="px-3 py-5">Ticket status</th>
                  <th className="px-3 py-5">Reason</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((refund) => (
                  <tr key={refund.id} className="border-b border-black text-[16px] text-black">
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.id}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.date}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.orderId}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.ticketId}</td>
                    <td className="px-2 py-2.5">
                      <span className="block whitespace-nowrap">{refund.customer}</span>
                      <span className="block whitespace-nowrap text-[15px] text-[#666666]">{refund.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.event}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">£{refund.amount.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">
                      <span className={refund.status === "Completed" ? "font-bold text-[#2dbb5a]" : "font-bold text-[#e8a600]"}>
                        <span aria-hidden="true">● </span>{refund.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5">{refund.reason}</td>
                  </tr>
                ))}
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-[12px] text-black/55">
                      No refunds match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#777]">
            <p>Showing {firstResult}-{lastResult} of {filteredRefunds.length} refunds</p>
            <nav className="flex items-center gap-1" aria-label="Refund pages">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-7 w-7 items-center justify-center disabled:opacity-35"
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  className={[
                    "h-7 min-w-7 px-1.5",
                    currentPage === pageNumber ? "border border-black text-black" : "text-[#777] hover:text-black",
                  ].join(" ")}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="flex h-7 w-7 items-center justify-center disabled:opacity-35"
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
            <label className="flex items-center gap-2">
              <span className="sr-only">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 border border-black/45 bg-white px-2 text-[11px] text-black"
              >
                {[10, 25, 50].map((size) => <option key={size} value={size}>{size} per page</option>)}
              </select>
            </label>
          </footer>
        </section>
      </main>
    </DashboardShell>
  );
}
