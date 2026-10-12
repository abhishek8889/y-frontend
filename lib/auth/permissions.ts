export type PermissionMap = Record<string, string[]>;

export function hasPermission(
  permissions: PermissionMap | null | undefined,
  required: string,
): boolean {
  if (!permissions || !required) return false;

  const moduleKey = required.split(".")[0];
  if (!moduleKey) return false;

  const modulePermissions = permissions[moduleKey];
  if (!Array.isArray(modulePermissions)) return false;

  return modulePermissions.includes(required);
}

export function filterSidebarByPermissions<T extends { requiredPermission?: string | null }>(
  config: T[],
  permissions: PermissionMap | null | undefined,
): T[] {
  return config.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(permissions, item.requiredPermission);
  });
}
