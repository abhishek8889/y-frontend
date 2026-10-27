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
    <section className="pt-5" aria-label={`${eventTitle} attendees`}>
      <div className="event-panel-header">
        <div>
          <h3 className="event-panel-title">Attendees</h3>
          <p className="event-panel-subtitle">Check-in status and ticket holders for this event.</p>
        </div>
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

      <div className="mt-4 overflow-x-auto">
        <table className="datatable-table min-w-[880px]">
          <thead>
            <tr>
              <th className="datatable-column-title">Name</th>
              <th className="datatable-column-title">Ticket name</th>
              <th className="datatable-column-title">Offer &amp; price</th>
              <th className="datatable-column-title">Ticket ID</th>
              <th className="datatable-column-title">Check-in status</th>
              <th className="datatable-column-title">Date &amp; time</th>
              <th className="datatable-column-title text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map((attendee) => (
              <tr key={attendee.id}>
                <td className="datatable-column-value">
                  <strong className="block font-bold">{attendee.name}</strong>
                  <span className="text-[12px] text-[#6f6e69]">{attendee.email}</span>
                </td>
                <td className="datatable-column-value">{attendee.ticket}</td>
                <td className="datatable-column-value">{attendee.offer} - ${attendee.price.toFixed(2)}</td>
                <td className="datatable-column-value">{attendee.ticketId}</td>
                <td className="datatable-column-value">
                  <span className={`datatable-status ${attendee.checkedIn ? "text-status-active" : "text-status-soldout"}`}>
                    <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${attendee.checkedIn ? "bg-status-active" : "bg-status-soldout"}`} aria-hidden />
                    {attendee.checkedIn ? "Checked in" : "Not checked in"}
                  </span>
                </td>
                <td className="datatable-column-value">{attendee.date || "—"}</td>
                <td className="datatable-column-value text-center">
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
        {filteredAttendees.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-black/50">No attendees match these filters.</p>
        ) : null}
      </div>
    </section>
  );
}
