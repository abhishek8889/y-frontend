"use client";

import { useRef, useState, type ReactNode } from "react";
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
  enableSearch?: boolean;
  enableFilters?: boolean;
};

function SearchClearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DataTableToolbar({
  search,
  filters = [],
  onFilterChange,
  toolbarExtra,
  enableSearch = true,
  enableFilters = true,
}: DataTableToolbarProps) {
  const hasSearch = enableSearch && Boolean(search);
  const hasFilters = enableFilters && filters.length > 0;
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = search?.placeholder ?? "Search..";

  if (!hasSearch && !hasFilters && !toolbarExtra) return null;

  function dismissSearchFocus() {
    setSearchFocused(false);
    inputRef.current?.blur();
  }

  return (
    <>
      {hasSearch && searchFocused ? (
        <button
          type="button"
          aria-label="Dismiss search"
          className="fixed inset-0 z-[45] cursor-default bg-black/40"
          onMouseDown={(event) => {
            event.preventDefault();
            dismissSearchFocus();
          }}
        />
      ) : null}

      <div className={`datatable-toolbar${searchFocused ? " relative z-[50]" : ""}`}>
        {hasSearch ? (
          <label
            className={`datatable-search-bar${
              searchFocused ? " relative z-[50] bg-white text-black shadow-[0_0_0_1px_black]" : ""
            }`}
          >
            <button
              type="button"
              aria-label="Search"
              tabIndex={-1}
              onMouseDown={(event) => {
                event.preventDefault();
                dismissSearchFocus();
              }}
              className="flex shrink-0 cursor-pointer items-center justify-center text-current"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.6" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={search?.value ?? ""}
              onChange={(event) => search?.onChange(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  dismissSearchFocus();
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            {search?.value ? (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(event) => {
                  event.preventDefault();
                  search.onChange("");
                  dismissSearchFocus();
                }}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center text-black/55 transition hover:text-black"
              >
                <SearchClearIcon />
              </button>
            ) : null}
          </label>
        ) : null}

        {(hasFilters || toolbarExtra) && (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            {hasFilters
              ? filters.map((filter) => (
                  <SelectField
                    key={filter.key}
                    name={filter.key}
                    aria-label={filter.label ?? filter.key}
                    value={filter.value ?? "all"}
                    options={filter.options ?? []}
                    onChange={(event) => onFilterChange?.(filter.key, event.target.value)}
                    density="compact"
                    wrapperClassName="datatable-filter-option !gap-0 w-full sm:w-auto"
                    containerClassName="input-box input-box-compact"
                    className={`w-full text-[12px] font-normal normal-case text-black ${filter.className ?? ""}`.trim()}
                  />
                ))
              : null}
            {toolbarExtra}
          </div>
        )}
      </div>
    </>
  );
}
