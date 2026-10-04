"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/admin" },
  { label: "Organisers", href: "/admin/organisers" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-2 p-5">
      <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">Superadmin</p>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
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
