"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { ExportButton } from "@/app/(organiser)/events/tabs/TabControls";

type Payout = {
  id: string;
  date: string;
  month: string;
  amount: number;
  transactions: number;
  status: "Paid" | "Pending";
};

const payouts: Payout[] = [
  { id: "#PO-4821", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", amount: 48250, transactions: 64, status: "Paid" },
  { id: "#PO-4822", date: "Jun 24, 2026, 10:00 AM", month: "2026-06", amount: 12480, transactions: 87, status: "Paid" },
  { id: "#PO-4823", date: "Jun 17, 2026, 10:00 AM", month: "2026-06", amount: 9260, transactions: 87, status: "Paid" },
  { id: "#PO-4824", date: "Jun 10, 2026, 10:00 AM", month: "2026-06", amount: 15340, transactions: 87, status: "Paid" },
  { id: "#PO-4825", date: "Jun 3, 2026, 10:00 AM", month: "2026-06", amount: 8415, transactions: 87, status: "Paid" },
  { id: "#PO-4826", date: "May 27, 2026, 10:00 AM", month: "2026-05", amount: 11280, transactions: 87, status: "Paid" },
  { id: "#PO-4827", date: "May 20, 2026, 10:00 AM", month: "2026-05", amount: 7350, transactions: 87, status: "Paid" },
  { id: "#PO-4828", date: "May 13, 2026, 10:00 AM", month: "2026-05", amount: 9860, transactions: 87, status: "Paid" },
  { id: "#PO-4829", date: "May 6, 2026, 10:00 AM", month: "2026-05", amount: 6215, transactions: 87, status: "Paid" },
  { id: "#PO-4830", date: "Apr 29, 2026, 10:00 AM", month: "2026-04", amount: 13420, transactions: 87, status: "Paid" },
];

function formatPounds(amount: number) {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FinancePayoutsPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("2026-06");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPayouts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return payouts.filter((payout) =>
      (!normalizedSearch || payout.id.toLowerCase().includes(normalizedSearch))
      && (!month || payout.month === month),
    );
  }, [search, month]);

  const pageCount = Math.max(1, Math.ceil(filteredPayouts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredPayouts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstResult = filteredPayouts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, filteredPayouts.length);

  function updateFilter(setter: (value: string) => void, value: string) {
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

        <section className="mt-9" aria-labelledby="payouts-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="payouts-title" className="text-[26px] font-black uppercase leading-6 text-black">
              Payout
            </h2>
            <ExportButton
              fileName="finance-payouts"
              headers={["Payout ID", "Date & time", "Amount", "Transactions", "Status"]}
              rows={filteredPayouts.map((payout) => [
                payout.id,
                payout.date,
                formatPounds(payout.amount),
                payout.transactions,
                payout.status,
              ])}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <article className="min-h-[82px] border border-black/65 px-3 py-3">
              <h3 className="text-[14px] font-bold uppercase text-[#999]">Available balance</h3>
              <p className="mt-1 text-[22px] font-bold leading-5 text-black">{formatPounds(48250)}</p>
              <p className="mt-1 text-[14px] text-[#888]">Will be released in your next payout.</p>
            </article>
            <article className="min-h-[82px] border border-black/65 px-3 py-3">
              <h3 className="text-[14px] font-bold uppercase text-[#999]">Next payout</h3>
              <p className="mt-1 text-[22px] font-bold leading-5 text-black">{formatPounds(48250)}</p>
              <p className="mt-1 text-[14px] text-[#888]">Expected on 25 Sep 2026</p>
            </article>
            <article className="min-h-[82px] border border-black/65 px-3 py-3">
              <h3 className="text-[14px] font-bold uppercase text-[#999]">Total paid out</h3>
              <p className="mt-1 text-[22px] font-bold leading-5 text-black">{formatPounds(48250)}</p>
              <p className="mt-1 text-[14px] text-[#888]">10 payouts</p>
            </article>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="flex h-[34px] min-w-0 flex-1 items-center gap-2 border-b border-black/55 px-2 text-black/60 focus-within:border-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => updateFilter(setSearch, e.target.value)}
                placeholder="Search"
                aria-label="Search payouts by payout ID"
                className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="sr-only">Payout month</span>
              <input
                type="month"
                value={month}
                onChange={(e) => updateFilter(setMonth, e.target.value)}
                aria-label="Filter payouts by month"
                className="h-[34px] min-w-[120px] border border-black/65 bg-white px-2 text-[10px] font-bold uppercase text-black"
              />
            </label>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
                  <th className="px-3 py-5">Payout ID</th>
                  <th className="px-3 py-5">Date &amp; time</th>
                  <th className="px-3 py-5">Amount</th>
                  <th className="px-3 py-5">Transactions</th>
                  <th className="px-3 py-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((payout) => (
                  <tr key={payout.id} className="border-b border-black text-[16px] text-black">
                    <td className="whitespace-nowrap px-2 py-3.5">{payout.id}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{payout.date}</td>
                    <td className="whitespace-nowrap px-2 py-3.5">{formatPounds(payout.amount)}</td>
                    <td className="px-2 py-3.5">{payout.transactions}</td>
                    <td className="px-2 py-3.5">
                      <span className="font-bold text-[#2dbb5a]">
                        <span aria-hidden="true">● </span>{payout.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-[12px] text-black/55">
                      No payouts match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#777]">
            <p>Showing {firstResult}-{lastResult} of {filteredPayouts.length} payouts</p>
            <nav className="flex items-center gap-1" aria-label="Payout pages">
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
