"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { ExportButton, TabSearch } from "../../events/tabs/TabControls";

type ActivityRecord = {
  id: number;
  dateTime: string;
  activity: string;
  details: string;
};

const activityRecords: ActivityRecord[] = [
  { id: 1, dateTime: "12 Jan 2026, 09:18 AM", activity: "Check-In", details: "The closing party" },
  { id: 2, dateTime: "12 Jan 2026, 09:18 AM", activity: "Ticket Purchased", details: "Order #ORD-6373 - £18.00" },
  { id: 3, dateTime: "12 Jan 2026, 09:18 AM", activity: "Confirmation email sent", details: "Order #ORD-6373" },
  { id: 4, dateTime: "12 Jan 2026, 09:18 AM", activity: "Profile updated", details: "Phone number verified" },
  { id: 5, dateTime: "12 Jan 2026, 09:18 AM", activity: "Customer account created", details: "Joined via web" },
];

export default function ActivityTab() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredRecords = activityRecords.filter((record) =>
    `${record.dateTime} ${record.activity} ${record.details}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const visibleRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showingStart = filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(currentPage * pageSize, filteredRecords.length);

  return (
    <section role="tabpanel" aria-label="Customer activity" className="flex min-h-[460px] flex-col pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-black uppercase leading-none text-black">Activity</h2>
        <ExportButton
          fileName="customer-activity"
          headers={["Date & time", "Activity", "Details"]}
          rows={filteredRecords.map((record) => [record.dateTime, record.activity, record.details])}
        />
      </div>

      <div className="pb-3">
        <TabSearch
          value={search}
          onChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black/70 text-[14px] font-bold uppercase text-black">
              <th className="py-5 px-3">Date &amp; time</th>
              <th className="py-5 px-3">Activity</th>
              <th className="py-5 px-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr key={record.id} className="border-b border-black text-[16px] text-black">
                <td className="py-5 px-3">{record.dateTime}</td>
                <td className="py-5 px-3">{record.activity}</td>
                <td className="py-5 px-3">{record.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-black/50">No activity matches your search.</p>
        ) : null}
      </div>

      <footer className="mt-auto flex min-h-[48px] flex-wrap items-center justify-between gap-3 pt-3 text-[12px] text-black/55">
        <p aria-live="polite">Showing {showingStart}-{showingEnd} of {filteredRecords.length} Activity</p>
        <div className="flex items-center gap-2 text-black">
          <nav aria-label="Activity pages" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35"
            >
              ‹
            </button>
            {totalPages > 0 ? (
              <button type="button" aria-current="page" className="h-8 min-w-7 border border-black px-1 text-[12px]">
                {currentPage}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Next page"
              disabled={!totalPages || currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35"
            >
              ›
            </button>
          </nav>
          <label className="sr-only" htmlFor="activity-page-size">Activity per page</label>
          <SelectField
            id="activity-page-size"
            aria-label="Activity per page"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            options={[{ value: "10", label: "10 per page" }, { value: "25", label: "25 per page" }, { value: "50", label: "50 per page" }]}
            density="compact"
            containerClassName="!min-w-[112px] !rounded-none"
            className="!rounded-none !border-black/50 !px-2 !pr-8 !text-[11px]"
          />
        </div>
      </footer>
    </section>
  );
}