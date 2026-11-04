"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

/** Legacy route — manage UI opens from Sites → Manage. */
export default function ClubsitePrototypePage() {
  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="page-content site-page-empty">
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">Clubsite preview</h1>
            <p className="page-subtitle">
              Open Sites and choose Manage to edit Website, Content, and Settings.
            </p>
          </div>
          <Link href="/site" className="page-primary-button-action">
            Go to Sites
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
