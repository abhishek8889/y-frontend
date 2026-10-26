import {
  DASHBOARD_ICON,
  CLUBSITE_ICON,
  SETTINGS_ICON,
  type IconName,
} from "@/components/ui/IconCard";

export type SuperadminSidebarItem = {
  key: string;
  label: string;
  path: string;
  icon: IconName;
  /** Omit or null = always visible. Matches platform permission keys from about-me / login. */
  requiredPermission?: string | null;
};

/**
 * Platform sidebar. Item `key` aligns with permission module names where gated.
 * Example login permissions: organisations.*, settings.update
 */
export const superadminSidebarConfig: SuperadminSidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/admin",
    icon: DASHBOARD_ICON,
  },
  {
    key: "organisations",
    label: "Organisations",
    path: "/admin/organisations",
    icon: CLUBSITE_ICON,
    requiredPermission: "organisations.read",
  },
  {
    key: "settings",
    label: "Platform Settings",
    path: "/admin/settings",
    icon: SETTINGS_ICON,
    requiredPermission: "settings.update",
  },
];
