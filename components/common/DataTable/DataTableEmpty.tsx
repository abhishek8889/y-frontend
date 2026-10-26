"use client";

import { Button } from "@/components/ui/Button";
import type { DataTableEmptyState } from "./types";

export type DataTableEmptyProps = DataTableEmptyState & {
  className?: string;
};

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
      className={`mx-auto flex min-h-[280px] w-full max-w-[322px] flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:min-h-[320px] ${className}`.trim()}
      role="status"
    >
      <h3 className="font-heading text-[22px] leading-none text-black">{title}</h3>
      {subtitle ? (
        <p className="text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">{subtitle}</p>
      ) : null}
      {showCta ? (
        <Button
          type="button"
          onClick={onButtonClick}
          className="mt-1 inline-flex h-auto cursor-pointer items-center justify-center gap-0.5 rounded-[4px] border border-black bg-black py-2.5 pl-1.5 pr-2.5 text-[14px] font-normal uppercase leading-[19.6px] text-white transition hover:opacity-90"
        >
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
