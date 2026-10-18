"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { ExportButton } from "@/app/(organiser)/events/tabs/TabControls";

type TransactionStatus = "Paid" | "Refunded";

type Transaction = {
  orderId: string;
  date: string;
  month: string;
  customer: string;
  email: string;
  venue: string;
  event: string;
  ticket: string;
  offer: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
};

const transactions: Transaction[] = [
  { orderId: "#ORD-4821", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", customer: "Smith Jon", email: "user@gmail.com", venue: "Key Corner", event: "Comedy night", ticket: "Adult GA", offer: "Late", amount: 18, paymentMethod: "Card", status: "Paid" },
  { orderId: "#ORD-4822", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", customer: "Sarah Jones", email: "sarah.jones@gmail.com", venue: "Key Corner", event: "Comedy night", ticket: "Adult GA", offer: "Late", amount: 18, paymentMethod: "Card", status: "Paid" },
  { orderId: "#ORD-4823", date: "Jul 1, 2026, 09:42 AM", month: "2026-07", customer: "Alex Morgan", email: "alex.morgan@gmail.com", venue: "Function Room", event: "Summer Social", ticket: "VIP", offer: "Early bird", amount: 32, paymentMethod: "Card", status: "Paid" },
  { orderId: "#ORD-4824", date: "Jul 1, 2026, 09:18 AM", month: "2026-07", customer: "Priya Shah", email: "priya.shah@gmail.com", venue: "Outdoor Area", event: "The Closing Party", ticket: "Adult GA", offer: "Standard", amount: 25, paymentMethod: "Apple Pay", status: "Paid" },
  { orderId: "#ORD-4825", date: "Jun 30, 2026, 08:54 PM", month: "2026-06", customer: "Jordan Lee", email: "jordan.lee@gmail.com", venue: "Key Corner", event: "Comedy night", ticket: "Adult GA", offer: "Late", amount: 18, paymentMethod: "Card", status: "Paid" },
  { orderId: "#ORD-4826", date: "Jun 30, 2026, 08:21 PM", month: "2026-06", customer: "Taylor Brown", email: "taylor.brown@gmail.com", venue: "Function Room", event: "Summer Social", ticket: "VIP", offer: "Standard", amount: 32, paymentMethod: "Google Pay", status: "Paid" },
  { orderId: "#ORD-4827", date: "Jun 30, 2026, 07:36 PM", month: "2026-06", customer: "Morgan Reed", email: "morgan.reed@gmail.com", venue: "Key Corner", event: "The Closing Party", ticket: "Adult GA", offer: "Standard", amount: 25, paymentMethod: "Card", status: "Refunded" },
  { orderId: "#ORD-4828", date: "Jun 30, 2026, 06:49 PM", month: "2026-06", customer: "Jamie Wilson", email: "jamie.wilson@gmail.com", venue: "Outdoor Area", event: "Summer Social", ticket: "Adult GA", offer: "Early bird", amount: 20, paymentMethod: "Card", status: "Paid" },
  { orderId: "#ORD-4829", date: "Jun 30, 2026, 05:12 PM", month: "2026-06", customer: "Riley Adams", email: "riley.adams@gmail.com", venue: "Function Room", event: "Comedy night", ticket: "VIP", offer: "Late", amount: 35, paymentMethod: "Apple Pay", status: "Paid" },
  { orderId: "#ORD-4830", date: "Jun 30, 2026, 04:27 PM", month: "2026-06", customer: "Casey Patel", email: "casey.patel@gmail.com", venue: "Key Corner", event: "The Closing Party", ticket: "Adult GA", offer: "Standard", amount: 25, paymentMethod: "Card", status: "Paid" },
];

const selectClass = "h-[44px] min-w-[105px] border border-black bg-white px-2 text-[14px] font-bold uppercase text-black";

export default function FinanceTransactionsPage() {
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [venue, setVenue] = useState("all");
  const [event, setEvent] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesSearch = !normalizedSearch || [
        transaction.orderId,
        transaction.customer,
        transaction.email,
        transaction.event,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesSearch
        && (paymentMethod === "all" || transaction.paymentMethod === paymentMethod)
        && (venue === "all" || transaction.venue === venue)
        && (event === "all" || transaction.event === event)
        && (status === "all" || transaction.status === status)
        && (!month || transaction.month === month);
    });
  }, [search, paymentMethod, venue, event, status, month]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstResult = filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, filteredTransactions.length);

  function changeFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <main className="min-h-full bg-white px-4 py-5 md:px-5 md:py-5">
        <header>
          <h1 className="text-[26px] font-black uppercase leading-6 text-black">Finance</h1>
          <p className="mt-1 text-[13px] leading-5 text-[#777]">
            Track sales, refunds, payouts and financial performance across all venues and events.
          </p>
        </header>

        <section className="mt-9" aria-labelledby="transactions-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="transactions-title" className="text-[26px] font-black uppercase leading-6 text-black">
              Transaction
            </h2>
            <ExportButton
              fileName="finance-transactions"
              headers={["Order ID", "Date & time", "Customer", "Email", "Venue", "Event", "Ticket", "Offer", "Amount", "Payment method", "Ticket status"]}
              rows={filteredTransactions.map((row) => [
                row.orderId,
                row.date,
                row.customer,
                row.email,
                row.venue,
                row.event,
                row.ticket,
                row.offer,
                `£${row.amount.toFixed(2)}`,
                row.paymentMethod,
                row.status,
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
                onChange={(e) => changeFilter(setSearch, e.target.value)}
                placeholder="Search by order ID, customer or event..."
                aria-label="Search transactions by order ID, customer or event"
                className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="payment-method-filter">Payment method</label>
              <select id="payment-method-filter" className={selectClass} value={paymentMethod} onChange={(e) => changeFilter(setPaymentMethod, e.target.value)}>
                <option value="all">All payment methods</option>
                {["Card", "Apple Pay", "Google Pay"].map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
              <label className="sr-only" htmlFor="venue-filter">Venue</label>
              <select id="venue-filter" className={selectClass} value={venue} onChange={(e) => changeFilter(setVenue, e.target.value)}>
                <option value="all">All venues</option>
                {["Key Corner", "Function Room", "Outdoor Area"].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <label className="sr-only" htmlFor="event-filter">Event</label>
              <select id="event-filter" className={selectClass} value={event} onChange={(e) => changeFilter(setEvent, e.target.value)}>
                <option value="all">All events</option>
                {["Comedy night", "Summer Social", "The Closing Party"].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              <label className="sr-only" htmlFor="status-filter">Ticket status</label>
              <select id="status-filter" className={selectClass} value={status} onChange={(e) => changeFilter(setStatus, e.target.value)}>
                <option value="all">All statuses</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
              </select>
              <label className="sr-only" htmlFor="month-filter">Transaction month</label>
              <input
                id="month-filter"
                type="month"
                value={month}
                onChange={(e) => changeFilter(setMonth, e.target.value)}
                aria-label="Filter transactions by month"
                className={`${selectClass} min-w-[112px]`}
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
                  <th className="py-5 px-3">Order ID</th>
                  <th className="py-5 px-3">Date &amp; time</th>
                  <th className="py-5 px-3">Customer</th>
                  <th className="py-5 px-3">Venue</th>
                  <th className="py-5 px-3">Event</th>
                  <th className="py-5 px-3">Ticket</th>
                  <th className="py-5 px-3">Offer</th>
                  <th className="py-5 px-3">Amount</th>
                  <th className="py-5 px-3">Payment method</th>
                  <th className="py-5 px-3">Ticket status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.orderId} className="border-b border-black text-[16px] text-black">
                    <td className="whitespace-nowrap px-2 py-3.5">{row.orderId}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.date}</td>
                    <td className="px-2 py-2.5">
                      <span className="block whitespace-nowrap">{row.customer}</span>
                      <span className="block whitespace-nowrap text-[15px] text-[#666666]">{row.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.venue}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.event}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.ticket}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.offer}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">£{row.amount.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{row.paymentMethod}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">
                      <span className={row.status === "Paid" ? "font-bold text-[#2dbb5a]" : "font-bold text-[#ef4343]"}>
                        <span aria-hidden="true">● </span>{row.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-10 text-center text-[12px] text-black/55">
                      No transactions match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#777]">
            <p>Showing {firstResult}-{lastResult} of {filteredTransactions.length} transactions</p>
            <nav className="flex items-center gap-1" aria-label="Transaction pages">
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
