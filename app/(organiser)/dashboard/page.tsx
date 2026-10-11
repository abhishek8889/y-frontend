"use client";

import { useMemo } from "react";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { GridCard, type GridCardItem } from "@/components/common";
import {
  DashboardHeader,
  DashboardShell,
  DashboardSidebar,
  StripeConnectModal,
} from "@/components/organiser";

export default function DashboardPage() {
  const { data, isLoading, isFetching } = useGetAboutMeQuery();
  const user = data?.data?.user;
  const showStripeConnect =
    !isLoading && !isFetching && user?.organisation_approve_status === false;

  const displayName = user?.first_name?.trim() || "there";

  // Page owns data/config (same idea as Offthetree `listItems`).
  // Swap these for live API metrics when dashboard endpoints are ready.
  const overviewItems = useMemo<GridCardItem[]>(
    () => [
      {
        id: "revenue-month",
        label: "Revenue month",
        value: "£84,290",
        description: "12% vs last month",
      },
      {
        id: "tickets-sold-today",
        label: "Tickets sold today",
        value: "1,247",
        description: "34% vs avg matchday",
      },
      {
        id: "upcoming-match-sales",
        label: "Upcoming match sales",
        value: "73%",
        description: "2,190 / 3,000 capacity",
      },
      {
        id: "active-members",
        label: "Active members",
        value: "2,680",
        description: "8% Active Members",
      },
      {
        id: "refund-rate",
        label: "Refund rate",
        value: "1.8%",
        description: "0% vs avg",
      },
    ],
    [],
  );

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="flex h-full flex-col">
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-black uppercase leading-6 tracking-[0.02em] text-black">
                Good afternoon, {displayName}
              </h1>
              <p className="text-[14px] font-light capitalize leading-5 tracking-[0.08em] text-[#6F6E69]">
                FC Northgate • 2024/25 Season • Wednesday 28 May 2025
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white p-2.5 text-[14px] font-medium uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white"
            >
              + Create Match
            </button>
          </div>

          <div className="mt-6">
            <GridCard items={overviewItems} columns={5} isLoading={isLoading && !data} />
          </div>

          {showStripeConnect ? <StripeConnectModal /> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
