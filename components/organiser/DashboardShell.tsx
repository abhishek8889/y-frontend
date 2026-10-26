"use client";

import { useState, type ReactNode } from "react";
import IconCard, { SEARCH_ICON } from "@/components/ui/IconCard";

type DashboardShellProps = {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  rightRail?: ReactNode;
  /** Show the Figma search strip above page content. Default true. */
  showSearch?: boolean;
};

/**
 * Organiser layout: top menu bar + left sidebar partition + main data screen.
 * Matches Figma: 45px header, 250px sidebar with 1px black border, search strip.
 */
export function DashboardShell({
  header,
  sidebar,
  children,
  rightRail,
  showSearch = true,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="organiser-dashboard h-screen overflow-hidden bg-[#fafbfc]">
      <div className="mx-auto h-screen bg-white">
        <div className="fixed inset-x-0 top-0 z-30">{header}</div>

        <button
          type="button"
          className="fixed left-4 top-[54px] z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white text-[12px] uppercase md:hidden"
          aria-expanded={mobileNavOpen}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? "✕" : "☰"}
        </button>

        {mobileNavOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <div className="flex h-screen pt-[45px]">
          <div
            className={[
              "organiser-dashboard__sidebar fixed left-0 top-[45px] z-40 h-[calc(100vh-45px)] w-[250px] overflow-y-auto border-r border-black bg-white transition-transform md:translate-x-0",
              mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            ].join(" ")}
            onClick={() => setMobileNavOpen(false)}
          >
            {sidebar}
          </div>

          <div className="organiser-dashboard__main ml-0 flex min-w-0 flex-1 flex-col overflow-hidden md:ml-[250px]">
            {showSearch ? (
              <div className="organiser-dashboard__search flex h-[45px] shrink-0 items-center gap-2.5 border-b border-black bg-white pl-14 pr-4 md:pl-4">
                <IconCard name={SEARCH_ICON} className="h-5 w-5 shrink-0 text-black" />
                <span className="text-[14px] font-normal uppercase leading-5 text-black">Search</span>
              </div>
            ) : null}

            <div className="min-w-0 flex-1 overflow-y-auto bg-[#fafbfc]">
              <div className="flex min-h-full">
                <div className="min-w-0 flex-1">{children}</div>
                {rightRail ? (
                  <div className="hidden w-[260px] shrink-0 overflow-y-auto border-l border-black bg-white lg:block">
                    {rightRail}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
