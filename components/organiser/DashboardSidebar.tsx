"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { clearAuthSession } from "@/lib/api/authStorage";
import { filterSidebarByPermissions } from "@/lib/auth/permissions";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import IconCard, { CHEVRON_DOWN_ICON, LOGOUT_ICON } from "@/components/ui/IconCard";
import {
  organisationSidebarConfig,
  type OrganisationSidebarItem,
} from "@/components/organiser/sidebarConfig";

type DashboardSidebarProps = {
  /** Optional override; when omitted, items are filtered from organisationSidebarConfig. */
  items?: OrganisationSidebarItem[];
};

export function DashboardSidebar({ items }: DashboardSidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { data } = useGetAboutMeQuery();
  const permissions = data?.data?.user?.permissions;
  const [financeExpanded, setFinanceExpanded] = useState(pathname.startsWith("/finance"));

  const visibleItems = useMemo(() => {
    const source = items ?? organisationSidebarConfig;
    return filterSidebarByPermissions(source, permissions);
  }, [items, permissions]);

  function handleLogout() {
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/login");
  }

  return (
    <aside className="sidebar-nav">
      <nav className="sidebar-menu">
        {visibleItems.map((item) => {
          const isFinance = item.key === "org_finance";
          const isActive =
            !isFinance &&
            (pathname === item.path || pathname.startsWith(`${item.path}/`));
          const financeActive = isFinance && pathname.startsWith("/finance");
          const itemActive = isActive || financeActive;

          return (
            <div key={item.key}>
              <div className="relative flex items-center">
                <Link
                  href={item.path}
                  className={["sidebar-item", itemActive ? "sidebar-item-active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="sidebar-icon">
                    <IconCard name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
                {isFinance ? (
                  <button
                    type="button"
                    aria-label={`${financeExpanded ? "Collapse" : "Expand"} Finance menu`}
                    aria-expanded={financeExpanded}
                    onClick={() => setFinanceExpanded((expanded) => !expanded)}
                    className={[
                      "absolute right-1 flex h-8 w-8 cursor-pointer items-center justify-center transition",
                      financeExpanded ? "rotate-180" : "",
                      financeActive ? "text-white" : "text-black",
                    ].join(" ")}
                  >
                    <IconCard name={CHEVRON_DOWN_ICON} className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {isFinance && financeExpanded ? (
                <div className="mt-1 flex flex-col gap-0.5">
                  {[
                    { label: "Overview", href: "/finance", active: pathname === "/finance" },
                    {
                      label: "Transaction",
                      href: "/finance/transactions",
                      active: pathname === "/finance/transactions",
                    },
                    {
                      label: "Payouts",
                      href: "/finance/payouts",
                      active: pathname === "/finance/payouts",
                    },
                    {
                      label: "Refunds",
                      href: "/finance/refunds",
                      active: pathname === "/finance/refunds",
                    },
                  ].map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      aria-current={child.active ? "page" : undefined}
                      className={[
                        "sidebar-subitem",
                        child.active ? "sidebar-subitem-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button type="button" onClick={handleLogout} className="sidebar-logout">
          <span className="sidebar-icon text-[#ff383c]">
            <IconCard name={LOGOUT_ICON} className="h-5 w-5" />
          </span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
