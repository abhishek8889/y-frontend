"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetRoleListQuery,
  type OrganisationRole,
} from "@/apis/organisation/rolesApi";
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
import { RoleFormDrawer } from "@/components/organiser/roles/RoleFormDrawer";
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

type RoleStatus = "Active" | "Inactive";

type RoleRow = {
  id: number;
  name: string;
  description: string;
  staffMembers: number;
  permissions: number;
  status: RoleStatus;
  created: string;
  updated: string;
};

function formatRoleDate(value: string | null | undefined) {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toRoleStatus(status: string | null | undefined): RoleStatus {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  return normalized === "inactive" ? "Inactive" : "Active";
}

function countPermissions(role: OrganisationRole) {
  if (typeof role.permissions_count === "number") return role.permissions_count;
  if (typeof role.permissions === "number") return role.permissions;
  if (Array.isArray(role.permissions)) return role.permissions.length;
  if (Array.isArray(role.permission_ids)) return role.permission_ids.length;
  return 0;
}

function mapApiRole(role: OrganisationRole): RoleRow {
  return {
    id: Number(role.id),
    name: role.name ?? "",
    description: role.description ?? "",
    staffMembers: Number(role.staff_members ?? role.staff_count ?? 0),
    permissions: countPermissions(role),
    status: toRoleStatus(role.status),
    created: formatRoleDate(role.created_at ?? role.created),
    updated: formatRoleDate(role.updated_at ?? role.updated),
  };
}

export default function RolesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    setCursor(undefined);
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const { data, isLoading, isFetching, isError } = useGetRoleListQuery({
    search: debouncedSearch.trim(),
    per_page: pageSize,
    cursor,
  });

  const pagination = data?.data?.pagination;

  useEffect(() => {
    setRoles((data?.data?.items ?? []).map(mapApiRole));
  }, [data?.data?.items]);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) => statusFilter === "all" || role.status.toLowerCase() === statusFilter,
    );
  }, [roles, statusFilter]);

  const canGoNext = Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const canGoPrev = Boolean(pagination?.prev_cursor) || page > 1;
  const paginationTotal = canGoNext
    ? page * pageSize + 1
    : (page - 1) * pageSize + filteredRoles.length;
  const hasListFilters = Boolean(debouncedSearch.trim()) || statusFilter !== "all";

  function openCreateDrawer() {
    setEditingRoleId(null);
    setRoleDrawerOpen(true);
  }

  function openEditDrawer(role: RoleRow) {
    setEditingRoleId(role.id);
    setOpenActionsId(null);
    setRoleDrawerOpen(true);
  }

  function toggleRoleStatus(roleId: number) {
    const today = formatRoleDate(new Date().toISOString());
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              status: role.status === "Active" ? "Inactive" : "Active",
              updated: today,
            }
          : role,
      ),
    );
    setOpenActionsId(null);
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

  const roleActions = useMemo<ActionMenuItem<RoleRow>[]>(
    () => [
      {
        key: "edit",
        label: "Edit role",
        icon: PencilIcon,
        onClick: (role) => openEditDrawer(role),
      },
      {
        key: "toggle-status",
        label: "Deactivate role",
        icon: CircleXIcon,
        hidden: (role) => role.status !== "Active",
        onClick: (role) => toggleRoleStatus(role.id),
      },
      {
        key: "activate",
        label: "Activate role",
        icon: CircleXIcon,
        hidden: (role) => role.status === "Active",
        onClick: (role) => toggleRoleStatus(role.id),
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<RoleRow>[]>(
    () => [
      {
        id: "name",
        header: "Role name",
        accessorKey: "name",
      },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="datatable-desc-cell">{row.description || "—"}</span>
        ),
      },
      {
        id: "staffMembers",
        header: "Staff member",
        cell: ({ row }) => String(row.staffMembers),
      },
      {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => String(row.permissions),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.status} className="datatable-status" />,
      },
      {
        id: "created",
        header: "Created",
        accessorKey: "created",
      },
      {
        id: "updated",
        header: "Last updated",
        accessorKey: "updated",
      },
      {
        id: "actions",
        header: "Action",
        align: "center",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={roleActions}
            open={openActionsId === row.id}
            onOpenChange={(nextOpen) => setOpenActionsId(nextOpen ? row.id : null)}
            ariaLabel={`Actions for ${row.name}`}
          />
        ),
      },
    ],
    [openActionsId, roleActions],
  );

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">Roles &amp; Permission</h1>
            <p className="page-subtitle">
              Create roles and assign permissions to control what staff members can access and do.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateDrawer}
            className="page-primary-button-action"
          >
            <span aria-hidden className="text-[18px] leading-none">
              +
            </span>
            Create role
          </Button>
        </div>

        <div className="mt-[26px]">
          <DataTable
            columns={columns}
            data={filteredRoles}
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
              placeholder: "Search..",
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
            errorMessage="Unable to load roles."
            emptyState={{
              title: hasListFilters ? "No roles found" : "No roles yet",
              subtitle: hasListFilters
                ? "Try adjusting your search or filters."
                : "Create a role to control what staff members can access and do.",
              showButton: !hasListFilters,
              buttonLabel: "+ Create role",
              onButtonClick: openCreateDrawer,
            }}
            bodyHeightClassName={false}
          />
        </div>
      </div>

      <RoleFormDrawer
        isOpen={roleDrawerOpen}
        roleId={editingRoleId}
        onClose={() => {
          setRoleDrawerOpen(false);
          setEditingRoleId(null);
        }}
        onSaved={() => {
          resetCursorAndPage();
        }}
      />
    </DashboardShell>
  );
}
