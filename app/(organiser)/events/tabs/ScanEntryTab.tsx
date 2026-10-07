"use client";

import { useMemo, useState } from "react";
import { ExportButton, MonthFilter, ResultNotice, RowActions, SelectFilter, TabSearch } from "./TabControls";

type ScanRecord = {
  id: string;
  name: string;
  email: string;
  ticket: string;
  offer: string;
  price: number;
  ticketId: string;
  status: "Valid" | "Rejected";
  reason: string;
  date: string;
};

const initialScans: ScanRecord[] = [
  { id: "1", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", status: "Valid", reason: "", date: "10:00 AM" },
  { id: "2", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", status: "Rejected", reason: "Duplicate scan", date: "10:00 AM" },
  { id: "3", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", status: "Valid", reason: "", date: "-" },
];

const ticketOptions = [{ value: "all", label: "All ticket type" }, { value: "Adult GA", label: "Adult GA" }, { value: "VIP", label: "VIP" }];
const statusOptions = [{ value: "all", label: "All status" }, { value: "Valid", label: "Valid" }, { value: "Rejected", label: "Rejected" }];

export default function ScanEntryTab({ eventTitle }: { eventTitle: string }) {
  const [scans, setScans] = useState(initialScans);
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const [notice, setNotice] = useState("");

  const filteredScans = useMemo(() => scans.filter((scan) => {
    const matchesSearch = `${scan.name} ${scan.email} ${scan.ticket} ${scan.ticketId}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch
      && (ticketFilter === "all" || scan.ticket === ticketFilter)
      && (statusFilter === "all" || scan.status === statusFilter);
  }), [scans, search, ticketFilter, statusFilter]);

  return (
    <section className="pt-4" aria-label={`${eventTitle} scan and entry records`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] font-black uppercase leading-none text-black">Scan / Entry</h3>
        <ExportButton
          fileName="event-scan-entry"
          headers={["Name", "Email", "Ticket", "Offer", "Price", "Ticket ID", "Scan status", "Reason", "Time"]}
          rows={filteredScans.map((scan) => [scan.name, scan.email, scan.ticket, scan.offer, scan.price, scan.ticketId, scan.status, scan.reason, scan.date])}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TabSearch value={search} onChange={setSearch} />
        <SelectFilter value={ticketFilter} options={ticketOptions} onChange={setTicketFilter} />
        <SelectFilter value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      {notice ? <ResultNotice onClose={() => setNotice("")}>{notice}</ResultNotice> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
              <th className="px-2.5 py-3.5">Name</th>
              <th className="px-2.5 py-3.5">Ticket name</th>
              <th className="px-2.5 py-3.5">Offer &amp; price</th>
              <th className="px-2.5 py-3.5">Ticket ID</th>
              <th className="px-2.5 py-3.5">Scan status</th>
              <th className="px-2.5 py-3.5">Date &amp; time</th>
              <th className="w-16 px-2.5 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map((scan) => (
              <tr key={scan.id} className="border-b border-black/75 text-[13px] text-black">
                <td className="px-2.5 py-3.5">
                  <strong className="block font-bold">{scan.name}</strong>
                  <span className="text-[14px] text-[#777]">{scan.email}</span>
                </td>
                <td className="px-2.5 py-4">{scan.ticket}</td>
                <td className="px-2.5 py-4">{scan.offer} - ${scan.price.toFixed(2)}</td>
                <td className="px-2.5 py-4">{scan.ticketId}</td>
                <td className="px-2.5 py-3.5">
                  <span className={`block font-bold uppercase ${scan.status === "Valid" ? "text-[#16B957]" : "text-[#E53935]"}`}>
                    <span className="mr-1.5">●</span>{scan.status}
                  </span>
                  {scan.reason ? <span className="block pl-3.5 text-[11px] text-[#777]">{scan.reason}</span> : null}
                </td>
                <td className="px-2.5 py-4">{scan.date}</td>
                <td className="px-2.5 py-3.5">
                  <RowActions
                    label={scan.ticketId}
                    actions={[scan.status === "Valid" ? "Reject scan" : "Mark valid", "Customer information"]}
                    onAction={(action) => {
                      if (action === "Reject scan" || action === "Mark valid") {
                        const status = action === "Mark valid" ? "Valid" : "Rejected";
                        setScans((current) => current.map((item) => item.id === scan.id ? { ...item, status, reason: status === "Rejected" ? "Manually rejected" : "" } : item));
                      }
                      setNotice(`${action}: ${scan.name} (${scan.ticketId})`);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredScans.length === 0 ? <p className="py-10 text-center text-[13px] text-black/50">No scan records match these filters.</p> : null}
      </div>
    </section>
  );
}