import { withQueryToast } from "@/lib/api/queryToast";
import {
  compareOrganisationModules,
  formatPermissionActionLabel,
  getOrganisationModuleDescription,
  getOrganisationModuleLabel,
} from "@/lib/organisation/moduleLabels";
import { baseApi } from "@/lib/store/baseApi";

export type OrganisationRole = {
  id: number | string;
  slug?: string | null;
  name: string;
  description?: string | null;
  status?: string | null;
  staff_members?: number | null;
  staff_count?: number | null;
  permissions?: number | string[] | null;
  permissions_count?: number | null;
  permission_ids?: Array<number | string> | null;
  created_at?: string | null;
  updated_at?: string | null;
  created?: string | null;
  updated?: string | null;
};

export type RoleListParams = {
  search?: string;
  per_page?: number;
  cursor?: string;
};

export type RoleListResponse = {
  success: boolean;
  message: string;
  data: {
    items: OrganisationRole[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type OrganisationPermission = {
  /** Unique UI id (stringified API id or permission key). */
  id: string;
  /** Value submitted to create/update role APIs. */
  value: string | number;
  /** Permission key e.g. venues.read */
  key: string;
  label: string;
  module: string;
};

export type OrganisationPermissionGroup = {
  module: string;
  label: string;
  description: string;
  permissions: OrganisationPermission[];
};

export type PermissionsListResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

export type CreateRolePayload = {
  name: string;
  description?: string | null;
  permissions: Array<string | number>;
};

export type CreateRoleResponse = {
  success: boolean;
  message: string;
  data: OrganisationRole;
};

export type UpdateRolePayload = {
  name: string;
  description?: string | null;
  permission_ids: number[];
};

export type UpdateRoleResponse = {
  success: boolean;
  message: string;
  data: OrganisationRole;
};

export type RoleWithPermissions = OrganisationRole & {
  permissions?: Array<number | string | { id?: number | string; key?: string; name?: string }> | null;
};

export type RoleDetailsResponse = {
  success: boolean;
  message: string;
  data: RoleWithPermissions;
};

/** Extract selected permission UI ids from a role detail payload. */
export function extractRolePermissionIds(role: RoleWithPermissions | null | undefined): string[] {
  if (!role) return [];

  if (Array.isArray(role.permission_ids) && role.permission_ids.length) {
    return role.permission_ids.map(String);
  }

  if (!Array.isArray(role.permissions)) return [];

  return role.permissions
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") return String(item);
      if (item && typeof item === "object") {
        if (item.id != null) return String(item.id);
        if (item.key) return String(item.key);
        if (item.name) return String(item.name);
      }
      return "";
    })
    .filter(Boolean);
}

type RawPermission = {
  id?: number | string;
  key?: string;
  name?: string;
  permission?: string;
  slug?: string;
  action?: string;
  label?: string;
  module?: string;
  module_name?: string;
};

function permissionKeyFromRaw(raw: RawPermission, moduleKey: string) {
  const explicit = raw.key ?? raw.permission ?? raw.slug ?? raw.name;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim();
  }
  if (raw.action && moduleKey) {
    return `${moduleKey}.${String(raw.action).trim()}`;
  }
  if (raw.id != null) return String(raw.id);
  return "";
}

function normalizePermissionItem(
  raw: string | number | RawPermission,
  moduleKey: string,
): OrganisationPermission | null {
  if (typeof raw === "string" || typeof raw === "number") {
    const key = String(raw).trim();
    if (!key) return null;
    const moduleFromKey = key.includes(".") ? key.split(".")[0] : moduleKey;
    return {
      id: key,
      value: key,
      key,
      label: formatPermissionActionLabel(key),
      module: moduleFromKey || moduleKey,
    };
  }

  const key = permissionKeyFromRaw(raw, moduleKey);
  if (!key) return null;

  const module = String(raw.module ?? raw.module_name ?? moduleKey ?? "").trim() || moduleKey;
  const value = raw.id != null ? raw.id : key;
  const label =
    (typeof raw.label === "string" && raw.label.trim()) ||
    (typeof raw.name === "string" && raw.name.trim() && !raw.name.includes(".")
      ? raw.name.trim()
      : "") ||
    formatPermissionActionLabel(key);

  return {
    id: String(raw.id ?? key),
    value,
    key,
    label,
    module,
  };
}

function pushPermission(
  groups: Map<string, OrganisationPermission[]>,
  permission: OrganisationPermission,
) {
  const list = groups.get(permission.module) ?? [];
  if (!list.some((item) => item.id === permission.id)) {
    list.push(permission);
  }
  groups.set(permission.module, list);
}

/** Normalize varied backend shapes into UI permission groups. */
export function normalizePermissionsList(data: unknown): OrganisationPermissionGroup[] {
  const groups = new Map<string, OrganisationPermission[]>();

  const asModulesRecord = (value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    for (const [moduleKey, permissions] of Object.entries(value as Record<string, unknown>)) {
      if (!Array.isArray(permissions)) continue;
      for (const item of permissions) {
        const normalized = normalizePermissionItem(item as string | number | RawPermission, moduleKey);
        if (normalized) pushPermission(groups, normalized);
      }
    }
  };

  if (Array.isArray(data)) {
    for (const entry of data) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const moduleKey = String(
        record.module ?? record.module_name ?? record.key ?? record.name ?? "",
      ).trim();
      const nested = record.permissions ?? record.items ?? record.actions;

      if (Array.isArray(nested) && moduleKey) {
        for (const item of nested) {
          const normalized = normalizePermissionItem(
            item as string | number | RawPermission,
            moduleKey,
          );
          if (normalized) pushPermission(groups, normalized);
        }
        continue;
      }

      const normalized = normalizePermissionItem(entry as RawPermission, moduleKey);
      if (normalized) pushPermission(groups, normalized);
    }
  } else if (data && typeof data === "object") {
    const root = data as Record<string, unknown>;
    if (root.modules != null) {
      asModulesRecord(root.modules);
    } else if (root.permissions != null && !Array.isArray(root.permissions)) {
      asModulesRecord(root.permissions);
    } else if (Array.isArray(root.permissions)) {
      for (const item of root.permissions) {
        const normalized = normalizePermissionItem(item as string | number | RawPermission, "");
        if (normalized) pushPermission(groups, normalized);
      }
    } else {
      asModulesRecord(root);
    }
  }

  return Array.from(groups.entries())
    .map(([module, permissions]) => ({
      module,
      label: getOrganisationModuleLabel(module),
      description: getOrganisationModuleDescription(module),
      permissions,
    }))
    .sort((a, b) => compareOrganisationModules(a.module, b.module));
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoleList: build.query<RoleListResponse, RoleListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.set("search", params?.search?.trim() ?? "");
        searchParams.set("per_page", String(params?.per_page ?? 10));

        if (params?.cursor) {
          searchParams.set("cursor", params.cursor);
        }

        return {
          url: `organisation/role-permission/get-role-list?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Roles"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getPermissionsList: build.query<PermissionsListResponse, void>({
      query: () => ({
        url: "organisation/role-permission/permissions-list",
        method: "GET",
      }),
      providesTags: ["RolePermissions"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getRoleWithPermissions: build.query<RoleDetailsResponse, number | string>({
      query: (roleId) => ({
        url: `organisation/role-permission/get-role-with-permissions/${roleId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, roleId) => [{ type: "Roles", id: String(roleId) }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createRole: build.mutation<CreateRoleResponse, CreateRolePayload>({
      query: (body) => ({
        url: "organisation/role-permission/create-role",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateRole: build.mutation<
      UpdateRoleResponse,
      { roleId: number | string; body: UpdateRolePayload }
    >({
      query: ({ roleId, body }) => ({
        url: `organisation/role-permission/update/${roleId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Roles",
        { type: "Roles", id: String(arg.roleId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetRoleListQuery,
  useGetPermissionsListQuery,
  useGetRoleWithPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} = rolesApi;
