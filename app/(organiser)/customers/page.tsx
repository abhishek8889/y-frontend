"use client";

import { useEffect, useMemo, useState } from "react";
import {
  customerListPagination,
  customerListSummary,
  mapCustomerOverviewToCustomer,
  mapOrganisationCustomer,
  normalizeCustomerListItems,
  useGetCustomerListQuery,
  useGetCustomerOverviewQuery,
} from "@/apis/organisation/customersApi";
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
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";
import {
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
  customer: listCustomer,
  onBack,
  onAction,
}: {
  customer: Customer;
  onBack: () => void;
  onAction: (action: CustomerAction, customer: Customer) => void;
}) {
  const organisationTimezone = useOrganisationTimezone();
  const [activeTab, setActiveTab] = useState("Overview");
  const [passportMenuOpen, setPassportMenuOpen] = useState(false);

  const { data, isLoading, isFetching, isError } = useGetCustomerOverviewQuery({
    customerId: listCustomer.id,
  });

  const customer = useMemo(() => {
    if (!data?.data) return listCustomer;
    return mapCustomerOverviewToCustomer(
      data.data,
      organisationTimezone,
      listCustomer,
    );
  }, [data?.data, listCustomer, organisationTimezone]);

  const summary = data?.data?.summary;
  const organisationStatus =
    data?.data?.customer?.organisation_customer_status?.trim() ||
    customer.status;

  const fullName = customerFullName(customer);
  const initials = customerInitials(customer);
  const tabs = ["Overview", "Orders", "Products", "Attendance", "Activity"];

  const metrics = [
    {
      label: "Total orders",
      value: String(summary?.total_orders ?? customer.totalOrders),
    },
    {
      label: "Total tickets purchased",
      value: String(
        summary?.total_tickets_purchased ?? customer.ticketsPurchased,
      ),
    },
    {
      label: "Total spend",
      value:
        summary?.formatted_total_spent?.trim() ||
        formatCustomerSpend(customer.totalSpend),
    },
    {
      label: "Total refunded",
      value:
        summary?.formatted_total_refunded?.trim() ||
        formatCustomerSpend(customer.totalRefunded),
    },
    {
      label: "Events attended",
      value: String(summary?.events_attended ?? customer.attended),
    },
  ];

  const passportActions = useMemo<ActionMenuItem<Customer>[]>(
    () => [
      {
        key: "ticket",
        label: "Issue Complimentary Ticket",
        onClick: () => {
          onAction("ticket", customer);
          setPassportMenuOpen(false);
        },
      },
      {
        key: "suspend",
        label: "Suspend Account",
        variant: "danger",
        onClick: () => {
          onAction("suspend", customer);
          setPassportMenuOpen(false);
        },
      },
    ],
    [customer, onAction],
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
        <div className="customer-passport-identity">
          <div className="customer-passport-avatar" aria-hidden>
            {initials}
          </div>

          <div className="customer-passport-main">
            <div className="customer-passport-name-row">
              <h1 className="customer-passport-name">{fullName}</h1>
              <StatusBadge
                status={organisationStatus}
                className="customer-passport-status"
              />
            </div>
            <p className="customer-passport-id">{customer.customerId}</p>
            <div className="customer-passport-contacts">
              <span className="customer-passport-contact">{customer.email}</span>
              {customer.phone ? (
                <span className="customer-passport-contact">{customer.phone}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="customer-passport-meta">
          <div>
            <p className="customer-passport-meta-label">Customer since</p>
            <p className="customer-passport-meta-value">
              {isLoading && !data ? "…" : customer.customerSince}
            </p>
          </div>
          <div>
            <p className="customer-passport-meta-label">Last activity</p>
            <p className="customer-passport-meta-value">
              {isLoading && !data ? "…" : customer.lastActivity}
            </p>
          </div>
        </div>

        <div className="customer-passport-actions">
          <button
            type="button"
            className="page-primary-button-action"
            onClick={() => onAction("message", customer)}
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

      {isError ? (
        <p className="customer-panel-empty" role="alert">
          Could not load customer overview.
        </p>
      ) : null}

      <section className="customer-metric-grid" aria-label="Customer statistics">
        {metrics.map((metric) => (
          <article key={metric.label} className="customer-metric-card">
            <p className="customer-metric-label">{metric.label}</p>
            <p className="customer-metric-value">
              {isLoading && !data ? "…" : metric.value}
            </p>
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
        <OverviewTab
          overview={data?.data}
          isLoading={isLoading || isFetching}
          onOpenTab={setActiveTab}
        />
      ) : activeTab === "Orders" ? (
        <OrdersTab customerId={customer.id} />
      ) : activeTab === "Products" ? (
        <TicketsTab customerId={customer.id} />
      ) : activeTab === "Attendance" ? (
        <AttendanceTab />
      ) : (
        <ActivityTab />
      )}
    </main>
  );
}

export default function CustomersPage() {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCustomerAction, setActiveCustomerAction] = useState<{
    action: CustomerAction;
    customer: Customer;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const organisationTimezone = useOrganisationTimezone();

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    setCursor(undefined);
    setPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const { data, isLoading, isFetching, isError } = useGetCustomerListQuery({
    search: debouncedSearch.trim(),
    status: statusFilter === "all" ? "" : statusFilter,
    per_page: pageSize,
    cursor,
  });

  const apiCustomers = useMemo(
    () =>
      normalizeCustomerListItems(data?.data).map((item) =>
        mapOrganisationCustomer(item, organisationTimezone),
      ),
    [data?.data, organisationTimezone],
  );

  const customers = useMemo(() => {
    const apiIds = new Set(apiCustomers.map((customer) => customer.id));
    return [
      ...localCustomers.filter((customer) => !apiIds.has(customer.id)),
      ...apiCustomers,
    ];
  }, [apiCustomers, localCustomers]);

  const pagination = customerListPagination(data?.data);
  const canGoNext =
    Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const paginationTotal =
    pagination?.total != null
      ? pagination.total
      : canGoNext
        ? page * pageSize + 1
        : (page - 1) * pageSize + customers.length;

  const stats = useMemo(
    () => customerListSummary(data?.data, customers),
    [customers, data?.data],
  );

  const summaryItems = useMemo<GridCardItem[]>(
    () => [
      {
        id: "total",
        label: "Total customers",
        value: stats.total.toLocaleString("en-GB"),
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
      },
    ],
    [stats],
  );

  function handlePageChange(nextPage: number) {
    if (nextPage > page && pagination?.next_cursor) {
      setCursor(pagination.next_cursor);
      setPage(nextPage);
      return;
    }

    if (nextPage < page && pagination?.prev_cursor) {
      setCursor(pagination.prev_cursor);
      setPage(nextPage);
      return;
    }

    if (!pagination) {
      setPage(nextPage);
    }
  }

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
        id: "customerSince",
        header: "Customer since",
        accessorKey: "customerSince",
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
        id: "refunded",
        header: "Total refunded",
        cell: ({ row }) => formatCustomerSpend(row.totalRefunded),
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
      "Name",
      "Email",
      "Phone",
      "Customer since",
      "Total orders",
      "Attended",
      "Total spend",
      "Total refunded",
      "Last activity",
      "Status",
    ];
    const rows = customers.map((customer) => [
      customerFullName(customer),
      customer.email,
      customer.phone,
      customer.customerSince,
      customer.totalOrders,
      customer.attended,
      formatCustomerSpend(customer.totalSpend),
      formatCustomerSpend(customer.totalRefunded),
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
          onAction={(action, customer) =>
            setActiveCustomerAction({ action, customer })
          }
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
              data={customers}
              getRowId={(row) => row.id}
              features={{
                search: true,
                filters: true,
                pagination: true,
                pageSize: true,
              }}
              search={{
                value: search,
                onChange: setSearch,
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
              }}
              pagination={{
                page,
                pageSize,
                total: paginationTotal,
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              isLoading={isLoading || isFetching}
              isError={isError}
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
          setLocalCustomers((current) => [
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
              totalRefunded: 0,
              ticketsPurchased: 0,
              lastActivity: "Just now",
              customerSince: new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date()),
              lastOrder: null,
            },
            ...current,
          ]);
          setCursor(undefined);
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
