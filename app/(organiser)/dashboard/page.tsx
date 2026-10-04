"use client";

import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import {
  DashboardHeader,
  DashboardShell,
  DashboardSidebar,
  StripeConnectModal,
} from "@/components/organiser";

const stats = [
  { label: "Revenue month", value: "£84,290", trend: "12% vs last month" },
  { label: "Tickets sold today", value: "1,247", trend: "34% vs avg madthday" },
  { label: "Upcoming match sales", value: "73%", trend: "2,190 / 3,000 capacity" },
  { label: "Active members", value: "2,680", trend: "8% Active Members" },
  { label: "Refund rate", value: "1.8%", trend: "0% vs avg" },
];

export default function DashboardPage() {
  const { data, isLoading, isFetching } = useGetAboutMeQuery();
  const user = data?.data?.user;
  const showStripeConnect =
    !isLoading && !isFetching && user?.organisation_approve_status === false;

  const displayName = user?.first_name?.trim() || "there";

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

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-black/100 bg-[#fff] p-[18px]">
                <p className="text-sm font-bold uppercase leading-[20px] tracking-[1px] text-[#AAAAAC]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-[22px] font-bold leading-[24px] tracking-[-0.04em] text-black">
                  {stat.value}
                </p>
                <p className="mt-[10px] text-[14px] font-light leading-[20px] text-[#9B9994]">{stat.trend}</p>
              </div>
            ))}
          </div>

          {showStripeConnect ? <StripeConnectModal /> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
