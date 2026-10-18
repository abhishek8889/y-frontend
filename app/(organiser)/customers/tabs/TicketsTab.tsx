"use client";

import { useState } from "react";
import { ExportButton, MonthFilter, SelectFilter, TabSearch } from "../../events/tabs/TabControls";

type CustomerTicket = {
  id: string;
  ticket: string;
  offer: string;
  date: string;
  month: string;
  event: string;
  venue: string;
  status: "Paid" | "Refunded";
  orderId: string;
};

const customerTickets: CustomerTicket[] = [
  { id: "#TCK-4821", ticket: "Adult GA", offer: "Late", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "The Closing Party", venue: "Key Corner", status: "Paid", orderId: "#ORD-4821" },
  { id: "#TCK-4822", ticket: "VIP", offer: "General", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Comedy Nights", venue: "Key Corner", status: "Paid", orderId: "#ORD-4819" },
  { id: "#TCK-4823", ticket: "VIP", offer: "General", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Summer Party", venue: "Key Corner", status: "Paid", orderId: "#ORD-4806" },
  { id: "#TCK-4824", ticket: "VIP", offer: "General", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Summer Party", venue: "Key Corner", status: "Refunded", orderId: "#ORD-4798" },
];

function TicketQr() {
  const size = 21;
  const finder = (row: number, column: number) => {
    const corners = [[0, 0], [0, 14], [14, 0]];
    return corners.some(([top, left]) => {
      const inside = row >= top && row < top + 7 && column >= left && column < left + 7;
      if (!inside) return false;
      const edge = row === top || row === top + 6 || column === left || column === left + 6;
      const center = row >= top + 2 && row <= top + 4 && column >= left + 2 && column <= left + 4;
      return edge || center;
    });
  };
  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      if (finder(row, column)) return true;
      if ((row < 7 && column < 7) || (row < 7 && column > 13) || (row > 13 && column < 7)) return false;
      return ((row * 7 + column * 11 + row * column) % 5) < 2;
    }),
  );

  return (
    <svg role="img" aria-label="Ticket QR code preview" viewBox={`0 0 ${size} ${size}`} className="mx-auto h-10 w-10 bg-white" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      {modules.flatMap((row, rowIndex) => row.map((filled, columnIndex) =>
        filled ? <rect key={`${rowIndex}-${columnIndex}`} x={columnIndex} y={rowIndex} width="1" height="1" fill="black" /> : null,
      ))}
    </svg>
  );
}

export default function TicketsTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredTickets = customerTickets.filter((ticket) =>
    `${ticket.id} ${ticket.ticket} ${ticket.event} ${ticket.venue} ${ticket.orderId}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    && (eventFilter === "all" || ticket.event === eventFilter)
    && (statusFilter === "all" || ticket.status === statusFilter)
    && (!month || ticket.month === month),
  );
  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const visibleTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showingStart = filteredTickets.length ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(currentPage * pageSize, filteredTickets.length);

  return (
    <section role="tabpanel" aria-label="Customer tickets" className="flex min-h-[460px] flex-col pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-black uppercase leading-none text-black">Tickets</h2>
        <ExportButton
          fileName="customer-tickets"
          headers={["Ticket ID", "Ticket", "Offer", "Date & time", "Event", "Venue", "Ticket status", "Order ID"]}
          rows={filteredTickets.map((ticket) => [ticket.id, ticket.ticket, ticket.offer, ticket.date, ticket.event, ticket.venue, ticket.status, ticket.orderId])}
        />
      </div>

      <div className="flex flex-col gap-3 border-b border-black/70 pb-3 xl:flex-row xl:items-center">
        <TabSearch value={search} onChange={(value) => { setSearch(value); setCurrentPage(1); }} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SelectFilter
            // label="Event"
            value={eventFilter}
            onChange={(value) => { setEventFilter(value); setCurrentPage(1); }}
            options={[
              { value: "all", label: "All events" },
              ...Array.from(new Set(customerTickets.map((ticket) => ticket.event))).map((event) => ({ value: event, label: event })),
            ]}
          />
          <SelectFilter
            // label="Status"
            value={statusFilter}
            onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
            options={[{ value: "all", label: "All statuses" }, { value: "Paid", label: "Paid" }, { value: "Refunded", label: "Refunded" }]}
          />
          <MonthFilter value={month} onChange={(value) => { setMonth(value); setCurrentPage(1); }} />
        </div>
      </div>

      <div className="mt-5 min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black text-[14px] font-bold uppercase text-black">
              <th className="py-5 px-3">Ticket ID</th>
              <th className="py-5 px-3">Ticket</th>
              <th className="py-5 px-3">Offer</th>
              <th className="py-5 px-3">Date &amp; time</th>
              <th className="py-5 px-3">Event</th>
              <th className="py-5 px-3">Venue</th>
              <th className="py-5 px-3 text-center">QR code</th>
              <th className="py-5 px-3">Ticket status</th>
              <th className="py-5 px-3">Order ID</th>
              <th className="py-5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-black text-[16px] text-black">
                <td className="px-3 py-2.5">{ticket.id}</td>
                <td className="px-3 py-2.5">{ticket.ticket}</td>
                <td className="px-3 py-2.5">{ticket.offer}</td>
                <td className="px-3 py-2.5">{ticket.date}</td>
                <td className="px-3 py-2.5">{ticket.event}</td>
                <td className="px-3 py-2.5">{ticket.venue}</td>
                <td className="px-3 py-1.5"><TicketQr /></td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 font-bold uppercase ${ticket.status === "Paid" ? "text-[#24b26b]" : "text-[#ff3838]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${ticket.status === "Paid" ? "bg-[#24b26b]" : "bg-[#ff3838]"}`} />
                    {ticket.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">{ticket.orderId}</td>
                <td className="px-3 py-2.5 text-center">
                  <button type="button" aria-label={`Actions for ${ticket.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.035] text-[18px] leading-none text-black/75">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 ? <p className="py-10 text-center text-[13px] text-black/50">No tickets match these filters.</p> : null}
      </div>

      <footer className="mt-auto flex min-h-[48px] flex-wrap items-center justify-between gap-3 pt-3 text-[12px] text-black/55">
        <p aria-live="polite">Showing {showingStart}-{showingEnd} of {filteredTickets.length} tickets</p>
        <div className="flex items-center gap-2 text-black">
          <nav aria-label="Ticket pages" className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35">‹</button>
            {totalPages > 0 ? <button type="button" aria-current="page" className="h-8 min-w-7 border border-black px-1 text-[12px]">{currentPage}</button> : null}
            <button type="button" aria-label="Next page" disabled={!totalPages || currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex h-8 min-w-7 items-center justify-center text-[16px] disabled:opacity-35">›</button>
          </nav>
          <label className="sr-only" htmlFor="ticket-page-size">Tickets per page</label>
          <select id="ticket-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-8 border border-black/50 bg-white px-2 text-[11px] text-black">
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </footer>
    </section>
  );
}