import type { ReactNode } from "react";

type DashboardShellProps = {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  rightRail?: ReactNode;
};

export function DashboardShell({
  header,
  sidebar,
  children,
  rightRail,
}: DashboardShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#d9d9d6]">
      <div className="mx-auto h-screen bg-[#fff]">
        <div className="fixed inset-x-0 top-0 z-30">{header}</div>

        <div className="flex h-screen pt-[45px]">
          <div className="fixed left-0 top-[45px] h-[calc(100vh-45px)] w-[260px] overflow-y-auto">
            {sidebar}
          </div>

          <div className="ml-[260px] flex flex-1 overflow-hidden">
            <div className="min-w-0 flex-1 overflow-y-auto bg-[#fff]">{children}</div>
            {rightRail ? (
              <div className="w-[260px] shrink-0 overflow-y-auto border-l border-black/30 bg-[#f4f4f2]">
                {rightRail}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
