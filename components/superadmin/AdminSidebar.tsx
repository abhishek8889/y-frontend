"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { filterSidebarByPermissions } from "@/lib/auth/permissions";
import { superadminSidebarConfig } from "@/components/superadmin/sidebarConfig";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data } = useGetAboutMeQuery();
  const permissions = data?.data?.user?.permissions;

  const visibleItems = useMemo(
    () => filterSidebarByPermissions(superadminSidebarConfig, permissions),
    [permissions],
  );

  return (
    <nav className="flex h-full flex-col gap-2 p-5">
      <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">Superadmin</p>
      {visibleItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

        return (
          <Link
            key={item.key}
            href={item.path}
            className={[
              "rounded-[4px] px-3 py-3 text-[14px] font-medium transition",
              isActive ? "bg-black text-white" : "text-black/70 hover:text-black",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
