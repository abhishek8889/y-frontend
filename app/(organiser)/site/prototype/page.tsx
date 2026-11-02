"use client";

import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import ClubsitePrototype from "./ClubsitePrototype";

/**
 * Static visualisation of the proposed simplified Clubsite workspace.
 * Not wired to APIs — use this to review Website / Content / Settings
 * before changing the live Site module.
 */
export default function ClubsitePrototypePage() {
  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <ClubsitePrototype />
    </DashboardShell>
  );
}
