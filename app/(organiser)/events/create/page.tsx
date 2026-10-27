"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/common";
import { EventForm } from "@/components/organiser/events/EventForm";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

function CreateEventPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const eventId = searchParams.get("id") ?? undefined;
  const isEditing = mode === "edit";

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="page-content">
        <Breadcrumb
          variant="dashboard"
          className="mb-4"
          items={[
            { label: "Events", href: "/events" },
            { label: isEditing ? "Edit Event" : "Create Event" },
          ]}
        />

        <h1 className="page-title">
          {isEditing ? "Edit Event" : "Create New Event"}
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
          <div className="page-content text-[14px] text-black/60">
            Loading...
          </div>
        </DashboardShell>
      }
    >
      <CreateEventPageContent />
    </Suspense>
  );
}
