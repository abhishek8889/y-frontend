"use client";

import { useEffect, useMemo, useState } from "react";
import {
  extractRolePermissionIds,
  normalizePermissionsList,
  useCreateRoleMutation,
  useGetPermissionsListQuery,
  useGetRoleWithPermissionsQuery,
  useUpdateRoleMutation,
} from "@/apis/organisation/rolesApi";
import { SideDrawer } from "@/components/common";
import IconCard, { ROLES_PERMISSION_ICON } from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";
import { appToast } from "@/lib/ui/toast";

type RoleFormDrawerProps = {
  isOpen: boolean;
  roleId: number | null;
  onClose: () => void;
  onSaved?: () => void;
};

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

function RoleLogo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-black bg-white">
      <IconCard name={ROLES_PERMISSION_ICON} className="h-5 w-5" />
    </span>
  );
}

export function RoleFormDrawer({ isOpen, roleId, onClose, onSaved }: RoleFormDrawerProps) {
  const isEdit = roleId != null;
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<string[]>([]);
  const [detailsHydratedId, setDetailsHydratedId] = useState<number | null>(null);

  const {
    data: permissionsData,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = useGetPermissionsListQuery(undefined, { skip: !isOpen });

  const {
    data: roleDetailsData,
    isLoading: isRoleDetailsLoading,
    isError: isRoleDetailsError,
    isFetching: isRoleDetailsFetching,
  } = useGetRoleWithPermissionsQuery(roleId as number, {
    skip: !isOpen || roleId == null,
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

  const isSavingRole = isCreatingRole || isUpdatingRole;
  const isEditDialogLoading =
    isEdit &&
    (isRoleDetailsLoading || isRoleDetailsFetching) &&
    detailsHydratedId !== roleId;

  useEffect(() => {
    if (!isOpen) return;
    if (roleId == null) {
      setRoleName("");
      setDescription("");
      setSelectedPermissions([]);
      setExpandedPermissionGroups([]);
      setDetailsHydratedId(null);
    }
  }, [isOpen, roleId]);

  useEffect(() => {
    if (!isOpen || !permissionGroups.length) return;
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
  }, [permissionGroups, isOpen]);

  useEffect(() => {
    if (!isOpen || roleId == null) {
      setDetailsHydratedId(null);
      return;
    }

    const detail = roleDetailsData?.data;
    if (!detail || detailsHydratedId === roleId) return;
    if (detail.id != null && Number(detail.id) !== roleId) return;

    setRoleName(detail.name ?? "");
    setDescription(detail.description ?? "");
    setSelectedPermissions(extractRolePermissionIds(detail));
    setDetailsHydratedId(roleId);
  }, [isOpen, roleId, roleDetailsData?.data, detailsHydratedId]);

  function handleClose() {
    if (isSavingRole) return;
    onClose();
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

  async function handleSubmit() {
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
      if (isEdit && roleId != null) {
        await updateRole({
          roleId,
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
      onSaved?.();
      onClose();
    } catch {
      // toast handled by mutation
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit role" : "Create role"}
      subtitle="Set permissions for this role. You can enable or disable specific actions."
      logo={<RoleLogo />}
      cancelLabel="Cancel"
      onCancel={handleClose}
      submitLabel={isEdit ? "Save changes" : "Create"}
      onSubmit={() => {
        if (
          isSavingRole ||
          isPermissionsLoading ||
          isEditDialogLoading ||
          (isEdit && isRoleDetailsError)
        ) {
          return;
        }
        void handleSubmit();
      }}
      isSubmitting={isSavingRole}
      panelClassName="max-w-[640px]"
    >
      {isEditDialogLoading ? (
        <p className="py-6 text-[13px] text-black/55">Loading role details...</p>
      ) : null}
      {isEdit && isRoleDetailsError ? (
        <p className="py-6 text-[13px] text-[#d32f2f]">Unable to load role details.</p>
      ) : null}

      {!isEditDialogLoading && !(isEdit && isRoleDetailsError) ? (
        <div className="space-y-4">
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

          <div>
            <h3 className="text-[14px] font-bold uppercase">Permissions</h3>
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
                    const groupPermissionIds = group.permissions.map(
                      (permission) => permission.id,
                    );
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
          </div>
        </div>
      ) : null}
    </SideDrawer>
  );
}
