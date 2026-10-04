import Image from "next/image";
import IconCard, { NOTIFICATION_ICON } from "@/components/ui/IconCard";
import hednesfordTownLogo from "@/assets/Hednesford-town.png";

type DashboardHeaderProps = {
  title?: string;
  userName?: string;
};

export function DashboardHeader({
  title = "HEDNESFORD TOWN",
  userName = "HARPREET",
}: DashboardHeaderProps) {
  return (
    <header className="flex h-[45px] items-center justify-between border-b border-[#000000] bg-[#fff] px-5 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-black/70 text-[10px] font-bold text-black/80">
          <Image
            src={hednesfordTownLogo}
            alt="Hednesford Town Logo"
            width={20}
            height={20}
          />
        </div>
        <span className="text-[18px] font-black uppercase tracking-[0.02em] text-black">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center text-black/80 transition hover:text-black"
        >
          <IconCard name={NOTIFICATION_ICON} className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 border-l border-black/30 pl-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-black/60 text-[9px] font-bold text-black/80">
            H
          </div>
          <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-black">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
