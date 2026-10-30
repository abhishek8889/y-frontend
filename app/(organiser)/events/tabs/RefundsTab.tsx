"use client";

import { useMemo, useState } from "react";
import {
  normalizeEventRefundList,
  useGetEventRefundsQuery,
  type EventOrderRefund,
  type EventRefundOrderItem,
} from "@/apis/organisation/eventOrdersApi";
import { DataTable, type DataTableColumn } from "@/components/common";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";
import {
  formatStatusLabel,
  statusBgClass,
  statusTextClass,
} from "@/lib/ui/statusColors";
import { ExportButton } from "./TabControls";

const REASON_PREVIEW_LEN = 28;
const EXPORT_HEADERS = [
  "Order ID",
  "Customer",
  "Email",
  "Date",
  "Refund ID",
  "Amount",
  "Reason",
  "Status",
] as const;

type RefundsTabProps = {
  eventId: number;
  eventTitle: string;
};

function formatRefundDate(
  value: string | null | undefined,
  timeZone?: string | null,
) {
  return formatDateTime(value, {
    includeYear: true,
    emptyLabel: "—",
    timeZone,
  });
}

function money(
  formatted: string | null | undefined,
  amount: string | null | undefined,
  currencySign?: string | null,
) {
  if (formatted?.trim()) return formatted.trim();
  return `${currencySign?.trim() || "£"}${amount || "0.00"}`;
}

function refundStatusLabel(status: string | null | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (normalized === "succeeded") return "Refunded";
  return formatStatusLabel(status) || "—";
}

function orderMatchesQuery(order: EventRefundOrderItem, query: string) {
  const refundText = (order.refunds ?? [])
    .flatMap((refund) => [
      refund.unique_id,
      refund.reason,
      refund.status,
      refundStatusLabel(refund.status),
      refund.amount,
    ])
    .filter(Boolean)
    .join(" ");

  return [
    order.unique_id,
    order.customer_name,
    order.customer_email,
    order.status,
    formatStatusLabel(order.status),
    order.total_refunded,
    refundText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function ExpandChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={open ? "datatable-expand-chevron is-open" : "datatable-expand-chevron"}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 4.25 6 7.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReasonCell({ reason }: { reason: string }) {
  if (!reason) return <span className="refunds-muted">—</span>;

  const truncated = reason.length > REASON_PREVIEW_LEN;
  const preview = truncated
    ? reason.slice(0, REASON_PREVIEW_LEN).trimEnd()
    : reason;

  return (
    <div className="refunds-reason">
      <span className="refunds-reason__text">{preview}</span>
      {truncated ? (
        <span className="refunds-tip">
          <button
            type="button"
            className="refunds-tip__btn"
            aria-label="Read full refund reason"
          >
            ...
          </button>
          <span className="refunds-tip__bubble" role="tooltip">
            {reason}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function RefundChildRow({
  refund,
  currencySign,
  timeZone,
}: {
  refund: EventOrderRefund;
  currencySign: string;
  timeZone: string;
}) {
  const status = refundStatusLabel(refund.status);
  const statusClass = statusTextClass(refund.status);
  const refundId = refund.unique_id?.trim()
    ? `#${refund.unique_id.trim()}`
    : "—";

  return (
    <tr className="refunds-child">
      <td className="datatable-column-value refunds-child__cell refunds-col-details">
        <div className="refunds-child__details">
          <span className="refunds-child__id">{refundId}</span>
          <span className={`refunds-child__status ${statusClass}`.trim()}>
            <span
              className={`refunds-child__dot ${statusBgClass(refund.status)}`}
              aria-hidden
            />
            {status}
          </span>
        </div>
      </td>
      <td className="datatable-column-value refunds-child__cell refunds-col-customer">
        <ReasonCell reason={refund.reason?.trim() || ""} />
      </td>
      <td className="datatable-column-value refunds-child__cell refunds-col-date refunds-muted">
        {formatRefundDate(refund.refunded_at || refund.created_at, timeZone)}
      </td>
      <td className="datatable-column-value refunds-child__cell refunds-col-total text-right refunds-child__amount">
        {money(refund.formatted_amount, refund.amount, currencySign)}
      </td>
    </tr>
  );
}

function RefundChildRows({
  order,
  timeZone,
}: {
  order: EventRefundOrderItem;
  timeZone: string;
}) {
  const refunds = order.refunds ?? [];
  const currencySign = order.currency_sign?.trim() || "£";

  if (refunds.length === 0) {
    return (
      <tr className="refunds-child">
        <td
          className="datatable-column-value refunds-child__cell"
          colSpan={4}
        >
          <p className="refunds-child__empty">No refunds for this order.</p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {refunds.map((refund) => (
        <RefundChildRow
          key={refund.id}
          refund={refund}
          currencySign={currencySign}
          timeZone={timeZone}
        />
      ))}
    </>
  );
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "refunded", label: "Refunded" },
] as const;

export default function RefundsTab({ eventId, eventTitle }: RefundsTabProps) {
  const organisationTimezone = useOrganisationTimezone();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isFetching, isError } = useGetEventRefundsQuery({
    eventId,
  });

  const orders = useMemo(
    () => normalizeEventRefundList(data?.data),
    [data?.data],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(order.status ?? "").toLowerCase() === statusFilter;

      const matchesSearch = !query || orderMatchesQuery(order, query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  function toggleExpanded(orderId: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  const columns = useMemo<DataTableColumn<EventRefundOrderItem>[]>(
    () => [
      {
        id: "details",
        header: "ORDER / REFUND DETAILS",
        className: "refunds-col-details",
        headerClassName: "refunds-col-details",
        cell: ({ row }) => {
          const open = expandedIds.has(row.id);
          const canExpand = (row.refunds?.length ?? 0) > 0;

          return (
            <div className="refunds-parent">
              <button
                type="button"
                className="refunds-parent__toggle"
                aria-expanded={open}
                aria-label={
                  open
                    ? `Collapse refunds for ${row.unique_id}`
                    : `Expand refunds for ${row.unique_id}`
                }
                disabled={!canExpand}
                onClick={() => toggleExpanded(row.id)}
              >
                <ExpandChevron open={open} />
              </button>
              <span className="refunds-parent__id">{`#${row.unique_id}`}</span>
            </div>
          );
        },
      },
      {
        id: "customer",
        header: "CUSTOMER",
        className: "refunds-col-customer",
        headerClassName: "refunds-col-customer",
        cell: ({ row }) => (
          <div className="refunds-customer">
            <strong className="refunds-customer__name">
              {row.customer_name || "—"}
            </strong>
            <span className="refunds-customer__email">
              {row.customer_email || "—"}
            </span>
          </div>
        ),
      },
      {
        id: "date",
        header: "ORDER DATE",
        className: "refunds-col-date",
        headerClassName: "refunds-col-date",
        cell: ({ row }) =>
          formatRefundDate(row.paid_at || row.created_at, organisationTimezone),
      },
      {
        id: "total",
        header: "TOTAL",
        align: "right",
        className: "refunds-col-total",
        headerClassName: "refunds-col-total",
        cell: ({ row }) => (
          <span className="refunds-parent__total">
            {money(
              row.formatted_total_refunded,
              row.total_refunded,
              row.currency_sign,
            )}
          </span>
        ),
      },
    ],
    [expandedIds, organisationTimezone],
  );

  const exportRows = useMemo(
    () =>
      filteredOrders.flatMap((order) => {
        const refunds = order.refunds ?? [];
        if (refunds.length === 0) {
          return [
            [
              order.unique_id,
              order.customer_name || "",
              order.customer_email || "",
              formatRefundDate(
                order.paid_at || order.created_at,
                organisationTimezone,
              ),
              "",
              money(
                order.formatted_total_refunded,
                order.total_refunded,
                order.currency_sign,
              ),
              "",
              order.status,
            ],
          ];
        }

        return refunds.map((refund) => [
          order.unique_id,
          order.customer_name || "",
          order.customer_email || "",
          formatRefundDate(
            refund.refunded_at || refund.created_at,
            organisationTimezone,
          ),
          refund.unique_id,
          refund.formatted_amount || refund.amount || "",
          refund.reason || "",
          refund.status || "",
        ]);
      }),
    [filteredOrders, organisationTimezone],
  );

  return (
    <section className="pt-5" aria-label={`${eventTitle} refunds`}>
      <div className="event-panel-header">
        <div>
          <h3 className="event-panel-title">Refunds</h3>
          <p className="event-panel-subtitle">
            Track refund requests and completed payouts.
          </p>
        </div>
        <ExportButton
          fileName="event-refunds"
          headers={[...EXPORT_HEADERS]}
          rows={exportRows}
        />
      </div>

      <DataTable
        className="refunds-datatable"
        columns={columns}
        data={pagedOrders}
        getRowId={(row) => row.id}
        features={{ search: true, filters: true, pagination: true }}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          placeholder: "Search orders, customers, status, or refund IDs...",
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            value: statusFilter,
            options: [...STATUS_FILTER_OPTIONS],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatusFilter(value);
            setPage(1);
          }
        }}
        bodyHeightClassName={false}
        isLoading={isLoading || isFetching}
        isError={isError}
        errorMessage="Unable to load refunds."
        emptyMessage="No refunds match your search."
        pagination={{
          page,
          pageSize,
          total: filteredOrders.length,
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        isRowExpanded={(row) => expandedIds.has(row.id)}
        renderExpandedRows={({ row }) => (
          <RefundChildRows order={row} timeZone={organisationTimezone} />
        )}
      />
    </section>
  );
}
