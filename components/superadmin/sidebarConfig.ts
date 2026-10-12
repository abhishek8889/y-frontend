export type SuperadminSidebarItem = {
  key: string;
  label: string;
  path: string;
  /** Set when admin about-me permission modules are available. */
  requiredPermission?: string | null;
};

/**
 * Superadmin sidebar config — kept separate from organisation menu items.
 * Items without `requiredPermission` always show (current admin UX).
 */
export const superadminSidebarConfig: SuperadminSidebarItem[] = [
  { key: "overview", label: "Overview", path: "/admin" },
  { key: "organisers", label: "Organisers", path: "/admin/organisers" },
  { key: "settings", label: "Settings", path: "/admin/settings" },
];
