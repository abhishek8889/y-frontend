"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VenueForm } from "@/components/organiser/venues/VenueForm";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

function CreateVenuePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const venueId = searchParams.get("id") ?? undefined;
  const isEditing = mode === "edit";

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-[#fff] p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-black/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/venues")}
              className="font-medium text-black/70 transition hover:text-black"
            >
              VENUES
            </button>
            <span>›</span>
            <span className="text-black">{isEditing ? "EDIT VENUE" : "CREATE VENUE"}</span>
          </div>
        </div>

        <h1 className="text-[32px] font-black uppercase leading-[1.1] tracking-[-0.06em] text-black">
          {isEditing ? "EDIT VENUE" : "CREATE NEW VENUE"}
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
          <div className="min-h-full bg-[#fff] p-5 md:p-6 text-[14px] text-black/60">Loading...</div>
        </DashboardShell>
      }
    >
      <CreateVenuePageContent />
    </Suspense>
  );
}
