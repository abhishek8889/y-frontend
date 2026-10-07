"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import {
  ExportButton,
  MonthFilter,
  RowActions,
  TabSearch,
} from "../../events/tabs/TabControls";

type AttendanceRecord = {
  id: string;
  event: string;
  venue: string;
  ticket: string;
  offer: string;
  status: "Checked in" | "Not checked in";
  checkInTime: string;
  ticketId: string;
  month: string;
};

const attendanceRecords: AttendanceRecord[] = [
  { id: "1", event: "The Closing Party", venue: "Key Corner", ticket: "Adult GA", offer: "Late", status: "Checked in", checkInTime: "Jul 1, 2026, 10:00 AM", ticketId: "#TCK-4821", month: "2026-07" },
  { id: "2", event: "Comedy Nights", venue: "Key Corner", ticket: "VIP", offer: "General", status: "Checked in", checkInTime: "Jul 1, 2026, 10:00 AM", ticketId: "#TCK-4822", month: "2026-07" },
  { id: "3", event: "Summer Party", venue: "Key Corner", ticket: "VIP", offer: "General", status: "Checked in", checkInTime: "Jul 1, 2026, 10:00 AM", ticketId: "#TCK-4823", month: "2026-07" },
  { id: "4", event: "Summer Party", venue: "Key Corner", ticket: "VIP", offer: "General", status: "Not checked in", checkInTime: "-", ticketId: "#TCK-4824", month: "2026-07" },
];

export default function AttendanceTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionMessage, setActionMessage] = useState("");
  const filteredRecords = attendanceRecords.filter((record) =>
    `${record.event} ${record.venue} ${record.ticket} ${record.offer} ${record.ticketId}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    && (eventFilter === "all" || record.event === eventFilter)
    && (!month || record.month === month),
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const visibleRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showingStart = filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(currentPage * pageSize, filteredRecords.length);

  return (
    <section role="tabpanel" aria-label="Customer attendance" className="flex min-h-[460px] flex-col pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-black uppercase leading-none text-black">Attendance</h2>
        <ExportButton
          fileName="customer-attendance"
          headers={["Event", "Venue", "Ticket", "Offer", "Status", "Check in time", "Ticket ID"]}
          rows={filteredRecords.map((record) => [record.event, record.venue, record.ticket, record.offer, record.status, record.checkInTime, record.ticketId])}
        />
      </div>

      <div className="flex flex-col gap-3 pb-3 xl:flex-row xl:items-center">
        <TabSearch value={search} onChange={(value) => { setSearch(value); setCurrentPage(1); }} />
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            aria-label="Filter by event"
            value={eventFilter}
            onChange={(event) => { setEventFilter(event.target.value); setCurrentPage(1); }}
            options={[
              { value: "all", label: "All events" },
              ...Array.from(new Set(attendanceRecords.map((record) => record.event))).map((event) => ({ value: event, label: event })),
            ]}
            density="compact"
            containerClassName="!min-w-[125px] !rounded-none"
            className="!rounded-none !border-black/75 !px-2.5 !pr-8 !text-[14px] !font-bold !uppercase"
          />
          <MonthFilter value={month} onChange={(value) => { setMonth(value); setCurrentPage(1); }} />
        </div>
      </div>

      {actionMessage ? (
        <p role="status" className="mt-3 border border-black/20 bg-[#f5f5f5] px-3 py-2 text-[12px] text-black/70">{actionMessage}</p>
      ) : null}

      <div className="mt-5 min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
              <th className="py-5 px-3">Event</th>
              <th className="py-5 px-3">Venue</th>
              <th className="py-5 px-3">Ticket</th>
              <th className="py-5 px-3">Offer</th>
              <th className="py-5 px-3">Status</th>
              <th className="py-5 px-3">Check in time</th>
              <th className="py-5 px-3">Ticket ID</th>
              <th className="py-5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr key={record.id} className="border-b border-black text-[16px] text-black">
                <td className="px-3 py-3">{record.event}</td>
                <td className="px-3 py-3">{record.venue}</td>
                <td className="px-3 py-3">{record.ticket}</td>
                <td className="px-3 py-3">{record.offer}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-1.5 font-bold uppercase ${record.status === "Checked in" ? "text-[#24b26b]" : "text-[#ff3838]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${record.status === "Checked in" ? "bg-[#24b26b]" : "bg-[#ff3838]"}`} />
                    {record.status}
                  </span>
                </td>
                <td className="px-3 py-3">{record.checkInTime}</td>
                <td className="px-3 py-3">{record.ticketId}</td>
                <td className="px-3 py-2.5">
                  <RowActions
                    label={record.ticketId}
                    actions={["View ticket", record.status === "Checked in" ? "Mark not checked in" : "Mark checked in"]}
                    onAction={(action) => setActionMessage(`${action} selected for ${record.event}.`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 ? <p className="py-10 text-center text-[13px] text-black/50">No attendance records match these filters.</p> : null}
      </div>

      <footer className="mt-auto flex min-h-[48px] flex-wrap items-center justify-between gap-3 pt-3 text-[12px] text-black/55">
        <p aria-live="polite">Showing {showingStart}-{showingEnd} of {filteredRecords.length} attendance</p>
        <div className="flex items-center gap-2 text-black">
          <nav aria-label="Attendance pages" className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35">‹</button>
            {totalPages > 0 ? <button type="button" aria-current="page" className="h-8 min-w-7 border border-black px-1 text-[12px]">{currentPage}</button> : null}
            <button type="button" aria-label="Next page" disabled={!totalPages || currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35">›</button>
          </nav>
          <label className="sr-only" htmlFor="attendance-page-size">Attendance per page</label>
          <SelectField
            id="attendance-page-size"
            aria-label="Attendance per page"
            value={pageSize}
            onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
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
