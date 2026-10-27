"use client";

import Image from "next/image";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import IconCard, { CHEVRON_DOWN_ICON, NOTIFICATION_ICON } from "@/components/ui/IconCard";
import hednesfordTownLogo from "@/assets/Hednesford-town.png";

type DashboardHeaderProps = {
  /** Optional override; defaults to organisation name from about-me. */
  title?: string;
  /** Optional override; defaults to owner first name from about-me. */
  userName?: string;
};

function resolveOrganisationName(user: {
  organisation_name?: string | null;
  organisation?: { name?: string | null } | null;
} | null | undefined) {
  const fromNested = user?.organisation?.name?.trim();
  if (fromNested) return fromNested;
  const fromFlat = user?.organisation_name?.trim();
  if (fromFlat) return fromFlat;
  return "";
}

function resolveOwnerFirstName(user: {
  first_name?: string | null;
  email?: string | null;
} | null | undefined) {
  const first = user?.first_name?.trim();
  if (first) return first;
  return user?.email?.trim() || "";
}

export function DashboardHeader({ title, userName }: DashboardHeaderProps) {
  const { data, isLoading } = useGetAboutMeQuery();
  const user = data?.data?.user;

  const organisationName = title?.trim() || resolveOrganisationName(user);
  const ownerName = userName?.trim() || resolveOwnerFirstName(user);
  const organisationLogo = user?.organisation?.logo || user?.organisation?.profile_image || null;
  const displayOrganisation = organisationName || (isLoading ? "" : "Organisation");
  const displayOwner = ownerName || (isLoading ? "" : "Owner");

  return (
    <header className="organiser-dashboard__header flex items-center justify-between border-b border-black bg-white px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative h-5 w-5 shrink-0 overflow-hidden">
          {organisationLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organisationLogo}
              alt={displayOrganisation || "Organisation logo"}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={hednesfordTownLogo}
              alt={displayOrganisation || "Organisation logo"}
              width={20}
              height={20}
              className="h-5 w-5 object-cover"
            />
          )}
        </div>
        <span className="sidebar-title truncate">{displayOrganisation}</span>
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
          <span className="max-w-[140px] truncate text-[14px] font-normal leading-5 text-black">
            {displayOwner}
          </span>
          <IconCard name={CHEVRON_DOWN_ICON} className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </header>
  );
}
