"use client";

import Image from "next/image";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import IconCard, { NOTIFICATION_ICON } from "@/components/ui/IconCard";
import hednesfordTownLogo from "@/assets/Hednesford-town.png";

type DashboardHeaderProps = {
  /** Optional override; defaults to organisation name from about-me. */
  title?: string;
  /** Optional override; defaults to owner name from about-me. */
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

function resolveOwnerName(user: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null | undefined) {
  const fullName = [user?.first_name, user?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (fullName) return fullName;
  return user?.email?.trim() || "";
}

function ownerInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function DashboardHeader({ title, userName }: DashboardHeaderProps) {
  const { data, isLoading } = useGetAboutMeQuery();
  const user = data?.data?.user;

  const organisationName = title?.trim() || resolveOrganisationName(user);
  const ownerName = userName?.trim() || resolveOwnerName(user);
  const organisationLogo = user?.organisation?.logo || user?.organisation?.profile_image || null;
  const displayOrganisation = organisationName || (isLoading ? "" : "Organisation");
  const displayOwner = ownerName || (isLoading ? "" : "Owner");

  return (
    <header className="flex h-[45px] items-center justify-between border-b border-[#000000] bg-[#fff] px-5 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/70 text-[10px] font-bold text-black/80">
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
            />
          )}
        </div>
        <span className="truncate text-[18px] font-black uppercase tracking-[0.02em] text-black">
          {displayOrganisation}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center text-black/80 transition hover:text-black"
        >
          <IconCard name={NOTIFICATION_ICON} className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2 border-l border-black/30 pl-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/60 text-[9px] font-bold text-black/80">
            {ownerInitial(displayOwner)}
          </div>
          <span className="max-w-[160px] truncate text-[13px] font-medium uppercase tracking-[0.12em] text-black">
            {displayOwner}
          </span>
        </div>
      </div>
    </header>
  );
}
