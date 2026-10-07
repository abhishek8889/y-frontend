"use client";

import { useMemo, useState } from "react";
import { ExportButton, MonthFilter, ResultNotice, RowActions, SelectFilter, TabSearch } from "./TabControls";

type Attendee = {
  id: string;
  name: string;
  email: string;
  ticket: string;
  offer: string;
  price: number;
  ticketId: string;
  checkedIn: boolean;
  date: string;
};

const initialAttendees: Attendee[] = [
  { id: "1", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", checkedIn: true, date: "01 Jul 2026, 10:00 AM" },
  { id: "2", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", checkedIn: true, date: "01 Jul 2026, 10:00 AM" },
  { id: "3", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, ticketId: "#TKT-4821", checkedIn: false, date: "" },
];

const ticketOptions = [{ value: "all", label: "All ticket type" }, { value: "Adult GA", label: "Adult GA" }, { value: "VIP", label: "VIP" }];
const statusOptions = [{ value: "all", label: "All status" }, { value: "checked", label: "Checked in" }, { value: "not-checked", label: "Not checked in" }];

export default function AttendeesTab({ eventTitle }: { eventTitle: string }) {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const [notice, setNotice] = useState("");

  const filteredAttendees = useMemo(() => attendees.filter((attendee) => {
    const matchesSearch = `${attendee.name} ${attendee.email} ${attendee.ticket} ${attendee.ticketId}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "checked" ? attendee.checkedIn : !attendee.checkedIn);
    return matchesSearch && matchesStatus && (ticketFilter === "all" || attendee.ticket === ticketFilter);
  }), [attendees, search, statusFilter, ticketFilter]);

  return (
    <section className="pt-4" aria-label={`${eventTitle} attendees`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] font-black uppercase leading-none text-black">Attendees</h3>
        <ExportButton
          fileName="event-attendees"
          headers={["Name", "Email", "Ticket", "Offer", "Price", "Ticket ID", "Check-in status", "Date & time"]}
          rows={filteredAttendees.map((attendee) => [attendee.name, attendee.email, attendee.ticket, attendee.offer, attendee.price, attendee.ticketId, attendee.checkedIn ? "Checked in" : "Not checked in", attendee.date])}
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
              <th className="px-2.5 py-3.5">Check-in status</th>
              <th className="px-2.5 py-3.5">Date &amp; time</th>
              <th className="w-16 px-2.5 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map((attendee) => (
              <tr key={attendee.id} className="border-b border-black/75 text-[16px] text-black">
                <td className="px-2.5 py-3.5">
                  <strong className="block font-bold">{attendee.name}</strong>
                  <span className="text-[14px] text-[#777]">{attendee.email}</span>
                </td>
                <td className="px-2.5 py-4">{attendee.ticket}</td>
                <td className="px-2.5 py-4">{attendee.offer} - ${attendee.price.toFixed(2)}</td>
                <td className="px-2.5 py-4">{attendee.ticketId}</td>
                <td className="px-2.5 py-4">
                  <span className={`inline-flex items-center gap-1.5 font-bold uppercase ${attendee.checkedIn ? "text-[#16B957]" : "text-[#E53935]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${attendee.checkedIn ? "bg-[#16B957]" : "bg-[#E53935]"}`} />
                    {attendee.checkedIn ? "Checked in" : "Not checked in"}
                  </span>
                </td>
                <td className="px-2.5 py-4">{attendee.date || "-"}</td>
                <td className="px-2.5 py-3.5">
                  <RowActions
                    label={attendee.name}
                    actions={[attendee.checkedIn ? "Mark not checked in" : "Mark checked in", "Customer information"]}
                    onAction={(action) => {
                      if (action.startsWith("Mark")) {
                        setAttendees((current) => current.map((item) => item.id === attendee.id ? { ...item, checkedIn: !item.checkedIn } : item));
                      }
                      setNotice(`${action}: ${attendee.name} (${attendee.email})`);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAttendees.length === 0 ? <p className="py-10 text-center text-[13px] text-black/50">No attendees match these filters.</p> : null}
      </div>
    </section>
  );
}