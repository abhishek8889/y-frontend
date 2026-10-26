"use client";

import Image from "next/image";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import IconCard, { CHEVRON_DOWN_ICON, NOTIFICATION_ICON } from "@/components/ui/IconCard";
import yourlistLogo from "@/assets/yourlist-logo.png";

type AdminHeaderProps = {
  /** Optional override for the left brand label. */
  title?: string;
  /** Optional override for the account name. */
  userName?: string;
};

function resolveAdminDisplayName(user: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  roles?: string[] | null;
} | null | undefined) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (user?.roles?.includes("super_admin")) return "Super Admin";
  return user?.email?.trim() || "Admin";
}

export function AdminHeader({ title, userName }: AdminHeaderProps) {
  const { data, isLoading } = useGetAboutMeQuery();
  const user = data?.data?.user;

  const brand = title?.trim() || "Yourlist";
  const displayName = userName?.trim() || resolveAdminDisplayName(user) || (isLoading ? "" : "Admin");

  return (
    <header className="organiser-dashboard__header flex h-[45px] items-center justify-between border-b border-black bg-white px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          src={yourlistLogo}
          alt={brand}
          width={95}
          height={31}
          className="h-5 w-auto object-contain"
          priority
        />
        <span className="sr-only">{brand} Admin</span>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center text-black transition hover:opacity-80"
        >
          <IconCard name={NOTIFICATION_ICON} className="h-7 w-7" />
        </button>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 text-black"
          aria-label="Account menu"
        >
          <span className="max-w-[160px] truncate text-[14px] font-normal leading-5 text-black">
            {displayName}
          </span>
          <IconCard name={CHEVRON_DOWN_ICON} className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </header>
  );
}
