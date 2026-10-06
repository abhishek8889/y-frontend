"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

type RoleStatus = "Active" | "Inactive";

type Role = {
  id: number;
  name: string;
  description: string;
  staffMembers: number;
  permissions: number;
  permissionIds: string[];
  status: RoleStatus;
  created: string;
  updated: string;
};

const permissionGroups = [
  {
    id: "events",
    name: "Events",
    description: "Manage events, ticketing and event settings.",
    actions: ["View Events", "Create Events", "Update Events", "Delete Events"],
  },
  {
    id: "venues",
    name: "Venues",
    description: "Manage venues, facilities and venue settings.",
    actions: ["View Venues", "Create Venues", "Update Venues", "Delete Venues"],
  },
  {
    id: "customers",
    name: "Customers",
    description: "Manage customers data and management.",
    actions: ["View Customers", "Update Customers"],
  },
  {
    id: "check-in",
    name: "Check-In",
    description: "Allow access to ticket scanning and attendance management.",
    actions: ["View Check-In", "Scan Tickets", "Manage Attendance"],
  },
  {
    id: "finance",
    name: "Finance",
    description: "View reports and manage payouts.",
    actions: ["View Finance", "Manage Payouts", "Manage Refunds"],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Manage organisation settings, staff and permissions.",
    actions: ["View Settings", "Manage Staff", "Manage Permissions"],
  },
] as const;

const allPermissionIds = permissionGroups.flatMap((group) =>
  group.actions.map((action) => `${group.id}:${action}`),
);
const eventPermissionIds = permissionGroups[0].actions.map((action) => `events:${action}`);

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Organisation admin",
    description: "Full access to all features and settings.",
    staffMembers: 2,
    permissions: 10,
    permissionIds: [
      ...permissionGroups[0].actions.map((action) => `events:${action}`),
      ...permissionGroups[1].actions.map((action) => `venues:${action}`),
      "finance:View Finance",
      "finance:Manage Payouts",
    ],
    status: "Active",
    created: "01 Sep 2026",
    updated: "01 Sep 2026",
  },
  {
    id: 2,
    name: "Event manager",
    description: "Can manage events, ticketing and event related content.",
    staffMembers: 4,
    permissions: 13,
    permissionIds: [
      ...permissionGroups[0].actions.map((action) => `events:${action}`),
      "venues:View Venues",
      ...permissionGroups[2].actions.map((action) => `customers:${action}`),
      ...permissionGroups[3].actions.map((action) => `check-in:${action}`),
      ...permissionGroups[4].actions.map((action) => `finance:${action}`),
    ],
    status: "Active",
    created: "01 Sep 2026",
    updated: "01 Sep 2026",
  },
  {
    id: 3,
    name: "Venue manager",
    description: "Can manage venues and venue related content.",
    staffMembers: 3,
    permissions: 8,
    permissionIds: [
      ...permissionGroups[0].actions.map((action) => `events:${action}`),
      ...permissionGroups[1].actions.map((action) => `venues:${action}`),
    ],
    status: "Active",
    created: "01 Sep 2026",
    updated: "01 Sep 2026",
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(eventPermissionIds);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<string[]>(["events"]);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roles.filter((role) =>
      (!query || `${role.name} ${role.description}`.toLowerCase().includes(query))
      && (statusFilter === "all" || role.status.toLowerCase() === statusFilter),
    );
  }, [roles, search, statusFilter]);

  function openCreateDialog() {
    setEditingRoleId(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([...eventPermissionIds]);
    setExpandedPermissionGroups(["events"]);
    setRoleDialogOpen(true);
  }

  function openEditDialog(role: Role) {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setDescription(role.description);
    setSelectedPermissions(role.permissionIds);
    setExpandedPermissionGroups(["events"]);
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

  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = roleName.trim();
    const roleDescription = description.trim();
    if (!name) return;
    const permissionIds = selectedPermissions.filter((permissionId) => allPermissionIds.includes(permissionId));

    if (editingRoleId !== null) {
      setRoles((current) => current.map((role) =>
        role.id === editingRoleId
          ? { ...role, name, description: roleDescription, permissionIds, permissions: permissionIds.length, updated: "06 Oct 2026" }
          : role,
      ));
    } else {
      setRoles((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((role) => role.id)) + 1,
          name,
          description: roleDescription,
          staffMembers: 0,
          permissions: permissionIds.length,
          permissionIds,
          status: "Active",
          created: "06 Oct 2026",
          updated: "06 Oct 2026",
        },
      ]);
    }
    setEditingRoleId(null);
    setRoleDialogOpen(false);
  }

  function duplicateRole(role: Role) {
    setRoles((current) => [
      ...current,
      {
        ...role,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        name: `${role.name} copy`,
        staffMembers: 0,
        created: "06 Oct 2026",
        updated: "06 Oct 2026",
      },
    ]);
    setOpenActionsId(null);
  }

  function toggleRoleStatus(roleId: number) {
    setRoles((current) => current.map((role) =>
      role.id === roleId
        ? { ...role, status: role.status === "Active" ? "Inactive" : "Active", updated: "06 Oct 2026" }
        : role,
    ));
    setOpenActionsId(null);
  }

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
            className="inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[3px] border border-black bg-black px-3 text-[11px] font-bold uppercase text-white transition hover:bg-white hover:text-black"
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
                className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="role-status-filter">Role status</label>
              <select
                id="role-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-[34px] min-w-[120px] border border-black/65 bg-white px-2 text-[10px] font-bold uppercase text-black"
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
                className="h-[34px] min-w-[120px] border border-black/65 bg-white px-2 text-[10px] font-bold uppercase text-black"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left">
              <thead>
                <tr className="border-y border-black/65 text-[10px] font-bold uppercase text-black">
                  <th className="px-2.5 py-3">Role name</th>
                  <th className="px-2.5 py-3">Description</th>
                  <th className="px-2.5 py-3">Staff member</th>
                  <th className="px-2.5 py-3">Permissions</th>
                  <th className="px-2.5 py-3">Status</th>
                  <th className="px-2.5 py-3">Created</th>
                  <th className="px-2.5 py-3">Last updated</th>
                  <th className="px-2.5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b border-black/55 text-[12px] text-black">
                    <td className="whitespace-nowrap px-2.5 py-4">{role.name}</td>
                    <td className="max-w-[310px] px-2.5 py-3.5">{role.description}</td>
                    <td className="px-2.5 py-4">{role.staffMembers}</td>
                    <td className="px-2.5 py-4">{role.permissions}</td>
                    <td className="whitespace-nowrap px-2.5 py-4">
                      <span className={role.status === "Active" ? "font-bold text-[#2dbb5a]" : "font-bold text-[#999]"}>
                        <span aria-hidden="true">● </span>{role.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-4">{role.created}</td>
                    <td className="whitespace-nowrap px-2.5 py-4">{role.updated}</td>
                    <td className="px-2.5 py-3.5 text-center">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          aria-label={`Actions for ${role.name}`}
                          aria-expanded={openActionsId === role.id}
                          onClick={() => setOpenActionsId((current) => current === role.id ? null : role.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.035] text-[18px] leading-none text-black/75 hover:bg-black/10"
                        >
                          ⋮
                        </button>
                        {openActionsId === role.id ? (
                          <div className="absolute right-0 top-8 z-10 min-w-[150px] border border-black/50 bg-white p-1 text-left shadow-md">
                            <button type="button" onClick={() => openEditDialog(role)} className="block w-full px-2.5 py-2 text-left text-[11px] hover:bg-black/5">Edit role</button>
                            <button type="button" onClick={() => duplicateRole(role)} className="block w-full px-2.5 py-2 text-left text-[11px] hover:bg-black/5">Duplicate role</button>
                            <button type="button" onClick={() => toggleRoleStatus(role.id)} className="block w-full px-2.5 py-2 text-left text-[11px] hover:bg-black/5">
                              {role.status === "Active" ? "Deactivate role" : "Activate role"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-[12px] text-black/55">
                      No roles match your search or status filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {roleDialogOpen ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-3 sm:px-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setRoleDialogOpen(false);
            }}
          >
            <form
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-dialog-title"
              onSubmit={saveRole}
              className="flex max-h-full w-full max-w-[488px] flex-col border border-black/60 bg-white shadow-xl"
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-black/60 px-3.5 py-3">
                <span aria-hidden="true" className="h-[34px] w-[34px] shrink-0 rounded-[3px] bg-black" />
                <div className="min-w-0 flex-1">
                  <h2 id="role-dialog-title" className="text-[13px] font-black uppercase leading-4">
                    {editingRoleId === null ? "Create role" : "Edit role"}
                  </h2>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#777]">
                    Set permissions for this role. You can enable or disable specific actions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleDialogOpen(false)}
                  aria-label="Close role dialog"
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-[17px] leading-none text-black hover:bg-black/5"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4">
                <label className="block text-[10px] font-bold uppercase" htmlFor="role-name">Role name *</label>
                <input
                  id="role-name"
                  autoFocus
                  required
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="Enter role name"
                  className="mt-1 h-8 w-full rounded-[3px] border border-black/65 px-2.5 text-[11px] placeholder:text-[#888]"
                />

                <label className="mt-3.5 block text-[10px] font-bold uppercase" htmlFor="role-description">Role description</label>
                <textarea
                  id="role-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Provide a description of the role..."
                  className="mt-1 min-h-[72px] w-full resize-y rounded-[3px] border border-black/65 px-2.5 py-2 text-[11px] placeholder:text-[#888]"
                />

                <h3 className="mt-3.5 text-[10px] font-bold uppercase">Permissions</h3>
                <div className="mt-2.5 space-y-2.5">
                  {permissionGroups.map((group) => {
                    const groupPermissionIds = group.actions.map((action) => `${group.id}:${action}`);
                    const groupExpanded = expandedPermissionGroups.includes(group.id);
                    const groupChecked = groupPermissionIds.every((id) => selectedPermissions.includes(id));

                    return (
                      <section key={group.id} className="overflow-hidden rounded-[4px] border border-black/60">
                        <div className="flex min-h-[48px] items-center gap-2 px-2.5 py-2">
                          <input
                            type="checkbox"
                            checked={groupChecked}
                            onChange={() => togglePermissionGroupSelection(group.id, groupPermissionIds)}
                            aria-label={`Select all ${group.name} permissions`}
                            className="h-[13px] w-[13px] shrink-0 accent-black"
                          />
                          <button
                            type="button"
                            onClick={() => togglePermissionGroup(group.id)}
                            aria-expanded={groupExpanded}
                            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                          >
                            <span className="min-w-0">
                              <span className="block text-[11px] font-bold leading-4 text-[#111827]">{group.name}</span>
                              <span className="mt-0.5 block text-[10px] leading-3.5 text-[#737b8c]">{group.description}</span>
                            </span>
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              aria-hidden="true"
                              className={`h-3 w-3 shrink-0 transition-transform ${groupExpanded ? "rotate-180" : ""}`}
                            >
                              <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                        {groupExpanded ? (
                          <div className="flex flex-wrap gap-x-4 gap-y-2 px-2.5 pb-2.5 pl-3">
                            {group.actions.map((action) => {
                              const permissionId = `${group.id}:${action}`;
                              return (
                                <label key={permissionId} className="inline-flex items-center gap-1.5 text-[10px] leading-4 text-[#111827]">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permissionId)}
                                    onChange={() => togglePermission(permissionId)}
                                    className="h-[13px] w-[13px] accent-black"
                                  />
                                  {action}
                                </label>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t border-black/50 px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => setRoleDialogOpen(false)}
                  className="h-8 flex-1 rounded-[3px] border border-black/65 text-[10px] uppercase hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 flex-1 rounded-[3px] border border-black bg-black text-[10px] uppercase text-white hover:bg-white hover:text-black"
                >
                  {editingRoleId === null ? "Create" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </DashboardShell>
  );
}
