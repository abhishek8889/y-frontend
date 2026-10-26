"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { clearAuthSession } from "@/lib/api/authStorage";
import { filterSidebarByPermissions } from "@/lib/auth/permissions";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import IconCard, { LOGOUT_ICON } from "@/components/ui/IconCard";
import yourlistLogo from "@/assets/yourlist-logo.png";
import {
  superadminSidebarConfig,
  type SuperadminSidebarItem,
} from "@/components/superadmin/sidebarConfig";

type AdminSidebarProps = {
  /** Optional override; when omitted, items are filtered from superadminSidebarConfig. */
  items?: SuperadminSidebarItem[];
};

export function AdminSidebar({ items }: AdminSidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { data } = useGetAboutMeQuery();
  const permissions = data?.data?.user?.permissions;

  const visibleItems = useMemo(() => {
    const source = items ?? superadminSidebarConfig;
    return filterSidebarByPermissions(source, permissions);
  }, [items, permissions]);

  function handleLogout() {
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/login");
  }

  return (
    <aside className="organiser-dashboard__nav flex h-full w-[250px] flex-col bg-white">
      <div className="shrink-0 border-b border-black px-6 py-4 md:hidden">
        <Image
          src={yourlistLogo}
          alt="Yourlist"
          width={95}
          height={31}
          className="h-6 w-auto object-contain"
        />
      </div>

      <nav className="flex flex-1 flex-col gap-[9px] overflow-y-auto px-6 pb-4 pt-6">
        {visibleItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? pathname === "/admin"
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.key}
              href={item.path}
              className={[
                "flex min-w-0 items-center gap-3 rounded-[4px] px-2.5 py-2 text-left text-[16px] font-normal leading-5 transition",
                isActive ? "bg-black text-white" : "text-black hover:bg-black/[0.04]",
              ].join(" ")}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center"
                style={isActive ? { filter: "brightness(0) invert(1)" } : undefined}
              >
                <IconCard name={item.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </Link>
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
