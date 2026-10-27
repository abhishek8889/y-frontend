"use client";

import { useMemo, useState } from "react";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import { ExportButton, MonthFilter } from "../../events/tabs/TabControls";

type AttendanceRecord = {
  id: string;
  ticketId: string;
  product: string;
  orderId: string;
  event: string;
  status: "checked_in" | "not_checked_in";
  checkInTime: string;
  month: string;
};

const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    ticketId: "#TCK-4821",
    product: "Adult GA",
    orderId: "#ORD-4821",
    event: "The Closing Party",
    status: "checked_in",
    checkInTime: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "2",
    ticketId: "#TCK-4822",
    product: "VIP",
    orderId: "#ORD-4819",
    event: "Comedy Nights",
    status: "checked_in",
    checkInTime: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "3",
    ticketId: "#TCK-4823",
    product: "VIP",
    orderId: "#ORD-4806",
    event: "Summer Party",
    status: "checked_in",
    checkInTime: "Jul 1, 2026, 10:00 AM",
    month: "2026-07",
  },
  {
    id: "4",
    ticketId: "#TCK-4824",
    product: "VIP",
    orderId: "#ORD-4798",
    event: "Summer Party",
    status: "not_checked_in",
    checkInTime: "—",
    month: "2026-07",
  },
];

export default function AttendanceTab() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      attendanceRecords.filter(
        (record) =>
          `${record.ticketId} ${record.product} ${record.orderId} ${record.event}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (eventFilter === "all" || record.event === eventFilter) &&
          (!month || record.month === month),
      ),
    [search, eventFilter, month],
  );

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const actions = useMemo<ActionMenuItem<AttendanceRecord>[]>(
    () => [
      { key: "view", label: "View ticket", onClick: () => setOpenActionId(null) },
      {
        key: "checkin",
        label: "Mark checked in",
        onClick: () => setOpenActionId(null),
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<AttendanceRecord>[]>(
    () => [
      { id: "ticketId", header: "Ticket ID", accessorKey: "ticketId" },
      { id: "product", header: "Product", accessorKey: "product" },
      { id: "orderId", header: "Order ID", accessorKey: "orderId" },
      { id: "event", header: "Event", accessorKey: "event" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            status={row.status === "checked_in" ? "paid" : "cancelled"}
            label={row.status === "checked_in" ? "Checked in" : "Not checked in"}
            className="datatable-status"
          />
        ),
      },
      { id: "checkInTime", header: "Check in time", accessorKey: "checkInTime" },
      {
        id: "actions",
        header: "Action",
        align: "center",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={actions}
            open={openActionId === row.id}
            onOpenChange={(next) => setOpenActionId(next ? row.id : null)}
            ariaLabel={`Actions for ${row.ticketId}`}
          />
        ),
      },
    ],
    [actions, openActionId],
  );

  return (
    <section className="customer-tab-panel" aria-label="Customer attendance">
      <div className="customer-tab-header">
        <h2 className="customer-tab-title">Attendance</h2>
        <ExportButton
          fileName="customer-attendance"
          headers={[
            "Ticket ID",
            "Product",
            "Order ID",
            "Event",
            "Status",
            "Check in time",
          ]}
          rows={filtered.map((record) => [
            record.ticketId,
            record.product,
            record.orderId,
            record.event,
            record.status === "checked_in" ? "Checked in" : "Not checked in",
            record.checkInTime,
          ])}
        />
      </div>

      <DataTable
        columns={columns}
        data={paged}
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
            key: "event",
            label: "Event",
            type: "select",
            value: eventFilter,
            options: [
              { value: "all", label: "All events" },
              ...Array.from(new Set(attendanceRecords.map((record) => record.event))).map(
                (event) => ({ value: event, label: event }),
              ),
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "event") setEventFilter(value);
          setPage(1);
        }}
        toolbarExtra={
          <MonthFilter
            value={month}
            onChange={(value) => {
              setMonth(value);
              setPage(1);
            }}
          />
        }
        pagination={{ page, pageSize, total: filtered.length }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        bodyHeightClassName={false}
        emptyMessage="No attendance records match these filters."
      />
    </section>
  );
}
