"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";

const initialVenues = [
  {
    id: 1,
    name: "Keys Corner",
    location: "Keys Park Road, Hednesford",
    type: "Stadium",
    capacity: "Maximum - 1111\nStanding - 946\nSeated - 946",
    status: "Active",
    image: "linear-gradient(135deg, #dfe9dc 0%, #a7bca6 35%, #6f7d69 100%)",
  },
  {
    id: 2,
    name: "Keys Corner",
    location: "Keys Park Road, Hednesford",
    type: "Stadium",
    capacity: "Maximum - 1111\nStanding - 946\nSeated - 946",
    status: "Inactive",
    image: "linear-gradient(135deg, #dfe3ea 0%, #b7b8c3 40%, #5d667a 100%)",
  },
];

type Venue = (typeof initialVenues)[number];

function VenueListCard({
  venue,
  isOpen,
  onToggle,
  onEdit,
}: {
  venue: Venue;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      key={venue.id}
      className="grid grid-cols-[1.2fr_1.1fr_1fr_1.1fr_0.8fr_52px] items-center border-b border-black/20 px-4 py-3 last:border-b-0"
    >
      <div className="flex items-center gap-3 pr-3">
        <div
          className="h-[52px] w-[80px] border border-black/80 bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23dfe9dc'/%3E%3Cpath d='M0 58 L120 58 L120 80 L0 80 Z' fill='%2366a96b'/%3E%3Cpath d='M0 0 L120 0 L120 18 L0 18 Z' fill='%23b7c9ab'/%3E%3Cpath d='M0 0 L20 0 L110 80 L0 80 Z' fill='rgba(255,255,255,0.12)'/%3E%3Cpath d='M120 0 L100 0 L10 80 L120 80 Z' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E"), ${venue.image}`,
          }}
        />
        <span className="text-[14px] font-medium leading-[18px] text-black">{venue.name}</span>
      </div>

      <span className="text-[14px] leading-[20px] text-black">{venue.location}</span>
      <span className="text-[14px] leading-[20px] text-black">{venue.type}</span>
      <span className="whitespace-pre-line text-[13px] leading-[18px] text-black">{venue.capacity}</span>
      <span
        className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
          venue.status === "Active" ? "text-[#24b26b]" : "text-[#ff3a3a]"
        }`}
      >
        <span
          className="mr-2 inline-block h-[7px] w-[7px] rounded-full align-middle"
          style={{ backgroundColor: venue.status === "Active" ? "#24b26b" : "#ff3a3a" }}
        />
        {venue.status}
      </span>

      <div className="relative flex justify-end">
        <button
          type="button"
          aria-label="Open venue actions"
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[22px] leading-none text-black transition hover:bg-black/5"
        >
          ⋮
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-[42px] z-10 w-[170px] border border-black bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-black hover:bg-black/5">
              <span>◌</span> View Venue
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-black hover:bg-black/5"
            >
              <span>✎</span> Edit
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-black hover:bg-black/5">
              <span>⧉</span> Duplicate
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-black hover:bg-black/5">
              <span>◍</span> Deactivate venue
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-black hover:bg-black/5">
              <span>🗑</span> Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VenuesPage() {
  const router = useRouter();
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const activeCount = initialVenues.filter((venue) => venue.status === "Active").length;
  const inactiveCount = initialVenues.filter((venue) => venue.status === "Inactive").length;

  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="min-h-full bg-[#fff] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] leading-[32px] font-bold uppercase tracking-[-0.05em] text-black md:text-[32px]">
              VENUES
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-black/60">
              Manage and organize all your venues
            </p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/venues/create")}
            className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90"
          >
            + CREATE VENUE
          </Button>
        </div>

        <div className="space-y-7 py-5">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex min-h-[82px] flex-col justify-center border border-black/100 p-[18px]">
              <p className="text-[14px] font-bold uppercase tracking-[0.5px] text-[#AAAAAC]">TOTAL VENUES</p>
              <span className="mt-[6px] text-[22px] font-bold leading-[24px] tracking-[-0.05em] text-black">{initialVenues.length}</span>
            </div>

            <div className="flex min-h-[82px] flex-col justify-center border border-black/100 p-[18px]">
              <p className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.5px] text-[#AAAAAC]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#24b26b]" /> ACTIVE
              </p>
              <span className="mt-[6px] text-[22px] font-bold leading-[24px] tracking-[-0.05em] text-black">{activeCount}</span>
            </div>

            <div className="flex min-h-[82px] flex-col justify-center border border-black/100 p-[18px]">
              <p className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.5px] text-[#AAAAAC]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#ff3a3a]" /> INACTIVE
              </p>
              <span className="mt-[6px] text-[22px] font-bold leading-[24px] tracking-[-0.05em] text-black">{inactiveCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-black/60">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M17.5 17.5L13.875 13.875" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                type="text"
                value=""
                name="search"
                placeholder="SEARCH"
                className="h-[45px] w-full border border-black/100 bg-transparent pl-10 pr-3 text-[12px] font-medium uppercase tracking-[0.14em] text-black placeholder:text-black/60 focus:outline-none"
              />
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <SelectField
                name="status"
                aria-label="Status"
                defaultValue="all"
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                className="!h-[45px] w-full min-w-[150px] rounded-none text-[14px] font-medium uppercase tracking-[0.12em] sm:w-[180px]"
              />

              <SelectField
                name="venueType"
                aria-label="Venue Type"
                defaultValue="all"
                options={[
                  { value: "all", label: "Venue Type" },
                  { value: "stadium", label: "Stadium" },
                  { value: "ground", label: "Ground" },
                  { value: "clubhouse", label: "Clubhouse" },
                ]}
                className="!h-[45px] w-full min-w-[150px] rounded-none text-[14px] font-medium uppercase tracking-[0.12em] sm:w-[180px]"
              />
            </div>
          </div>

          <div className="overflow-hidden border border-black/100 bg-[#fff]">
            <div className="grid grid-cols-[1.2fr_1.1fr_1fr_1.1fr_0.8fr_52px] items-center border-b border-black/30 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black/60">
              <span>Venue</span>
              <span>Location</span>
              <span>Venue Type</span>
              <span>Capacity</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {initialVenues.map((venue) => (
              <VenueListCard
                key={venue.id}
                venue={venue}
                isOpen={openActionId === venue.id}
                onToggle={() => setOpenActionId(openActionId === venue.id ? null : venue.id)}
                onEdit={() => router.push(`/venues/create?mode=edit&id=${venue.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
