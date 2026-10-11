"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { clearAuthSession } from "@/lib/api/authStorage";
import { filterSidebarByPermissions } from "@/lib/auth/permissions";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import IconCard, { LOGOUT_ICON } from "@/components/ui/IconCard";
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
    <aside className="h-[calc(100vh-45px)] w-[260px] border-r border-[#000000] bg-[#fff]">
      <nav className="flex h-full flex-col gap-2.5 p-6">
        {visibleItems.map((item) => {
          const isFinance = item.key === "finance";
          const isActive =
            !isFinance &&
            (pathname === item.path || pathname.startsWith(`${item.path}/`));

          return (
            <div key={item.key}>
              <div className="relative flex items-center">
                <Link
                  href={item.path}
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
                      "absolute right-0 flex h-10 w-8 shrink-0 cursor-pointer items-center justify-center transition",
                      isActive ? "text-white" : "text-black/70 hover:text-black",
                    ].join(" ")}
                  >
                    <svg width="16px" height="16px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" fill="white" fillOpacity="0.01" />
                      <path
                        d="M37 18L25 30L13 18"
                        stroke="#000000"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    { label: "Payouts", href: "/finance/payouts", active: pathname === "/finance/payouts" },
                    { label: "Refunds", href: "/finance/refunds", active: pathname === "/finance/refunds" },
                  ].map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      aria-current={child.active ? "page" : undefined}
                      className={[
                        "rounded-[3px] px-3 py-1.5 pl-7 text-[13px] leading-5 transition",
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
