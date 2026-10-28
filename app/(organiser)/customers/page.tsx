"use client";

import { useMemo, useState } from "react";
import {
  ActionMenu,
  Breadcrumb,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
  type GridCardItem,
} from "@/components/common";
import { AddCustomerModal } from "@/components/organiser/customers/AddCustomerModal";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { FormSectionTabs } from "@/components/organiser/FormSectionTabs";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import {
  CUSTOMER_SEED,
  customerFullName,
  customerInitials,
  formatCustomerSpend,
  type Customer,
  type CustomerAction,
} from "./customerTypes";
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
    message: `Send direct messages or important updates to ${customerFullName(customer)}.`,
    ticket: `Provide a free ticket to ${customerFullName(customer)} for a specific event.`,
    suspend: "Temporarily restrict a supporter's access and privileges.",
  }[action];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-action-title"
        className="flex h-full w-full max-w-[620px] flex-col border-l border-black bg-white"
      >
        <header className="flex min-h-[82px] items-center justify-between gap-4 border-b border-black px-5 py-4">
          <div className="min-w-0">
            <h2
              id="customer-action-title"
              className="text-[18px] font-bold uppercase leading-[26px] text-black"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-[14px] leading-[18px] text-[#6E6B69]">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-[24px] leading-none text-black hover:bg-black/5"
          >
            ×
          </button>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {action === "suspend" ? (
              <>
                <div className="flex gap-3 rounded-[4px] border border-[#ff3838] bg-[#fff5f5] p-3 text-[13px] leading-[20px] text-[#ff2424]">
                  <span aria-hidden="true" className="text-[19px] leading-5">
                    △
                  </span>
                  <p>
                    Suspending this account will immediately revoke access to all tickets,
                    memberships, and the supporter portal. This action can be reversed.
                  </p>
                </div>
                <SelectField
                  name="suspensionReason"
                  label="Reason for suspension"
                  required
                  defaultValue="abusive"
                  density="compact"
                  options={[
                    { value: "abusive", label: "Abusive behaviour" },
                    { value: "fraud", label: "Fraudulent activity" },
                    { value: "policy", label: "Policy violation" },
                    { value: "other", label: "Other" },
                  ]}
                  className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                />
                <InputField
                  as="textarea"
                  name="notes"
                  label="Additional notes"
                  rows={4}
                  placeholder="Internal notes..."
                  className="!px-3 !py-2 !text-[13px]"
                  containerClassName="!min-h-[120px] !rounded-[4px] !border-black"
                />
              </>
            ) : null}

            {action === "message" ? (
              <>
                <SelectField
                  name="channel"
                  label="Channel"
                  defaultValue="email"
                  density="compact"
                  options={[
                    { value: "email", label: "Email" },
                    { value: "sms", label: "SMS" },
                  ]}
                  className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                />
                <InputField
                  name="subject"
                  label="Subject"
                  required
                  placeholder="Subject line..."
                  density="compact"
                  className="!px-3 !text-[13px]"
                  containerClassName="!rounded-[4px] !border-black"
                />
                <InputField
                  as="textarea"
                  name="message"
                  label="Message"
                  required
                  rows={5}
                  placeholder="Write your message..."
                  className="!px-3 !py-2 !text-[13px]"
                  containerClassName="!min-h-[140px] !rounded-[4px] !border-black"
                />
              </>
            ) : null}

            {action === "ticket" ? (
              <>
                <SelectField
                  name="event"
                  label="Event"
                  defaultValue="city-fc"
                  density="compact"
                  options={[
                    { value: "city-fc", label: "City FC vs Rovers United - 14 Jan 2025" },
                    { value: "closing-party", label: "The Closing Party - 24 Aug 2026" },
                  ]}
                  className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                />
                <SelectField
                  name="ticket"
                  label="Ticket"
                  defaultValue="adult"
                  density="compact"
                  options={[
                    { value: "adult", label: "Adult GA" },
                    { value: "concession", label: "Concession" },
                  ]}
                  className="!rounded-[4px] !border-black !px-3 !text-[13px] !normal-case"
                />
                <InputField
                  as="textarea"
                  name="internalNote"
                  label="Internal note"
                  rows={4}
                  placeholder="Add context..."
                  className="!px-3 !py-2 !text-[13px]"
                  containerClassName="!min-h-[120px] !rounded-[4px] !border-black"
                />
              </>
            ) : null}
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-black px-5 py-3">
            <Button
              type="button"
              onClick={onClose}
              className="h-[40px] cursor-pointer rounded border border-black bg-white text-[13px] font-medium uppercase text-black hover:bg-black/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-[40px] cursor-pointer rounded border border-black bg-black text-[13px] font-medium uppercase text-white hover:bg-white hover:text-black"
            >
              {action === "suspend"
                ? "Confirm suspension"
                : action === "message"
                  ? "Send message"
                  : "Issue ticket"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CustomerPassport({
  customer,
  onBack,
  onAction,
}: {
  customer: Customer;
  onBack: () => void;
  onAction: (action: CustomerAction) => void;
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [passportMenuOpen, setPassportMenuOpen] = useState(false);
  const fullName = customerFullName(customer);
  const initials = customerInitials(customer);
  const tabs = ["Overview", "Orders", "Products", "Attendance", "Activity"];

  const metrics = [
    { label: "Total orders", value: String(customer.totalOrders) },
    { label: "Total tickets purchased", value: String(customer.ticketsPurchased) },
    { label: "Total spend", value: formatCustomerSpend(customer.totalSpend) },
    { label: "Events attended", value: String(customer.attended) },
  ];

  const passportActions = useMemo<ActionMenuItem<Customer>[]>(
    () => [
      {
        key: "ticket",
        label: "Issue Complimentary Ticket",
        onClick: () => {
          onAction("ticket");
          setPassportMenuOpen(false);
        },
      },
      {
        key: "suspend",
        label: "Suspend Account",
        variant: "danger",
        onClick: () => {
          onAction("suspend");
          setPassportMenuOpen(false);
        },
      },
    ],
    [onAction],
  );

  return (
    <main className="customer-page">
      <Breadcrumb
        variant="dashboard"
        className="mb-4"
        items={[
          { label: "Customers", onClick: onBack },
          { label: fullName },
        ]}
      />

      <section className="customer-passport" aria-label="Customer passport">
        <div className="customer-passport-avatar" aria-hidden>
          {initials}
        </div>

        <div className="customer-passport-main">
          <div className="customer-passport-name-row">
            <h1 className="customer-passport-name">{fullName}</h1>
            <StatusBadge status={customer.status} className="text-[12px]" />
          </div>
          <p className="customer-passport-id">{customer.customerId}</p>
          <div className="customer-passport-contacts">
            <span className="customer-passport-contact">{customer.email}</span>
            {customer.phone ? (
              <span className="customer-passport-contact">{customer.phone}</span>
            ) : null}
          </div>
        </div>

        <div className="customer-passport-meta">
          <div>
            <p className="customer-passport-meta-label">Customer since</p>
            <p className="customer-passport-meta-value">{customer.customerSince}</p>
          </div>
          <div>
            <p className="customer-passport-meta-label">Last activity</p>
            <p className="customer-passport-meta-value">{customer.lastActivity}</p>
          </div>
        </div>

        <div className="customer-passport-actions">
          <button
            type="button"
            className="page-secondary-button"
            onClick={() => onAction("message")}
          >
            Send message
          </button>
          <ActionMenu
            row={customer}
            actions={passportActions}
            open={passportMenuOpen}
            onOpenChange={setPassportMenuOpen}
            ariaLabel={`More actions for ${fullName}`}
          />
        </div>
      </section>

      <section className="customer-metric-grid" aria-label="Customer statistics">
        {metrics.map((metric) => (
          <article key={metric.label} className="customer-metric-card">
            <p className="customer-metric-label">{metric.label}</p>
            <p className="customer-metric-value">{metric.value}</p>
          </article>
        ))}
      </section>

      <FormSectionTabs
        className="form-tabs-bar-inline"
        tabs={tabs.map((tab) => ({ id: tab, label: tab }))}
        activeTabId={activeTab}
        ariaLabel="Customer profile"
        asTablist
        mode="button"
        onTabSelect={setActiveTab}
      />

      {activeTab === "Overview" ? (
        <OverviewTab customer={customer} onAction={onAction} />
      ) : activeTab === "Orders" ? (
        <OrdersTab />
      ) : activeTab === "Products" ? (
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
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMER_SEED);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCustomerAction, setActiveCustomerAction] = useState<{
    action: CustomerAction;
    customer: Customer;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone} ${customer.customerId}`
          .toLowerCase()
          .includes(query);
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const pagedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((customer) => customer.status === "active").length;
    const inactive = customers.filter((customer) => customer.status === "inactive").length;
    const suspended = customers.filter((customer) => customer.status === "suspended").length;
    return { total, active, inactive, suspended };
  }, [customers]);

  const summaryItems = useMemo<GridCardItem[]>(
    () => [
      {
        id: "total",
        label: "Total customers",
        value: stats.total.toLocaleString("en-GB"),
        description: <span className="customer-stat-delta">+12% from last month</span>,
      },
      {
        id: "active",
        label: "Active",
        value: stats.active.toLocaleString("en-GB"),
      },
      {
        id: "inactive",
        label: "Inactive",
        value: stats.inactive.toLocaleString("en-GB"),
      },
      {
        id: "suspended",
        label: "Suspended",
        value: stats.suspended.toLocaleString("en-GB"),
        description: <span className="customer-stat-note">100 in this month</span>,
      },
    ],
    [stats],
  );

  const orderActions = useMemo<ActionMenuItem<Customer>[]>(
    () => [
      {
        key: "view",
        label: "View Profile",
        onClick: (customer) => {
          setSelectedCustomer(customer);
          setOpenActionId(null);
        },
      },
      {
        key: "message",
        label: "Message",
        onClick: (customer) => {
          setActiveCustomerAction({ action: "message", customer });
          setOpenActionId(null);
        },
      },
      {
        key: "ticket",
        label: "Issue Complimentary Ticket",
        onClick: (customer) => {
          setActiveCustomerAction({ action: "ticket", customer });
          setOpenActionId(null);
        },
      },
      {
        key: "suspend",
        label: "Suspend Account",
        onClick: (customer) => {
          setActiveCustomerAction({ action: "suspend", customer });
          setOpenActionId(null);
        },
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<Customer>[]>(
    () => [
      {
        id: "customerId",
        header: "Customer ID",
        accessorKey: "customerId",
      },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="customer-name-cell">
            <strong>{customerFullName(row)}</strong>
            <span>{row.email}</span>
          </div>
        ),
      },
      {
        id: "phone",
        header: "Phone",
        cell: ({ row }) => row.phone || "—",
      },
      {
        id: "orders",
        header: "Total orders",
        cell: ({ row }) => String(row.totalOrders),
      },
      {
        id: "attended",
        header: "Attended",
        cell: ({ row }) => String(row.attended),
      },
      {
        id: "spend",
        header: "Total spend",
        cell: ({ row }) => formatCustomerSpend(row.totalSpend),
      },
      {
        id: "lastActivity",
        header: "Last activity",
        accessorKey: "lastActivity",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.status} className="datatable-status" />,
      },
      {
        id: "actions",
        header: "Action",
        align: "center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={orderActions}
            open={openActionId === row.id}
            onOpenChange={(next) => setOpenActionId(next ? row.id : null)}
            ariaLabel={`Actions for ${customerFullName(row)}`}
          />
        ),
      },
    ],
    [openActionId, orderActions],
  );

  function exportCustomers() {
    const headers = [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Total orders",
      "Attended",
      "Total spend",
      "Last activity",
      "Status",
    ];
    const rows = filteredCustomers.map((customer) => [
      customer.customerId,
      customerFullName(customer),
      customer.email,
      customer.phone,
      customer.totalOrders,
      customer.attended,
      formatCustomerSpend(customer.totalSpend),
      customer.lastActivity,
      customer.status,
    ]);
    const escapeCell = (cell: string | number) => `"${String(cell).replaceAll('"', '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      {selectedCustomer ? (
        <CustomerPassport
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onAction={(action) => setActiveCustomerAction({ action, customer: selectedCustomer })}
        />
      ) : (
        <main className="customer-page">
          <div className="customer-page-header">
            <div>
              <h1 className="page-title">Customers</h1>
              <p className="page-subtitle">
                View and manage all your customers across sites, venues and events.
              </p>
            </div>
            <div className="customer-page-actions">
              <button
                type="button"
                className="page-secondary-button"
                onClick={() => setIsDialogOpen(true)}
              >
                + Add customer
              </button>
              <button
                type="button"
                className="page-primary-button-action"
                disabled={!customers.length}
                onClick={exportCustomers}
              >
                Export
              </button>
            </div>
          </div>

          <div className="customer-stats">
            {summaryItems.map((item) => (
              <div key={item.id ?? String(item.label)} className="organiser-grid-card gridcard-box">
                <p className="gridcard-title">
                  <span className="min-w-0">{item.label}</span>
                </p>
                <p className="gridcard-value">{item.value}</p>
                {item.description != null && item.description !== "" ? (
                  <div className="gridcard-description">{item.description}</div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <DataTable
              columns={columns}
              data={pagedCustomers}
              getRowId={(row) => row.id}
              features={{
                search: true,
                filters: true,
                pagination: true,
                pageSize: true,
              }}
              search={{
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: "Search..",
              }}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  type: "select",
                  value: statusFilter,
                  options: [
                    { value: "all", label: "All statuses" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "suspended", label: "Suspended" },
                  ],
                },
              ]}
              onFilterChange={(key, value) => {
                if (key === "status") setStatusFilter(value);
                setPage(1);
              }}
              pagination={{
                page,
                pageSize,
                total: filteredCustomers.length,
              }}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              bodyHeightClassName={false}
              emptyMessage="No customers found."
            />
          </div>
        </main>
      )}

      <AddCustomerModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(payload) => {
          const nextId = Date.now();
          setCustomers((current) => [
            {
              id: nextId,
              customerId: `SUP-${String(nextId).slice(-4)}`,
              firstName: payload.firstName,
              lastName: payload.lastName,
              email: payload.email,
              phone: payload.phone ? `${payload.phoneCode} ${payload.phone}` : "",
              entitlement: payload.entitlement,
              status: "active",
              totalOrders: 0,
              attended: 0,
              totalSpend: 0,
              ticketsPurchased: 0,
              lastActivity: "Just now",
              customerSince: new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date()),
            },
            ...current,
          ]);
          setPage(1);
          setIsDialogOpen(false);
        }}
      />

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
