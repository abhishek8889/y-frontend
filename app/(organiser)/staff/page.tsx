"use client";

import { useEffect, useMemo, useState } from "react";
import {
  staffDisplayName,
  staffRoleLabels,
  useGetStaffMemberListQuery,
  useManageStaffMemberStatusMutation,
  type StaffMember,
} from "@/apis/organisation/staffApi";
import {
  ActionMenu,
  DataTable,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
} from "@/components/common";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { StaffFormDrawer } from "@/components/organiser/staff/StaffFormDrawer";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M13 6.5 17.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CircleXIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="m9.5 9.5 5 5m0-5-5 5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

type StaffRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatarUrl: string;
  raw: StaffMember;
};

function formatJoinedDate(value: string | null | undefined) {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapStaffRow(member: StaffMember): StaffRow {
  return {
    id: Number(member.id),
    name: staffDisplayName(member),
    email: member.email?.trim() || "—",
    role: staffRoleLabels(member),
    status: member.status === "inactive" ? "Inactive" : "Active",
    joined: formatJoinedDate(member.joined_at ?? member.created_at),
    avatarUrl: member.profile_image_url?.trim() || "",
    raw: member,
  };
}

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    setCursor(undefined);
    setPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const { data, isLoading, isFetching, isError } = useGetStaffMemberListQuery({
    search: debouncedSearch.trim(),
    status: statusFilter === "all" ? "" : statusFilter,
    per_page: pageSize,
    cursor,
  });

  const [manageStatus, { isLoading: isManagingStatus }] =
    useManageStaffMemberStatusMutation();

  const members = useMemo(
    () => (data?.data?.items ?? []).map(mapStaffRow),
    [data?.data?.items],
  );
  const pagination = data?.data?.pagination;

  const canGoNext = Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const canGoPrev = Boolean(pagination?.prev_cursor) || page > 1;
  const paginationTotal = canGoNext
    ? page * pageSize + 1
    : (page - 1) * pageSize + members.length;
  const hasListFilters = Boolean(debouncedSearch.trim()) || statusFilter !== "all";

  function openCreateDrawer() {
    setEditingStaffId(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(member: StaffRow) {
    setEditingStaffId(member.id);
    setOpenActionsId(null);
    setDrawerOpen(true);
  }

  async function toggleStatus(member: StaffRow) {
    const nextStatus = member.status === "Active" ? "inactive" : "active";
    try {
      await manageStatus({
        staffId: member.id,
        body: { status: nextStatus },
      }).unwrap();
      setOpenActionsId(null);
    } catch {
      // toast handled by mutation
    }
  }

  function handlePageChange(nextPage: number) {
    if (nextPage > page && pagination?.next_cursor) {
      setCursor(pagination.next_cursor);
      setPage(nextPage);
      return;
    }

    if (nextPage < page && pagination?.prev_cursor) {
      setCursor(pagination.prev_cursor);
      setPage(nextPage);
    }
  }

  function resetCursorAndPage() {
    setCursor(undefined);
    setPage(1);
  }

  const staffActions = useMemo<ActionMenuItem<StaffRow>[]>(
    () => [
      {
        key: "edit",
        label: "Edit member",
        icon: PencilIcon,
        onClick: (member) => openEditDrawer(member),
      },
      {
        key: "deactivate",
        label: "Temporary inactive",
        icon: CircleXIcon,
        disabled: isManagingStatus,
        hidden: (member) => member.status !== "Active",
        onClick: (member) => {
          void toggleStatus(member);
        },
      },
      {
        key: "activate",
        label: "Reactivate member",
        icon: CircleXIcon,
        disabled: isManagingStatus,
        hidden: (member) => member.status === "Active",
        onClick: (member) => {
          void toggleStatus(member);
        },
      },
    ],
    [isManagingStatus],
  );

  const columns = useMemo<DataTableColumn<StaffRow>[]>(
    () => [
      {
        id: "name",
        header: "NAME",
        cell: ({ row }) => (
          <span className="flex min-w-[160px] items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] text-[10px] font-bold text-[#3f4754]"
              style={
                row.avatarUrl
                  ? {
                      backgroundImage: `url("${row.avatarUrl}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {row.avatarUrl ? null : initials(row.name)}
            </span>
            <span className="text-[14px] font-normal leading-5 text-black">{row.name}</span>
          </span>
        ),
      },
      {
        id: "email",
        header: "EMAIL",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[14px] font-normal leading-5 text-black">
            {row.email}
          </span>
        ),
      },
      {
        id: "role",
        header: "ROLE ASSIGNED",
        cell: ({ row }) => (
          <span className="text-[14px] font-normal leading-5 text-black">{row.role}</span>
        ),
      },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => (
          <StatusBadge
            status={row.status}
            className="font-heading gap-[9px] text-[14px] font-bold leading-5 tracking-normal"
          />
        ),
      },
      {
        id: "joined",
        header: "JOINED",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[14px] font-normal leading-5 text-black">
            {row.joined}
          </span>
        ),
      },
      {
        id: "actions",
        header: "ACTION",
        align: "center",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={staffActions}
            open={openActionsId === row.id}
            onOpenChange={(nextOpen) => setOpenActionsId(nextOpen ? row.id : null)}
            ariaLabel={`Actions for ${row.name}`}
          />
        ),
      },
    ],
    [openActionsId, staffActions],
  );

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-white p-5 md:p-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-[11px]">
            <h1 className="font-heading text-[24px] font-bold uppercase leading-[24.2px] text-black">
              Staff
            </h1>
            <p className="text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">
              Invite and manage staff members. Assign roles to control what they can access and do.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex h-auto cursor-pointer items-center justify-center gap-0.5 rounded-[4px] border border-black bg-black py-2.5 pl-1.5 pr-2.5 text-[14px] font-normal uppercase leading-[19.6px] text-white transition hover:opacity-90"
          >
            <span aria-hidden className="text-[18px] leading-none">
              +
            </span>
            ADD STAFF MEMBER
          </Button>
        </div>

        <div className="mt-[26px]">
          <DataTable
            columns={columns}
            data={members}
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
                resetCursorAndPage();
              },
              placeholder: "SEARCH",
            }}
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                value: statusFilter,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status") setStatusFilter(value);
              resetCursorAndPage();
            }}
            pagination={{
              page,
              pageSize,
              total: paginationTotal,
            }}
            onPageChange={(nextPage) => {
              if (nextPage > page && !canGoNext) return;
              if (nextPage < page && !canGoPrev) return;
              handlePageChange(nextPage);
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              resetCursorAndPage();
            }}
            isLoading={isLoading || isFetching}
            isError={isError}
            errorMessage="Unable to load staff members."
            emptyState={{
              title: hasListFilters ? "NO STAFF FOUND" : "NO STAFF YET",
              subtitle: hasListFilters
                ? "Try adjusting your search or filters."
                : "Add a staff member and assign roles to get started.",
              showButton: !hasListFilters,
              buttonLabel: "+ ADD STAFF MEMBER",
              onButtonClick: openCreateDrawer,
            }}
          />
        </div>
      </div>

      <StaffFormDrawer
        isOpen={drawerOpen}
        staffId={editingStaffId}
        onClose={() => {
          setDrawerOpen(false);
          setEditingStaffId(null);
        }}
        onSaved={() => {
          resetCursorAndPage();
        }}
      />
    </DashboardShell>
  );
}
