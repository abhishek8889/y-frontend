"use client";

import { Button } from "@/components/ui/Button";
import type { DataTableEmptyState } from "./types";

export type DataTableEmptyProps = DataTableEmptyState & {
  className?: string;
};

function EmptyTableIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M9 9v11M15 9v11" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 14.5h2.5M13.5 14.5H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function DataTableEmpty({
  title,
  subtitle,
  showButton = false,
  buttonLabel,
  onButtonClick,
  className = "",
}: DataTableEmptyProps) {
  const showCta = Boolean(showButton && buttonLabel && onButtonClick);

  return (
    <div
      className={`mx-auto flex min-h-[280px] w-full max-w-[480px] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[320px] ${className}`.trim()}
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center border border-black/20 bg-[#F5F5F5] text-black/55">
        <EmptyTableIcon />
      </div>
      <h3 className="font-heading text-[20px] leading-6 tracking-[-0.02em] text-black sm:text-[22px]">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-2 max-w-[360px] text-[14px] leading-5 text-[#777]">{subtitle}</p>
      ) : null}
      {showCta ? (
        <Button
          type="button"
          onClick={onButtonClick}
          className="mt-5 inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[3px] border border-black bg-black px-4 text-[14px] font-normal uppercase text-white transition hover:bg-white hover:text-black"
        >
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
