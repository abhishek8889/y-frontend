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
    <aside className="organiser-dashboard__nav flex h-full w-[250px] flex-col bg-white">
      <nav className="flex flex-1 flex-col gap-[9px] overflow-y-auto px-6 pb-4 pt-6">
        {visibleItems.map((item) => {
          const isFinance = item.key === "org_finance";
          const isActive =
            !isFinance &&
            (pathname === item.path || pathname.startsWith(`${item.path}/`));
          const financeActive = isFinance && pathname.startsWith("/finance");

          return (
            <div key={item.key}>
              <div className="relative flex items-center">
                <Link
                  href={item.path}
                  className={[
                    "flex min-w-0 flex-1 items-center gap-3 rounded-[4px] px-2.5 py-2 text-left text-[16px] font-normal leading-5 transition",
                    isActive || financeActive
                      ? "bg-black text-white"
                      : "text-black hover:bg-black/[0.04]",
                  ].join(" ")}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center"
                    style={
                      isActive || financeActive
                        ? { filter: "brightness(0) invert(1)" }
                        : undefined
                    }
                  >
                    <IconCard name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
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
                        "rounded-[3px] px-2.5 py-1.5 pl-10 text-[13px] leading-5 transition",
                        child.active
                          ? "bg-black text-white"
                          : "text-black/75 hover:bg-black/5 hover:text-black",
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
      </nav>

      <div className="shrink-0 px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2 py-2 text-[14px] font-normal leading-5 text-[#ff383c] transition hover:bg-[#ff383c]/[0.06]"
        >
          <span className="flex h-5 w-5 items-center justify-center text-[#ff383c]">
            <IconCard name={LOGOUT_ICON} className="h-5 w-5" />
          </span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
