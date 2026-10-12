"use client";

import type { ReactNode } from "react";
import { SelectField } from "@/components/ui/SelectField";
import type { DataTableFilter } from "./types";

type DataTableToolbarProps = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: DataTableFilter[];
  onFilterChange?: (key: string, value: string) => void;
  toolbarExtra?: ReactNode;
};

export function DataTableToolbar({
  search,
  filters = [],
  onFilterChange,
  toolbarExtra,
}: DataTableToolbarProps) {
  const hasSearch = Boolean(search);
  const hasFilters = filters.length > 0;

  if (!hasSearch && !hasFilters && !toolbarExtra) return null;

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      {hasSearch ? (
        <label className="flex h-[34px] min-w-0 flex-1 items-center gap-2 border-b border-black/55 px-2 text-black/60 focus-within:border-black">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search?.value ?? ""}
            onChange={(event) => search?.onChange(event.target.value)}
            placeholder={search?.placeholder ?? "Search"}
            aria-label={search?.placeholder ?? "Search"}
            className="min-w-0 flex-1 bg-transparent text-[14px] uppercase text-black placeholder:text-[#888] focus:outline-none"
          />
        </label>
      ) : null}

      {(hasFilters || toolbarExtra) && (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {filters.map((filter) => (
            <SelectField
              key={filter.key}
              name={filter.key}
              aria-label={filter.label ?? filter.key}
              value={filter.value ?? "all"}
              options={filter.options ?? []}
              onChange={(event) => onFilterChange?.(filter.key, event.target.value)}
              density="compact"
              wrapperClassName="!gap-0 w-full sm:w-auto"
              containerClassName="!h-[40px] min-w-[120px]"
              className={`!h-[40px] !rounded-none !border-black !px-2 !pr-9 w-full min-w-[120px] text-[14px] font-bold uppercase sm:w-auto ${filter.className ?? ""}`.trim()}
            />
          ))}
          {toolbarExtra}
        </div>
      )}
    </div>
  );
}
