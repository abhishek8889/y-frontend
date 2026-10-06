"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuthSession } from "@/lib/api/authStorage";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import { useState } from "react";
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
  const dispatch = useAppDispatch();

  function handleLogout() {
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/login");
  }
  const [financeExpanded, setFinanceExpanded] = useState(pathname.startsWith("/finance"));

  return (
    <aside className="h-[calc(100vh-45px)] w-[250px] border-r border-[#000000] bg-[#fff]">
      <nav className="flex h-full flex-col gap-2.5 p-6">
        {items.map((item) => {
          const isFinance = item.label === "Finance";
          const isActive = pathname === item.href;

          return (
            <div key={item.label}>
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={[
                    "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[4px] px-3 py-3 text-left text-base font-normal leading-5 tracking-[0.02em] transition",
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
                </Link>
                {isFinance ? (
                  <button
                    type="button"
                    aria-label={`${financeExpanded ? "Collapse" : "Expand"} Finance menu`}
                    aria-expanded={financeExpanded}
                    onClick={() => setFinanceExpanded((expanded) => !expanded)}
                    className={[
                      "flex h-10 w-8 shrink-0 items-center justify-center transition",
                      isActive ? "text-white" : "text-black/70 hover:text-black",
                    ].join(" ")}
                  >
                    <IconCard
                      name={CHEVRON_DOWN_ICON}
                      className={`h-3.5 w-3.5 transition-transform ${financeExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : null}
              </div>
              {isFinance && financeExpanded ? (
                <div className="ml-7 mt-1 flex flex-col gap-0.5">
                  {[
                    { label: "Overview", href: "/finance", active: pathname === "/finance" },
                    { label: "Transaction", href: "/finance/transactions", active: pathname === "/finance/transactions" },
                    { label: "Payouts", href: "/finance/payouts", active: pathname === "/finance/payouts" },
                    { label: "Refunds", href: "/finance/refunds", active: pathname === "/finance/refunds" },
                  ].map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      aria-current={child.active ? "page" : undefined}
                      className={[
                        "rounded-[3px] px-3 py-1.5 text-[13px] leading-5 transition",
                        child.active ? "bg-black text-white" : "text-black/75 hover:bg-black/5 hover:text-black",
                      ].join(" ")}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="mt-auto border-t border-black/30 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] font-medium uppercase tracking-[0.02em] text-black/80 transition hover:text-black"
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
