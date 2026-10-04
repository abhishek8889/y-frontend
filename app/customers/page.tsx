"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import type { Customer, CustomerAction } from "./customerTypes";
import ActivityTab from "./tabs/ActivityTab";
import AttendanceTab from "./tabs/AttendanceTab";
import OrdersTab from "./tabs/OrdersTab";
import OverviewTab from "./tabs/OverviewTab";
import TicketsTab from "./tabs/TicketsTab";

function CustomerActionDrawer({
  action,
  customer,
  onClose,
}: {
  action: CustomerAction;
  customer: Customer;
  onClose: () => void;
}) {
  const title = {
    message: "Message customer",
    ticket: "Issue complimentary ticket",
    suspend: "Suspend account",
  }[action];
  const description = {
    message: `Send direct messages or important updates to ${customer.firstName} ${customer.lastName}.`,
    ticket: `Provide a free ticket to ${customer.firstName} ${customer.lastName} for a specific event.`,
    suspend: "Temporarily restrict a supporter's access and privileges.",
  }[action];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <section role="dialog" aria-modal="true" aria-labelledby="customer-action-title" className="flex h-full w-full max-w-[620px] flex-col border-l border-black bg-white">
        <header className="flex min-h-[82px] items-center justify-between gap-4 border-b border-black px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-black text-white" aria-hidden="true">
              {action === "suspend" ? (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 3 22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 9v5m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              ) : action === "message" ? (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H8l-4 3V5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 9h8m-8 4h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              ) : (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 8h16v12H4zM2 4h20v4H2zM12 4v16m0-16c-4.5 0-5-4-2.5-4S12 4 12 4Zm0 0c4.5 0 5-4 2.5-4S12 4 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              )}
            </div>
            <div className="min-w-0">
              <h2 id="customer-action-title" className="text-[17px] font-bold uppercase leading-[22px] text-black">{title}</h2>
              <p className="mt-0.5 text-[13px] leading-[18px] text-[#6F6E69]">{description}</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center text-[24px] leading-none text-black hover:bg-black/5">×</button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {action === "suspend" ? (
              <>
                <div className="flex gap-3 rounded-[4px] border border-[#ff3838] bg-[#fff5f5] p-3 text-[13px] leading-[20px] text-[#ff2424]">
                  <span aria-hidden="true" className="text-[19px] leading-5">△</span>
                  <p>Suspending this account will immediately revoke access to all tickets, memberships, and the supporter portal. This action can be reversed.</p>
                </div>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Reason for suspension
                  <SelectField
                    name="suspensionReason"
                    required
                    defaultValue="abusive"
                    density="compact"
                    options={[
                      { value: "abusive", label: "Abusive behaviour" },
                      { value: "fraud", label: "Fraudulent activity" },
                      { value: "policy", label: "Policy violation" },
                      { value: "other", label: "Other" },
                    ]}
                    containerClassName="mt-1.5"
                    className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                  />
                </label>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Additional notes
                  <InputField as="textarea" rows={4} placeholder="Internal notes..." className="!px-3 !py-2 !text-[13px]" containerClassName="mt-1.5 !min-h-[120px] !rounded-[4px] !border-black" />
                </label>
              </>
            ) : null}

            {action === "message" ? (
              <>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Channel
                  <SelectField
                    name="channel"
                    defaultValue="email"
                    density="compact"
                    options={[{ value: "email", label: "Email" }, { value: "sms", label: "SMS" }]}
                    containerClassName="mt-1.5"
                    className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                  />
                </label>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Subject
                  <InputField name="subject" required placeholder="Subject line..." density="compact" className="!px-3 !text-[13px]" containerClassName="mt-1.5 !rounded-[4px] !border-black" />
                </label>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Message
                  <InputField as="textarea" name="message" required rows={5} placeholder="Write your message..." className="!px-3 !py-2 !text-[13px]" containerClassName="mt-1.5 !min-h-[140px] !rounded-[4px] !border-black" />
                </label>
              </>
            ) : null}

            {action === "ticket" ? (
              <>
                  <SelectField
                    name="event"
                    defaultValue="city-fc"
                    density="compact"
                    options={[
                      { value: "city-fc", label: "City FC vs Rovers United - 14 Jan 2025" },
                      { value: "closing-party", label: "The Closing Party - 24 Aug 2026" },
                    ]}
                    containerClassName="mt-1.5"
                    className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                  />
                  <SelectField
                    name="ticket"
                    defaultValue="adult"
                    density="compact"
                    options={[{ value: "adult", label: "Adult GA" }, { value: "concession", label: "Concession" }]}
                    containerClassName="mt-1.5"
                    className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                  />
                <label className="block text-[12px] font-bold uppercase text-black">
                  Ticket type
                  <InputField name="ticketType" required placeholder="e.g. General" density="compact" className="!px-3 !text-[13px]" containerClassName="mt-1.5 !rounded-[4px] !border-black" />
                </label>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Allocation
                  <SelectField
                    name="allocation"
                    defaultValue="vip"
                    density="compact"
                    options={[{ value: "vip", label: "VIP / guest" }, { value: "general", label: "General admission" }]}
                    containerClassName="mt-1.5"
                    className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                  />
                </label>
                <label className="block text-[12px] font-bold uppercase text-black">
                  Internal note
                  <InputField as="textarea" name="internalNote" rows={4} placeholder="Add context..." className="!px-3 !py-2 !text-[13px]" containerClassName="mt-1.5 !min-h-[120px] !rounded-[4px] !border-black" />
                </label>
              </>
            ) : null}
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-black px-5 py-3">
            <Button type="button" onClick={onClose} className="h-[40px] border border-black bg-white text-[13px] font-medium uppercase text-black hover:bg-black/5">Cancel</Button>
            <Button type="submit" className="h-[40px] border border-black bg-black text-[13px] font-medium uppercase text-white hover:bg-white hover:text-black">
              {action === "suspend" ? "Confirm suspension" : action === "message" ? "Send message" : "Issue ticket"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CustomerProfile({
  customer,
  onBack,
  onAction,
}: {
  customer: Customer;
  onBack: () => void;
  onAction: (action: CustomerAction) => void;
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();
  const tabs = ["Overview", "Orders", "Tickets", "Attendance", "Activity"];

  return (
    <main className="min-h-full bg-white p-5 md:p-6">
      <button type="button" onClick={onBack} className="mb-3 text-[12px] text-[#78899c] hover:text-black">
        ‹ Back to Customers
      </button>

      <section className="flex flex-wrap items-center gap-4 border border-black p-4 md:px-5 md:py-6">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-black/60 text-[20px] font-bold text-black">
          {initials}
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-bold leading-6 text-[#202b38]">{fullName}</h1>
            <span className="bg-[#e8f8ee] px-2 py-1 text-[10px] font-bold uppercase text-[#24b26b]">● Active</span>
          </div>
          <p className="mt-1 text-[12px] text-black/80">CUST-{String(customer.id).slice(-6)}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-black/60">
            <span>{customer.email}</span>
            {customer.phone ? <span>{customer.phone}</span> : null}
            <span>Birmingham, UK</span>
          </div>
        </div>
        <div className="flex gap-7 text-[11px]">
          <div><p className="font-bold uppercase text-[#94a0af]">Customer since</p><p className="mt-1 font-semibold text-[#202b38]">12 Jan 2024</p></div>
          <div><p className="font-bold uppercase text-[#94a0af]">Last activity</p><p className="mt-1 font-semibold text-[#202b38]">12 Jan 2025</p></div>
        </div>
        <Button type="button" onClick={() => onAction("message")} className="h-[36px] border border-black px-3 text-[11px] font-bold uppercase text-black hover:bg-black hover:text-white">Send message</Button>
        <button type="button" aria-label="More customer actions" className="h-8 w-8 border border-black/15 text-[18px] text-black/70 hover:bg-black/5">⋮</button>
      </section>

      <section aria-label="Customer statistics" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total orders", value: "0" },
          { label: "Total spend", value: "£0.00" },
          { label: "Events attended", value: "0" },
          { label: "Upcoming events", value: "0" },
        ].map((stat) => (
          <div key={stat.label} className="min-h-[70px] border border-black p-3">
            <p className="text-[10px] font-bold uppercase text-[#999999]">{stat.label}</p>
            <p className="mt-1 text-[18px] font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </section>

      <nav aria-label="Customer profile" role="tablist" className="mt-4 flex gap-7 overflow-x-auto border-b border-black/20">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 px-1 py-3 text-[11px] font-bold uppercase ${activeTab === tab ? "border-black text-black" : "border-transparent text-black/40 hover:text-black"}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" ? (
        <OverviewTab customer={customer} onAction={onAction} />
      ) : activeTab === "Orders" ? (
        <OrdersTab />
      ) : activeTab === "Tickets" ? (
        <TicketsTab />
      ) : activeTab === "Attendance" ? (
        <AttendanceTab />
      ) : (
        <ActivityTab />
      )}
    </main>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCustomerAction, setActiveCustomerAction] = useState<{ action: CustomerAction; customer: Customer } | null>(null);
  const [search, setSearch] = useState("");
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const filteredCustomers = customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const pageStart = (currentPage - 1) * pageSize;
  const pageCustomers = filteredCustomers.slice(pageStart, pageStart + pageSize);
  const showingStart = filteredCustomers.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + pageSize, filteredCustomers.length);
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

  function handleAddCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const entitlement = String(formData.get("entitlement") ?? "").trim();

    setCustomers((currentCustomers) => [
      ...currentCustomers,
      { id: Date.now(), firstName, lastName, email, phone, entitlement },
    ]);
    setCurrentPage(1);
    setIsDialogOpen(false);
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      {selectedCustomer ? (
        <CustomerProfile
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onAction={(action) => setActiveCustomerAction({ action, customer: selectedCustomer })}
        />
      ) : (
        <>
      <main className="flex min-h-full flex-col bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold uppercase leading-[32px] tracking-[-0.05em] text-black md:text-[32px]">
              Customers
            </h1>
            <p className="mt-1 text-[14px] leading-[20px] text-[#6F6E69]">
              View and manage all your customers across sites, venues and events.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white px-4 text-[12px] font-bold uppercase text-black transition hover:bg-black hover:text-white"
            >
              + Add customer
            </Button>
            <Button
              type="button"
              disabled={!customers.length}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↓ Export
            </Button>
          </div>
        </div>

        <section aria-label="Customer overview" className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { label: "Total customers", value: customers.length.toLocaleString() },
            { label: "Ticket buyers", value: customers.length.toLocaleString() },
            { label: "Total orders", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="min-h-[82px] border border-black p-4">
              <p className="text-[11px] font-bold uppercase text-[#AAAAAC]">{stat.label}</p>
              <p className="mt-1 text-[20px] font-bold leading-6 text-black">{stat.value}</p>
              <p className="mt-1 text-[12px] text-black/45">Current overview</p>
            </div>
          ))}
        </section>

        <div className="mt-5 flex flex-col gap-3 border-b border-black/35 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex h-[40px] min-w-0 flex-1 items-center gap-2 border-b border-black/35 px-2 text-black/60 focus-within:border-black xl:max-w-[540px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="SEARCH"
              aria-label="Search customers"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-black placeholder:text-black/55 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select aria-label="Site" defaultValue="all" className="h-[38px] min-w-0 border border-black bg-white px-2 text-[11px] font-bold uppercase text-black xl:w-[125px]">
              <option value="all">All sites</option>
            </select>
            <select aria-label="Event" defaultValue="all" className="h-[38px] min-w-0 border border-black bg-white px-2 text-[11px] font-bold uppercase text-black xl:w-[125px]">
              <option value="all">All events</option>
            </select>
            <select aria-label="Status" defaultValue="all" className="h-[38px] min-w-0 border border-black bg-white px-2 text-[11px] font-bold uppercase text-black xl:w-[125px]">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
            </select>
            <button type="button" className="h-[38px] border border-black px-3 text-[11px] font-bold uppercase text-black">More filters</button>
          </div>
        </div>

        <div className="mt-2 flex min-h-[320px] min-w-0 flex-1 flex-col">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/35 text-[10px] font-bold uppercase text-black/75">
                <th className="px-2 py-3">First name</th>
                <th className="px-2 py-3">Email</th>
                <th className="px-2 py-3">Phone</th>
                <th className="px-2 py-3">Customer ID</th>
                <th className="px-2 py-3">Total orders</th>
                <th className="px-2 py-3">Attended</th>
                <th className="px-2 py-3">Total spend</th>
                <th className="px-2 py-3">Last activity</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3 text-right">Action</th>
              </tr>
            </thead>
            {filteredCustomers.length ? (
              <tbody>
                {pageCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-black/35 text-[12px] text-black last:border-b-0">
                    <td className="px-2 py-3">{customer.firstName} {customer.lastName}</td>
                    <td className="px-2 py-3">{customer.email}</td>
                    <td className="px-2 py-3">{customer.phone || "-"}</td>
                    <td className="px-2 py-3">CUS-{String(customer.id).slice(-6)}</td>
                    <td className="px-2 py-3">0</td>
                    <td className="px-2 py-3">0</td>
                    <td className="px-2 py-3">£0</td>
                    <td className="px-2 py-3">-</td>
                    <td className="px-2 py-3 font-bold uppercase text-[#24b26b]">● Active</td>
                    <td className="px-2 py-2 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          aria-label={`Actions for ${customer.firstName} ${customer.lastName}`}
                          aria-haspopup="menu"
                          aria-expanded={openActionId === customer.id}
                          onClick={() => setOpenActionId(openActionId === customer.id ? null : customer.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none text-black/70 hover:bg-black/5"
                        >
                          ⋮
                        </button>
                        {openActionId === customer.id ? (
                          <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-[230px] border border-black/70 bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.14)]">
                            {[
                              { label: "View Profile", icon: "◉" },
                              { label: "Message", icon: "✉" },
                              { label: "Issue Complimentary Ticket", icon: "▣" },
                              { label: "Suspend Account", icon: "△" },
                            ].map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setOpenActionId(null);
                                  if (action.label === "View Profile") {
                                    setSelectedCustomer(customer);
                                  } else if (action.label === "Message") {
                                    setActiveCustomerAction({ action: "message", customer });
                                  } else if (action.label === "Issue Complimentary Ticket") {
                                    setActiveCustomerAction({ action: "ticket", customer });
                                  } else if (action.label === "Suspend Account") {
                                    setActiveCustomerAction({ action: "suspend", customer });
                                  }
                                }}
                                className="flex min-h-[28px] w-full items-center gap-2 px-2 text-left text-[12px] text-black hover:bg-black/5 focus:bg-black/5 focus:outline-none"
                              >
                                <span aria-hidden="true" className="w-4 text-center text-black/65">{action.icon}</span>
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : null}
            </table>
            {!filteredCustomers.length ? (
              <section className="flex min-h-[280px] items-center justify-center px-4 py-12 text-center" aria-live="polite">
              <div>
                <h2 className="text-[20px] font-bold uppercase leading-[26px] text-black">No customers found</h2>
                <p className="mt-2 text-[14px] leading-[21px] text-black/60">
                  {customers.length ? "Try a different search." : "Add your first customer to see them listed here."}
                </p>
                {!customers.length ? (
                  <Button type="button" onClick={() => setIsDialogOpen(true)} className="mt-5 inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-5 text-[12px] font-bold uppercase text-white transition hover:bg-white hover:text-black">
                    + Add customer
                  </Button>
                ) : null}
              </div>
              </section>
            ) : null}
          </div>

          {filteredCustomers.length > 0 ? (
            <footer className="mt-auto flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-t border-black/35 py-2 text-[12px] text-black/55">
              <p aria-live="polite">Showing {showingStart}-{showingEnd} of {filteredCustomers.length.toLocaleString()} customers</p>
              <div className="flex flex-wrap items-center justify-end gap-2 text-black">
                <nav aria-label="Customer pages" className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="flex h-8 min-w-7 items-center justify-center px-1 text-[16px] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ‹
                  </button>
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-7 border px-1 text-[12px] ${currentPage === page ? "border-black text-black" : "border-transparent text-black/65 hover:border-black/40"}`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 ? (
                    <>
                      <span className="px-1 text-black/50" aria-hidden="true">...</span>
                      <button
                        type="button"
                        aria-current={currentPage === totalPages ? "page" : undefined}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`h-8 min-w-9 border px-1 text-[12px] ${currentPage === totalPages ? "border-black text-black" : "border-transparent text-black/65 hover:border-black/40"}`}
                      >
                        {totalPages.toLocaleString()}
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={!totalPages || currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="flex h-8 min-w-7 items-center justify-center px-1 text-[16px] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ›
                  </button>
                </nav>
                <label className="sr-only" htmlFor="customer-page-size">Customers per page</label>
                <select
                  id="customer-page-size"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 border border-black/50 bg-white px-2 text-[11px] text-black"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </footer>
          ) : null}
        </div>
      </main>

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <section role="dialog" aria-modal="true" aria-labelledby="add-customer-title" className="flex h-full w-full max-w-[780px] flex-col border-l border-black bg-white">
            <header className="flex min-h-[102px] items-center justify-between gap-4 border-b border-black px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[5px] bg-black text-white" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M2.5 20c.3-3.4 2.7-5.5 6.5-5.5s6.2 2.1 6.5 5.5M17 5.5a3.5 3.5 0 0 1 0 6.8M17.5 15c2.4.7 3.7 2.3 4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 id="add-customer-title" className="text-[20px] font-bold uppercase leading-[26px] text-black">Add customer</h2>
                  <p className="mt-1 text-[14px] leading-[20px] text-[#6F6E69]">Fill in the details to register a customer.</p>
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setIsDialogOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center text-[26px] leading-none text-black hover:bg-black/5">×</button>
            </header>

            <form onSubmit={handleAddCustomer} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 md:px-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[14px] font-bold uppercase text-black">
                    First name
                    <input name="firstName" required autoFocus placeholder="Enter first name" className="mt-2 block h-[45px] w-full rounded-[4px] border border-black bg-white px-3 text-[16px] font-normal normal-case placeholder:text-black/55 outline-none focus:ring-2 focus:ring-[#1688e8]" />
                  </label>
                  <label className="block text-[14px] font-bold uppercase text-black">
                    Last name
                    <input name="lastName" required placeholder="Enter last name" className="mt-2 block h-[45px] w-full rounded-[4px] border border-black bg-white px-3 text-[16px] font-normal normal-case placeholder:text-black/55 outline-none focus:ring-2 focus:ring-[#1688e8]" />
                  </label>
                </div>
                <label className="block text-[14px] font-bold uppercase text-black">
                  Email
                  <input name="email" type="email" required placeholder="Enter email" className="mt-2 block h-[45px] w-full rounded-[4px] border border-black bg-white px-3 text-[16px] font-normal normal-case placeholder:text-black/55 outline-none focus:ring-2 focus:ring-[#1688e8]" />
                </label>
                <label className="block text-[14px] font-bold uppercase text-black">
                  Phone
                  <input name="phone" type="tel" placeholder="+44 7712 345678" className="mt-2 block h-[45px] w-full rounded-[4px] border border-black bg-white px-3 text-[16px] font-normal normal-case placeholder:text-black/55 outline-none focus:ring-2 focus:ring-[#1688e8]" />
                </label>
                <label className="block text-[14px] font-bold uppercase text-black">
                  Entitlement
                  <input name="entitlement" placeholder="Add entitlement" className="mt-2 block h-[45px] w-full rounded-[4px] border border-black bg-white px-3 text-[16px] font-normal normal-case placeholder:text-black/55 outline-none focus:ring-2 focus:ring-[#1688e8]" />
                </label>
              </div>     

              <footer className="grid grid-cols-2 gap-3 border-t border-black px-6 py-4 md:px-8">
                <Button type="button" onClick={() => setIsDialogOpen(false)} className="h-[49px] rounded-[4px] border border-black bg-white text-[14px] font-medium uppercase text-black hover:bg-black/5">Cancel</Button>
                <Button type="submit" className="h-[49px] rounded-[4px] border border-black bg-black text-[14px] font-medium uppercase text-white hover:bg-white hover:text-black">+ Add supporter</Button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
        </>
      )}
      {activeCustomerAction ? (
        <CustomerActionDrawer
          action={activeCustomerAction.action}
          customer={activeCustomerAction.customer}
          onClose={() => setActiveCustomerAction(null)}
        />
      ) : null}
    </DashboardShell>
  );
}
