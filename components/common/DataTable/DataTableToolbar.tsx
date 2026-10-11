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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
      {hasSearch ? (
        <div className="relative min-w-0 w-full md:flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-black/60">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 17.5L13.875 13.875"
                stroke="black"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="search"
            value={search?.value ?? ""}
            onChange={(event) => search?.onChange(event.target.value)}
            placeholder={search?.placeholder ?? "SEARCH"}
            aria-label={search?.placeholder ?? "Search"}
            className="h-[45px] w-full border border-black/100 bg-transparent pl-10 pr-3 text-[12px] font-medium uppercase tracking-[0.14em] text-black placeholder:text-black/60 focus:outline-none"
          />
        </div>
      ) : null}

      {(hasFilters || toolbarExtra) && (
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {filters.map((filter) => (
            <SelectField
              key={filter.key}
              name={filter.key}
              aria-label={filter.label ?? filter.key}
              value={filter.value ?? "all"}
              onChange={(event) => onFilterChange?.(filter.key, event.target.value)}
              options={filter.options}
              className={`!h-[45px] w-full min-w-[150px] rounded-none text-[14px] font-medium uppercase tracking-[0.12em] sm:w-[180px] ${filter.className ?? ""}`.trim()}
            />
          ))}
          {toolbarExtra}
        </div>
      )}
    </div>
  );
}
