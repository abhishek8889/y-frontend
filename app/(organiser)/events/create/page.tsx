"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventForm } from "@/components/organiser/events/EventForm";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

function CreateEventPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const eventId = searchParams.get("id") ?? undefined;
  const isEditing = mode === "edit";

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-white p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-black/70">
          <div className="flex items-center gap-2 font-normal text-[12px] uppercase leading-none tracking-normal text-[#666666]">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="font-medium text-black/70 transition hover:text-black"
            >
              EVENTS
            </button>
            <span>›</span>
            <span className="text-black">{isEditing ? "EDIT EVENT" : "CREATE EVENT"}</span>
          </div>
        </div>

        <h1 className="text-[26px] font-bold uppercase leading-none tracking-normal text-black">
          {isEditing ? "EDIT EVENT" : "CREATE NEW EVENT"}
        </h1>

        <EventForm mode={mode} eventId={eventId} />
      </div>
    </DashboardShell>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
          <div className="min-h-full bg-white p-5 text-[14px] text-black/60 md:p-6">Loading...</div>
        </DashboardShell>
      }
    >
      <CreateEventPageContent />
    </Suspense>
  );
}
