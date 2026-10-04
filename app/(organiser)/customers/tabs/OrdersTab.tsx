"use client";

import { useState } from "react";
import { ExportButton, MonthFilter, SelectFilter, TabSearch } from "../../events/tabs/TabControls";

type CustomerOrder = {
  id: string;
  date: string;
  month: string;
  event: string;
  venue: string;
  ticket: string;
  offer: string;
  items: number;
  amount: string;
  status: "Paid" | "Pending" | "Refunded";
  paymentMethod: string;
};

const customerOrders: CustomerOrder[] = [
  { id: "#ORD-4821", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "The Closing Party", venue: "Key Corner", ticket: "Adult GA", offer: "Late", items: 3, amount: "£18.00", status: "Paid", paymentMethod: "Card" },
  { id: "#ORD-4819", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Comedy Nights", venue: "Key Corner", ticket: "VIP", offer: "General", items: 4, amount: "£25.00", status: "Paid", paymentMethod: "Card" },
  { id: "#ORD-4806", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Summer Party", venue: "Key Corner", ticket: "VIP", offer: "General", items: 1, amount: "£25.00", status: "Pending", paymentMethod: "Card" },
  { id: "#ORD-4798", date: "Jul 1, 2026, 10:00 AM", month: "2026-07", event: "Summer Party", venue: "Key Corner", ticket: "VIP", offer: "General", items: 2, amount: "£25.00", status: "Refunded", paymentMethod: "Card" },
];

export default function OrdersTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const filteredOrders = customerOrders.filter((order) =>
    `${order.id} ${order.event} ${order.venue} ${order.ticket} ${order.paymentMethod}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    && (eventFilter === "all" || order.event === eventFilter)
    && (statusFilter === "all" || order.status === statusFilter)
    && (!month || order.month === month),
  );

  return (
    <section role="tabpanel" aria-label="Customer orders" className="pt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-black uppercase leading-none text-black">Orders</h2>
        <ExportButton
          fileName="customer-orders"
          headers={["Order ID", "Date & time", "Event", "Venue", "Ticket", "Offer & price", "Items", "Amount", "Ticket status", "Payment method"]}
          rows={filteredOrders.map((order) => [order.id, order.date, order.event, order.venue, order.ticket, order.offer, order.items, order.amount, order.status, order.paymentMethod])}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TabSearch value={search} onChange={setSearch} />
        <SelectFilter
          label="Event"
          value={eventFilter}
          onChange={setEventFilter}
          options={[
            { value: "all", label: "All events" },
            ...Array.from(new Set(customerOrders.map((order) => order.event))).map((event) => ({ value: event, label: event })),
          ]}
        />
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "Paid", label: "Paid" },
            { value: "Pending", label: "Pending" },
            { value: "Refunded", label: "Refunded" },
          ]}
        />
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black/70 text-[10px] font-bold uppercase text-black">
              <th className="px-3 py-3.5">Order ID</th>
              <th className="px-3 py-3.5">Date &amp; time</th>
              <th className="px-3 py-3.5">Event</th>
              <th className="px-3 py-3.5">Venue</th>
              <th className="px-3 py-3.5">Ticket</th>
              <th className="px-3 py-3.5">Offer &amp; price</th>
              <th className="px-3 py-3.5">Items</th>
              <th className="px-3 py-3.5">Amount</th>
              <th className="px-3 py-3.5">Ticket status</th>
              <th className="px-3 py-3.5">Payment method</th>
              <th className="px-3 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-black/75 text-[13px] text-black">
                <td className="px-3 py-4">{order.id}</td>
                <td className="px-3 py-4">{order.date}</td>
                <td className="px-3 py-4">{order.event}</td>
                <td className="px-3 py-4">{order.venue}</td>
                <td className="px-3 py-4">{order.ticket}</td>
                <td className="px-3 py-4">{order.offer}</td>
                <td className="px-3 py-4">{order.items}</td>
                <td className="px-3 py-4">{order.amount}</td>
                <td className="px-3 py-4">
                  <span className={`inline-flex items-center gap-1.5 font-bold uppercase ${order.status === "Paid" ? "text-[#24b26b]" : order.status === "Pending" ? "text-[#e6a800]" : "text-[#ff3838]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${order.status === "Paid" ? "bg-[#24b26b]" : order.status === "Pending" ? "bg-[#e6a800]" : "bg-[#ff3838]"}`} />
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-4">{order.paymentMethod}</td>
                <td className="px-3 py-3.5 text-center">
                  <button type="button" aria-label={`Actions for ${order.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.035] text-[18px] leading-none text-black/75">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-black/50">No orders match these filters.</p>
        ) : null}
      </div>
    </section>
  );
}