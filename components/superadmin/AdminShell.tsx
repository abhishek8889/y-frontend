import type { ReactNode } from "react";

type AdminShellProps = {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ header, sidebar, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      {header ? <div className="sticky top-0 z-20 border-b border-black/20 bg-white">{header}</div> : null}
      <div className="flex min-h-[calc(100vh-57px)]">
        {sidebar ? (
          <aside className="hidden w-[250px] shrink-0 border-r border-black/20 lg:block">{sidebar}</aside>
        ) : null}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
