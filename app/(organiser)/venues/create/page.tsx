"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/common";
import { VenueForm } from "@/components/organiser/venues/VenueForm";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

function CreateVenuePageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const venueId = searchParams.get("id") ?? undefined;
  const isEditing = mode === "edit";

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-white p-5 md:p-6 md:px-8">
        <Breadcrumb
          variant="dashboard"
          className="mb-4"
          items={[
            { label: "Venues", href: "/venues" },
            { label: isEditing ? "Edit Venue" : "Create Venue" },
          ]}
        />

        <h1 className="font-heading text-[22px] font-bold uppercase leading-none text-black sm:text-[26px]">
          {isEditing ? "Edit Venue" : "Create New Venue"}
        </h1>

        <VenueForm mode={mode} venueId={venueId} />
      </div>
    </DashboardShell>
  );
}

export default function CreateVenuePage() {
  return (
    <Suspense
      fallback={
        <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
          <div className="min-h-full bg-white p-5 text-[14px] text-black/60 md:p-6 md:px-8">
            Loading...
          </div>
        </DashboardShell>
      }
    >
      <CreateVenuePageContent />
    </Suspense>
  );
}
