import {
  CLUBSITE_ICON,
  CUSTOMERS_ICON,
  DASHBOARD_ICON,
  EVENTS_ICON,
  FINANCE_ICON,
  ROLES_PERMISSION_ICON,
  SETTINGS_ICON,
  STAFF_MEMBER_ICON,
  VENUES_ICON,
  type IconName,
} from "@/components/ui/IconCard";
import { getOrganisationModuleLabel } from "@/lib/organisation/moduleLabels";

export type OrganisationSidebarItem = {
  key: string;
  label: string;
  path: string;
  icon: IconName;
  /** Omit or null = always visible (not gated by permissions). */
  requiredPermission?: string | null;
  hasChevron?: boolean;
};

/**
 * Organisation sidebar order, labels, routes, icons, and permission gates.
 * `key` matches the about-me / permissions-list module name.
 * Labels come from `lib/organisation/moduleLabels` for shared i18n later.
 */
export const organisationSidebarConfig: OrganisationSidebarItem[] = [
  {
    key: "dashboard",
    label: getOrganisationModuleLabel("dashboard"),
    path: "/dashboard",
    icon: DASHBOARD_ICON,
  },
  {
    key: "venues",
    label: getOrganisationModuleLabel("venues"),
    path: "/venues",
    icon: VENUES_ICON,
    requiredPermission: "venues.read",
  },
  {
    key: "events",
    label: getOrganisationModuleLabel("events"),
    path: "/events",
    icon: EVENTS_ICON,
    requiredPermission: "events.read",
  },
  {
    key: "org_customers",
    label: getOrganisationModuleLabel("org_customers"),
    path: "/customers",
    icon: CUSTOMERS_ICON,
    requiredPermission: "org_customers.read",
  },
  {
    key: "org_clubsites",
    label: getOrganisationModuleLabel("org_clubsites"),
    path: "/clubsite",
    icon: CLUBSITE_ICON,
    requiredPermission: "org_clubsites.read",
  },
  {
    key: "org_roles",
    label: getOrganisationModuleLabel("org_roles"),
    path: "/roles",
    icon: ROLES_PERMISSION_ICON,
    requiredPermission: "org_roles.read",
  },
  {
    key: "org_staff_members",
    label: getOrganisationModuleLabel("org_staff_members"),
    path: "/staff",
    icon: STAFF_MEMBER_ICON,
    requiredPermission: "org_staff_members.read",
  },
  {
    key: "org_finance",
    label: getOrganisationModuleLabel("org_finance"),
    path: "/finance",
    icon: FINANCE_ICON,
    requiredPermission: "org_finance.read",
    hasChevron: true,
  },
  {
    key: "org_settings",
    label: getOrganisationModuleLabel("org_settings"),
    path: "/settings",
    icon: SETTINGS_ICON,
    requiredPermission: "org_settings.read",
  },
];
