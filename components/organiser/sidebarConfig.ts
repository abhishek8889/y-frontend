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
 * `key` matches the about-me permissions object module name.
 * `label` can differ from the backend module name.
 */
export const organisationSidebarConfig: OrganisationSidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: DASHBOARD_ICON,
  },
  {
    key: "venues",
    label: "Venues",
    path: "/venues",
    icon: VENUES_ICON,
    requiredPermission: "venues.read",
  },
  {
    key: "events",
    label: "Events",
    path: "/events",
    icon: EVENTS_ICON,
    requiredPermission: "events.read",
  },
  {
    key: "customers",
    label: "Customers",
    path: "/customers",
    icon: CUSTOMERS_ICON,
    requiredPermission: "customers.read",
  },
  {
    key: "clubsite",
    label: "Clubsite",
    path: "/clubsite",
    icon: CLUBSITE_ICON,
    requiredPermission: "clubsite.read",
  },
  {
    key: "roles",
    label: "Roles & Permission",
    path: "/roles",
    icon: ROLES_PERMISSION_ICON,
    requiredPermission: "roles.read",
  },
  {
    key: "staff",
    label: "Staff Member",
    path: "/staff",
    icon: STAFF_MEMBER_ICON,
    requiredPermission: "staff.read",
  },
  {
    key: "finance",
    label: "Finance",
    path: "/finance",
    icon: FINANCE_ICON,
    requiredPermission: "finance.read",
    hasChevron: true,
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: SETTINGS_ICON,
    requiredPermission: "settings.read",
  },
];
