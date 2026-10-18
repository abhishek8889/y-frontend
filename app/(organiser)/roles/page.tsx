"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  extractRolePermissionIds,
  normalizePermissionsList,
  useCreateRoleMutation,
  useGetPermissionsListQuery,
  useGetRoleListQuery,
  useGetRoleWithPermissionsQuery,
  useUpdateRoleMutation,
  type OrganisationRole,
} from "@/apis/organisation/rolesApi";
import {
  ActionMenu,
  DataTableEmpty,
  StatusBadge,
  type ActionMenuItem,
} from "@/components/common";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { InputField } from "@/components/ui/InputField";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { appToast } from "@/lib/ui/toast";

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

const CopyIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M6 15V6.5A1.5 1.5 0 0 1 7.5 5H16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
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

type Role = {
  id: number;
  slug: string;
  name: string;
  description: string;
  staffMembers: number;
  permissions: number;
  permissionIds: string[];
  status: RoleStatus;
  created: string;
  updated: string;
};

const ROLES_PAGE_SIZE = 10;

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

function mapPermissionIds(role: OrganisationRole) {
  if (Array.isArray(role.permission_ids)) return role.permission_ids.map(String);
  if (Array.isArray(role.permissions)) return role.permissions.map(String);
  return [];
}

function mapApiRole(role: OrganisationRole): Role {
  return {
    id: Number(role.id),
    slug: String(role.slug ?? role.id),
    name: role.name ?? "",
    description: role.description ?? "",
    staffMembers: Number(role.staff_members ?? role.staff_count ?? 0),
    permissions: countPermissions(role),
    permissionIds: mapPermissionIds(role),
    status: toRoleStatus(role.status),
    created: formatRoleDate(role.created_at ?? role.created),
    updated: formatRoleDate(role.updated_at ?? role.updated),
  };
}

function toNumericPermissionIds(
  selectedIds: string[],
  permissionById: Map<string, { value: string | number; key: string }>,
) {
  const ids: number[] = [];
  for (const selectedId of selectedIds) {
    const value = permissionById.get(selectedId)?.value ?? selectedId;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) ids.push(numeric);
  }
  return ids;
}

export default function RolesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [detailsHydratedId, setDetailsHydratedId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<string[]>([]);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    setCursor(undefined);
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError } = useGetRoleListQuery({
    search: debouncedSearch.trim(),
    per_page: ROLES_PAGE_SIZE,
    cursor,
  });
  const {
    data: permissionsData,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = useGetPermissionsListQuery(undefined, { skip: !roleDialogOpen });
  const {
    data: roleDetailsData,
    isLoading: isRoleDetailsLoading,
    isError: isRoleDetailsError,
    isFetching: isRoleDetailsFetching,
  } = useGetRoleWithPermissionsQuery(editingRoleId as number, {
    skip: !roleDialogOpen || editingRoleId == null,
  });
  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();

  const permissionGroups = useMemo(
    () => normalizePermissionsList(permissionsData?.data),
    [permissionsData?.data],
  );

  const permissionById = useMemo(() => {
    const map = new Map<string, { value: string | number; key: string }>();
    for (const group of permissionGroups) {
      for (const permission of group.permissions) {
        map.set(permission.id, { value: permission.value, key: permission.key });
      }
    }
    return map;
  }, [permissionGroups]);

  const [roles, setRoles] = useState<Role[]>([]);
  const pagination = data?.data?.pagination;

  useEffect(() => {
    setRoles((data?.data?.items ?? []).map(mapApiRole));
  }, [data?.data?.items]);

  useEffect(() => {
    if (!roleDialogOpen || !permissionGroups.length) return;
    setExpandedPermissionGroups((current) =>
      current.length ? current : [permissionGroups[0].module],
    );
    setSelectedPermissions((current) => {
      if (!current.length) return current;
      const resolved = new Set<string>();
      for (const group of permissionGroups) {
        for (const permission of group.permissions) {
          if (
            current.includes(permission.id) ||
            current.includes(permission.key) ||
            current.includes(String(permission.value))
          ) {
            resolved.add(permission.id);
          }
        }
      }
      return resolved.size ? Array.from(resolved) : current;
    });
  }, [permissionGroups, roleDialogOpen]);

  useEffect(() => {
    if (!roleDialogOpen || editingRoleId == null) {
      setDetailsHydratedId(null);
      return;
    }

    const detail = roleDetailsData?.data;
    if (!detail || detailsHydratedId === editingRoleId) return;
    if (detail.id != null && Number(detail.id) !== editingRoleId) return;

    setRoleName(detail.name ?? "");
    setDescription(detail.description ?? "");
    setSelectedPermissions(extractRolePermissionIds(detail));
    setDetailsHydratedId(editingRoleId);
  }, [roleDialogOpen, editingRoleId, roleDetailsData?.data, detailsHydratedId]);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) => statusFilter === "all" || role.status.toLowerCase() === statusFilter,
    );
  }, [roles, statusFilter]);

  const canGoNext = Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const canGoPrev = Boolean(pagination?.prev_cursor) || page > 1;
  const isSavingRole = isCreatingRole || isUpdatingRole;
  const isEditDialogLoading =
    editingRoleId != null &&
    (isRoleDetailsLoading || isRoleDetailsFetching) &&
    detailsHydratedId !== editingRoleId;

  function openCreateDialog() {
    setEditingRoleId(null);
    setDetailsHydratedId(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setExpandedPermissionGroups([]);
    setRoleDialogOpen(true);
  }

  function openEditDialog(role: Role) {
    setEditingRoleId(role.id);
    setDetailsHydratedId(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setExpandedPermissionGroups([]);
    setOpenActionsId(null);
    setRoleDialogOpen(true);
  }

  function togglePermissionGroup(groupId: string) {
    setExpandedPermissionGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  }

  function togglePermissionGroupSelection(groupId: string, permissionIds: string[]) {
    const allSelected = permissionIds.every((id) => selectedPermissions.includes(id));
    setSelectedPermissions((current) => {
      const withoutGroup = current.filter((id) => !permissionIds.includes(id));
      return allSelected ? withoutGroup : [...withoutGroup, ...permissionIds];
    });
    if (!expandedPermissionGroups.includes(groupId)) {
      setExpandedPermissionGroups((current) => [...current, groupId]);
    }
  }

  async function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = roleName.trim();
    const roleDescription = description.trim();
    if (!name) {
      appToast.error("Role name is required.");
      return;
    }
    if (!selectedPermissions.length) {
      appToast.error("Select at least one permission.");
      return;
    }

    const permissionIds = toNumericPermissionIds(selectedPermissions, permissionById);

    if (!permissionIds.length) {
      appToast.error("Select at least one permission.");
      return;
    }

    try {
      if (editingRoleId !== null) {
        await updateRole({
          roleId: editingRoleId,
          body: {
            name,
            description: roleDescription || null,
            permission_ids: permissionIds,
          },
        }).unwrap();
      } else {
        await createRole({
          name,
          description: roleDescription || null,
          permissions: permissionIds,
        }).unwrap();
      }
      setRoleDialogOpen(false);
      setEditingRoleId(null);
      setDetailsHydratedId(null);
      setCursor(undefined);
      setPage(1);
    } catch {
      // toast handled by mutation
    }
  }

  function duplicateRole(role: Role) {
    const today = formatRoleDate(new Date().toISOString());
    setRoles((current) => {
      const nextId = Math.max(0, ...current.map((item) => item.id)) + 1;
      return [
        ...current,
        {
          ...role,
          id: nextId,
          slug: `${role.slug}-copy-${nextId}`,
          name: `${role.name} copy`,
          staffMembers: 0,
          created: today,
          updated: today,
        },
      ];
    });
    setOpenActionsId(null);
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

  const roleActions = useMemo<ActionMenuItem<Role>[]>(
    () => [
      {
        key: "edit",
        label: "Edit role",
        icon: PencilIcon,
        onClick: (role) => openEditDialog(role),
      },
      {
        key: "duplicate",
        label: "Duplicate role",
        icon: CopyIcon,
        onClick: (role) => duplicateRole(role),
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

  const isTableLoading = isLoading || isFetching;

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <main className="min-h-full bg-white px-4 py-5 md:px-5 md:py-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-black uppercase leading-6 text-black">Roles &amp; Permission</h1>
            <p className="mt-1 text-[13px] leading-5 text-[#777]">
              Create roles and assign permissions to control what staff members can access and do.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[3px] border border-black bg-black px-3 text-[14px] font-bold uppercase text-white transition hover:bg-white hover:text-black"
          >
            <span aria-hidden="true" className="text-[15px] leading-none">+</span>
            Create role
          </button>
        </header>

        <section className="mt-5" aria-label="Roles and permissions">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="flex h-[34px] min-w-0 flex-1 items-center gap-2 border-b border-black/55 px-2 text-black/60 focus-within:border-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                aria-label="Search roles"
                className="min-w-0 flex-1 bg-transparent text-[14px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="role-status-filter">Role status</label>
              <select
                id="role-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-[40px] min-w-[120px] border border-black bg-white px-2 text-[14px] font-bold uppercase text-black"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label className="sr-only" htmlFor="role-month-filter">Month</label>
              <input
                id="role-month-filter"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Filter roles by month"
                className="h-[40px] min-w-[120px] border border-black bg-white px-2 text-[14px] font-bold uppercase text-black"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left">
              <thead>
                <tr className="border-b border-black/20 text-[14px] font-bold uppercase text-black">
                  <th className="py-4 px-3">Role name</th>
                  <th className="py-4 px-3">Description</th>
                  <th className="py-4 px-3">Staff member</th>
                  <th className="py-4 px-3">Permissions</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3">Created</th>
                  <th className="py-4 px-3">Last updated</th>
                  <th className="py-4 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20">
                {isError ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-[12px] text-[#d32f2f]">
                      Unable to load roles.
                    </td>
                  </tr>
                ) : null}

                {!isError && isTableLoading && roles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-[12px] text-black/55">
                      Loading roles...
                    </td>
                  </tr>
                ) : null}

                {!isError
                  ? filteredRoles.map((role) => (
                      <tr key={role.id} className="text-[16px] text-black">
                        <td className="whitespace-nowrap px-2.5 py-4">{role.name}</td>
                        <td className="max-w-[310px] px-2.5 py-3.5">{role.description || "—"}</td>
                        <td className="px-2.5 py-4">{role.staffMembers}</td>
                        <td className="px-2.5 py-4">{role.permissions}</td>
                        <td className="whitespace-nowrap px-2.5 py-4">
                          <StatusBadge status={role.status} className="text-[16px]" />
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-4">{role.created}</td>
                        <td className="whitespace-nowrap px-2.5 py-4">{role.updated}</td>
                        <td className="px-2.5 py-3.5 text-center">
                          <ActionMenu
                            row={role}
                            actions={roleActions}
                            open={openActionsId === role.id}
                            onOpenChange={(nextOpen) =>
                              setOpenActionsId(nextOpen ? role.id : null)
                            }
                            ariaLabel={`Actions for ${role.name}`}
                            className="justify-center"
                          />
                        </td>
                      </tr>
                    ))
                  : null}

                {!isError && !isTableLoading && filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3">
                      <DataTableEmpty
                        title={
                          debouncedSearch.trim() || statusFilter !== "all"
                            ? "No roles found"
                            : "No roles yet"
                        }
                        subtitle={
                          debouncedSearch.trim() || statusFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Create a role to control what staff members can access and do."
                        }
                        showButton={!debouncedSearch.trim() && statusFilter === "all"}
                        buttonLabel="+ Create role"
                        onButtonClick={openCreateDialog}
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {!isError && roles.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/20 pt-4">
              <p className="text-[14px] text-black/70">Page {page}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canGoPrev || isTableLoading}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-[40px] min-w-[72px] border border-black bg-white px-3 text-[14px] font-bold uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!canGoNext || isTableLoading}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-[40px] min-w-[72px] border border-black bg-white px-3 text-[14px] font-bold uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {roleDialogOpen ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-3 sm:px-4"
            onMouseDown={(event) => {
              if (isSavingRole) return;
              if (event.target === event.currentTarget) setRoleDialogOpen(false);
            }}
          >
            <form
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-dialog-title"
              onSubmit={saveRole}
              className="flex max-h-full w-full max-w-[640px] flex-col border border-black/60 bg-white shadow-xl"
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-black/60 p-5">
                <span aria-hidden="true" className="h-[34px] w-[34px] shrink-0 rounded-[3px] bg-black" />
                <div className="min-w-0 flex-1">
                  <h2 id="role-dialog-title" className="text-[18px] font-black uppercase leading-4">
                    {editingRoleId === null ? "Create role" : "Edit role"}
                  </h2>
                  <p className="mt-0.5 text-[14px] leading-4 text-[#777]">
                    Set permissions for this role. You can enable or disable specific actions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleDialogOpen(false)}
                  disabled={isSavingRole}
                  aria-label="Close role dialog"
                  className=" cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center text-[17px] leading-none text-black hover:bg-black/5 disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4">
                {isEditDialogLoading ? (
                  <p className="px-1 py-6 text-[13px] text-black/55">Loading role details...</p>
                ) : null}
                {editingRoleId != null && isRoleDetailsError ? (
                  <p className="px-1 py-6 text-[13px] text-[#d32f2f]">Unable to load role details.</p>
                ) : null}

                {!isEditDialogLoading && !(editingRoleId != null && isRoleDetailsError) ? (
                  <>
                <InputField
                  label="Role name *"
                  labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
                  id="role-name"
                  autoFocus
                  required
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="Enter role name"
                  density="compact"
                />

                <div className="mt-3.5">
                  <InputField
                    as="textarea"
                    label="Role description"
                    labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
                    id="role-description"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Provide a description of the role..."
                  />
                </div>

                <h3 className="mt-3.5 text-[14px] font-bold uppercase">Permissions</h3>
                <div className="mt-2.5 space-y-2.5">
                  {isPermissionsLoading ? (
                    <p className="px-1 py-4 text-[13px] text-black/55">Loading permissions...</p>
                  ) : null}
                  {isPermissionsError ? (
                    <p className="px-1 py-4 text-[13px] text-[#d32f2f]">Unable to load permissions.</p>
                  ) : null}
                  {!isPermissionsLoading && !isPermissionsError && permissionGroups.length === 0 ? (
                    <p className="px-1 py-4 text-[13px] text-black/55">No permissions available.</p>
                  ) : null}
                  {!isPermissionsLoading && !isPermissionsError
                    ? permissionGroups.map((group) => {
                        const groupPermissionIds = group.permissions.map((permission) => permission.id);
                        const groupExpanded = expandedPermissionGroups.includes(group.module);
                        const groupChecked =
                          groupPermissionIds.length > 0 &&
                          groupPermissionIds.every((id) => selectedPermissions.includes(id));

                        return (
                          <section
                            key={group.module}
                            className="overflow-hidden rounded-[4px] border border-black/60"
                          >
                            <div className="flex min-h-[48px] items-center gap-2 px-2.5 py-2">
                              <input
                                type="checkbox"
                                checked={groupChecked}
                                onChange={() =>
                                  togglePermissionGroupSelection(group.module, groupPermissionIds)
                                }
                                aria-label={`Select all ${group.label} permissions`}
                                className="h-[13px] w-[13px] shrink-0 accent-black"
                              />
                              <button
                                type="button"
                                onClick={() => togglePermissionGroup(group.module)}
                                aria-expanded={groupExpanded}
                                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                              >
                                <span className="min-w-0">
                                  <span className="block text-[16px] font-bold leading-5 text-[#111827]">
                                    {group.label}
                                  </span>
                                  {group.description ? (
                                    <span className="mt-0.5 block text-[14px] leading-4 text-[#6B7280]">
                                      {group.description}
                                    </span>
                                  ) : null}
                                </span>
                                <svg
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  aria-hidden="true"
                                  className={`h-3 w-3 shrink-0 transition-transform ${groupExpanded ? "rotate-180" : ""}`}
                                >
                                  <path
                                    d="m5 7.5 5 5 5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                            {groupExpanded ? (
                              <div className="flex flex-wrap gap-x-4 gap-y-2 px-2.5 pb-2.5 pl-3 pt-[8px]">
                                {group.permissions.map((permission) => (
                                  <label
                                    key={permission.id}
                                    className="inline-flex items-center gap-1.5 text-[14px] leading-5 text-[#111827]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissions.includes(permission.id)}
                                      onChange={() => togglePermission(permission.id)}
                                      className="h-[13px] w-[13px] accent-black"
                                    />
                                    {permission.label}
                                  </label>
                                ))}
                              </div>
                            ) : null}
                          </section>
                        );
                      })
                    : null}
                </div>
                  </>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-2 border-t border-black/50 px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => setRoleDialogOpen(false)}
                  disabled={isSavingRole}
                  className="cursor-pointer h-10 flex-1 rounded-[3px] border border-black/65 text-[14px] uppercase hover:bg-black/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSavingRole ||
                    isPermissionsLoading ||
                    isEditDialogLoading ||
                    (editingRoleId != null && isRoleDetailsError)
                  }
                  className="cursor-pointer h-10 flex-1 rounded-[3px] border border-black bg-black text-[14px] uppercase text-white hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {isSavingRole
                    ? "Saving..."
                    : editingRoleId === null
                      ? "Create"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </DashboardShell>
  );
}
