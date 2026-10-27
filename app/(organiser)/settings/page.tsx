"use client";

import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

export default function SettingsPage() {
  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Manage organisation settings. Content will be added here.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
