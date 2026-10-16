/**
 * Mirrors backend `PermissionScopeEnum`.
 * Use these everywhere instead of raw scope strings.
 */
export enum AuthScope {
  Organisation = "organisation",
  Platform = "platform",
  Customer = "customer",
}

export function isAuthScope(value: unknown): value is AuthScope {
  return (
    value === AuthScope.Organisation ||
    value === AuthScope.Platform ||
    value === AuthScope.Customer
  );
}

export function parseAuthScope(value: unknown): AuthScope | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return isAuthScope(normalized) ? normalized : null;
}
