"use client";

import { useMemo, useState } from "react";
import { ExportButton, ResultNotice, RowActions, SelectFilter, TabSearch } from "./TabControls";

type Order = {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  ticket: string;
  offer: string;
  price: number;
  status: "Paid" | "Refunded";
  date: string;
};

const initialOrders: Order[] = [
  { id: "1", orderNumber: "#ORD-4821", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, status: "Paid", date: "01 Sep 2026, 10:00 AM" },
  { id: "2", orderNumber: "#ORD-4821", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, status: "Paid", date: "01 Sep 2026, 10:00 AM" },
  { id: "3", orderNumber: "#ORD-4821", name: "Smith Jon", email: "user@gmail.com", ticket: "Adult GA", offer: "Late", price: 18, status: "Paid", date: "01 Sep 2026, 10:00 AM" },
];

const ticketOptions = [{ value: "all", label: "All ticket type" }, { value: "Adult GA", label: "Adult GA" }, { value: "VIP", label: "VIP" }];
const statusOptions = [{ value: "all", label: "All status" }, { value: "Paid", label: "Paid" }, { value: "Refunded", label: "Refunded" }];
const periodOptions = [{ value: "all", label: "Time period" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }];

export default function OrdersTab({ eventTitle }: { eventTitle: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.orderNumber} ${order.name} ${order.email} ${order.ticket}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch
      && (ticketFilter === "all" || order.ticket === ticketFilter)
      && (statusFilter === "all" || order.status === statusFilter)
      && (periodFilter === "all" || periodFilter === "30");
  }), [orders, search, ticketFilter, statusFilter, periodFilter]);

  function handleAction(order: Order, action: string) {
    if (action === "Refund order") {
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: "Refunded" } : item));
      setNotice(`${order.orderNumber} has been marked as refunded.`);
      return;
    }
    setNotice(`${action}: ${order.name} (${order.email})`);
  }

  return (
    <section className="pt-4" aria-label={`${eventTitle} orders`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] font-black uppercase leading-none text-black">Orders</h3>
        <ExportButton
          fileName="event-orders"
          headers={["Order ID", "Name", "Email", "Ticket", "Offer", "Price", "Status", "Date & time"]}
          rows={filteredOrders.map((order) => [order.orderNumber, order.name, order.email, order.ticket, order.offer, order.price, order.status, order.date])}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TabSearch value={search} onChange={setSearch} />
        <SelectFilter value={ticketFilter} options={ticketOptions} onChange={setTicketFilter} />
        <SelectFilter value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <SelectFilter value={periodFilter} options={periodOptions} onChange={setPeriodFilter} />
      </div>
      {notice ? <ResultNotice onClose={() => setNotice("")}>{notice}</ResultNotice> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-y border-black text-[10px] font-bold uppercase text-black">
              <th className="py-[18px] px-3">Order ID</th>
              <th className="py-[18px] px-3">Name</th>
              <th className="py-[18px] px-3">Ticket name</th>
              <th className="py-[18px] px-3">Offer &amp; price</th>
              <th className="py-[18px] px-3">Ticket status</th>
              <th className="py-[18px] px-3">Date &amp; time</th>
              <th className="w-16 py-[18px] px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-black text-[16px] text-black">
                <td className="px-2.5 py-4">{order.orderNumber}</td>
                <td className="px-2.5 py-3.5">
                  <strong className="block font-bold">{order.name}</strong>
                  <span className="text-[14px] text-[#666]">{order.email}</span>
                </td>
                <td className="px-2.5 py-4">{order.ticket}</td>
                <td className="px-2.5 py-4">{order.offer} - ${order.price.toFixed(2)}</td>
                <td className="px-2.5 py-4">
                  <span className={`inline-flex items-center gap-1.5 font-bold uppercase ${order.status === "Paid" ? "text-[#16B957]" : "text-[#D93025]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${order.status === "Paid" ? "bg-[#16B957]" : "bg-[#D93025]"}`} />
                    {order.status}
                  </span>
                </td>
                <td className="px-2.5 py-4">{order.date}</td>
                <td className="px-2.5 py-3.5">
                  <RowActions label={order.orderNumber} actions={["Resend ticket on email", "Refund order", "View QR", "Customer information"]} onAction={(action) => handleAction(order, action)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 ? <p className="py-10 text-center text-[13px] text-black/50">No orders match these filters.</p> : null}
      </div>
    </section>
  );
}