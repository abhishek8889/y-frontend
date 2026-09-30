"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconCard, {
  CHEVRON_DOWN_ICON,
  CLUBSITE_ICON,
  CUSTOMERS_ICON,
  DASHBOARD_ICON,
  EVENTS_ICON,
  FINANCE_ICON,
  LOGOUT_ICON,
  ROLES_PERMISSION_ICON,
  SETTINGS_ICON,
  STAFF_MEMBER_ICON,
  VENUES_ICON,
  type IconName,
} from "@/components/ui/IconCard";

type SidebarItem = {
  label: string;
  href: string;
  hasChevron?: boolean;
  icon: IconName;
};

type DashboardSidebarProps = {
  items?: SidebarItem[];
};

const defaultItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DASHBOARD_ICON },
  { label: "Venues", href: "/venues", icon: VENUES_ICON },
  { label: "Events", href: "/events", icon: EVENTS_ICON },
  { label: "Customers", href: "/customers", icon: CUSTOMERS_ICON },
  { label: "Clubsite", href: "/clubsite", icon: CLUBSITE_ICON },
  { label: "Roles & Permission", href: "/roles", icon: ROLES_PERMISSION_ICON },
  { label: "Staff Member", href: "/staff", icon: STAFF_MEMBER_ICON },
  { label: "Finance", href: "/finance", icon: FINANCE_ICON },
  { label: "Settings", href: "/settings", icon: SETTINGS_ICON },
];

export function DashboardSidebar({ items = defaultItems }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-[calc(100vh-45px)] w-[250px] border-r border-[#000000] bg-[#fff]">
      <nav className="flex h-full flex-col gap-2.5 p-6">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-3 text-left text-base font-normal leading-5 tracking-[0.02em] transition",
                  isActive ? "bg-black text-white" : "text-black/70 hover:text-black",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-4 w-4 items-center justify-center text-[14px]"
                    style={isActive ? { filter: "brightness(0) invert(1)" } : undefined}
                  >
                    <IconCard name={item.icon} className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </span>

                {item.hasChevron ? (
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center"
                    style={isActive ? { filter: "brightness(0) invert(1)" } : undefined}
                  >
                    <IconCard name={CHEVRON_DOWN_ICON} className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </Link>
            </div>
          );
        })}

        <div className="mt-auto border-t border-black/30 px-3 py-3">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium uppercase tracking-[0.02em] text-black/80 transition hover:text-black"
          >
            <span className="flex h-4 w-4 items-center justify-center text-[14px]">
              <IconCard name={LOGOUT_ICON} className="h-4 w-4" />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
