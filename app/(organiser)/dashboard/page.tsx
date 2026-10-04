import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

const stats = [
  { label: "Revenue month", value: "£84,290", trend: "12% vs last month" },
  { label: "Tickets sold today", value: "1,247", trend: "34% vs avg madthday" },
  { label: "Upcoming match sales", value: "73%", trend: "2,190 / 3,000 capacity" },
  { label: "Active members", value: "2,680", trend: "8% Active Members" },
  { label: "Refund rate", value: "1.8%", trend: "0% vs avg" },
];

export default function DashboardPage() {
  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="flex h-full flex-col">
        {/* <div className="flex items-center justify-between border-b border-black/30 bg-[#f3f3f1] px-5 py-4 md:px-6">
          <div className="flex items-center gap-3 text-black/70">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13 17 17" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] uppercase tracking-[0.18em] text-black/60">Search</span>
          </div>
        </div> */}

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] leading-6 font-black uppercase tracking-[0.02em] text-black">
                Good afternoon, Harpreet
              </h1>
              <p className="text-[14px] leading-5 font-light capitalize tracking-[0.08em] text-[#6F6E69]">
                FC Northgate • 2024/25 Season • Wednesday 28 May 2025
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-[40px] cursor-pointer p-2.5 items-center justify-center border rounded-[4px] border-black bg-white text-[14px] font-medium uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white"
            >
              + Create Match
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-black/100 bg-[#fff] p-[18px]">
                <p className="uppercase tracking-[1px] font-bold text-sm leading-[20px] uppercase text-[#AAAAAC]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-[22px] leading-[24px] font-bold tracking-[-0.04em] text-black">
                  {stat.value}
                </p>
                <p className="mt-[10px] text-[14px] font-light leading-[20px] text-[#9B9994]">{stat.trend}</p>
              </div>
            ))}
          </div>

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000B2] px-4 py-8 backdrop-blur-[1px]">
            <div className="w-full max-w-[500px] rounded-[4px] border border-black/10 bg-[#f5f5f3] px-7 py-8 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] md:px-10 md:py-10">
              <div className="mt-2 flex justify-center">
                <div className="text-[52px] font-black leading-none tracking-[-0.06em] text-[#6d67fd]">
                  stripe
                </div>
              </div>

              <h2 className="mt-[17px] text-center text-[22px] font-black uppercase leading-[38px] tracking-[1px] text-black">
                Connect your Stripe account
              </h2>

              <div className="mt-[18px] space-y-5 text-center text-[16px] font-normal leading-[24px] text-black">
                <p>
                  To start selling tickets and receive payments for your events,
                  you need to connect your Stripe account to Y.
                </p>

                <p>
                  This securely connects your business to Stripe and allows Y to
                  process customer payments and manage your event payouts.
                </p>
              </div>

              <div className="mt-[40px]">
                <button
                  type="button"
                  className="flex h-[52px] w-full leading-[24px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
                >
                  Connect Stripe account
                </button>
              </div>

              <p className="mt-[13px] text-center text-[14px] leading-[18px] text-[#000000CC]">
                You&apos;ll be redirected to Stripe to complete your business and
                payment setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
