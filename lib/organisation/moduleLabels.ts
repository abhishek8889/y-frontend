/**
 * Organisation module keys and default English labels.
 * Use these everywhere (sidebar, roles, permissions) so i18n can swap labels in one place later.
 */

export const ORGANISATION_MODULE_KEYS = [
  "dashboard",
  "venues",
  "events",
  "org_customers",
  "org_clubsites",
  "org_roles",
  "org_staff_members",
  "org_finance",
  "org_settings",
  "org_whitelabel",
] as const;

export type OrganisationModuleKey = (typeof ORGANISATION_MODULE_KEYS)[number];

/** Default English UI labels — replace / wrap with i18n later. */
export const organisationModuleLabels: Record<OrganisationModuleKey, string> = {
  dashboard: "Dashboard",
  venues: "Venues",
  events: "Events",
  org_customers: "Customers",
  org_clubsites: "Clubsite",
  org_roles: "Role & Permissions",
  org_staff_members: "Staff Members",
  org_finance: "Finance",
  org_settings: "Settings",
  org_whitelabel: "Whitelabels",
};

/** Optional short descriptions for permission modules (English defaults). */
export const organisationModuleDescriptions: Partial<Record<OrganisationModuleKey, string>> = {
  venues: "Manage venues, facilities and venue settings.",
  events: "Manage events, ticketing and event settings.",
  org_customers: "Manage customers data and management.",
  org_clubsites: "Manage clubsite content and settings.",
  org_roles: "Manage roles and permission assignments.",
  org_staff_members: "Manage staff members and invitations.",
  org_finance: "View reports and manage payouts.",
  org_settings: "Manage organisation settings.",
  org_whitelabel: "Manage whitelabel branding and domains.",
};

function humanizeModuleKey(moduleKey: string) {
  return moduleKey
    .replace(/^org_/, "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getOrganisationModuleLabel(moduleKey: string | null | undefined): string {
  const key = String(moduleKey ?? "").trim();
  if (!key) return "";
  if (key in organisationModuleLabels) {
    return organisationModuleLabels[key as OrganisationModuleKey];
  }
  return humanizeModuleKey(key);
}

export function getOrganisationModuleDescription(moduleKey: string | null | undefined): string {
  const key = String(moduleKey ?? "").trim();
  if (key in organisationModuleDescriptions) {
    return organisationModuleDescriptions[key as OrganisationModuleKey] ?? "";
  }
  return "";
}

/** Stable sort order matching product sidebar / module registry. */
export function compareOrganisationModules(a: string, b: string) {
  const indexA = ORGANISATION_MODULE_KEYS.indexOf(a as OrganisationModuleKey);
  const indexB = ORGANISATION_MODULE_KEYS.indexOf(b as OrganisationModuleKey);
  const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
  const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
  if (orderA !== orderB) return orderA - orderB;
  return a.localeCompare(b);
}

/** English action label from a permission key like `venues.read`. */
export function formatPermissionActionLabel(permissionKey: string | null | undefined): string {
  const key = String(permissionKey ?? "").trim();
  if (!key) return "";

  const action = key.includes(".") ? key.split(".").slice(1).join(".") : key;
  const normalized = action.toLowerCase().replace(/[\s-]+/g, "_");

  const known: Record<string, string> = {
    read: "View",
    view: "View",
    create: "Create",
    update: "Update",
    edit: "Update",
    delete: "Delete",
    manage: "Manage",
    write: "Write",
  };

  if (known[normalized]) return known[normalized];

  return action
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
