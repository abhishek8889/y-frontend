"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

export type FilterOption = { value: string; label: string };

export function TabSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="min-w-[220px] flex-1">
      <InputField
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="SEARCH"
        aria-label="Search records"
        density="compact"
        prefix={(
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        suffix={value ? (
          <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="text-[18px] leading-none text-black/50 hover:text-black">
            ×
          </button>
        ) : null}
        containerClassName="!rounded-none !border-0 !border-b !border-black/55 !px-0 focus-within:!ring-0 focus-within:!border-black"
        className="!px-2 !text-[13px] placeholder:!text-[#666]"
      />
    </div>
  );
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-[125px]">
      <SelectField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={options}
        density="compact"
        containerClassName="!min-w-[125px] !rounded-none"
        className="!rounded-none !border-black/75 !px-2.5 !pr-8 !text-[11px] !font-bold !uppercase"
      />
    </div>
  );
}

export function MonthFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="min-w-[125px]">
      <InputField
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filter by month"
        density="compact"
        containerClassName="!rounded-none !border-black/75 focus-within:!ring-0"
        className="!px-2.5 !text-[11px] !font-bold !uppercase"
      />
    </div>
  );
}

export function ExportButton({
  fileName,
  headers,
  rows,
}: {
  fileName: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  function exportRows() {
    const escapeCell = (cell: string | number) => `"${String(cell).replaceAll('"', '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <Button type="button" onClick={exportRows} className="inline-flex h-[36px] items-center gap-2 rounded-[3px] border border-black bg-black px-3 text-[11px] font-medium uppercase text-white hover:bg-white hover:text-black">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 16v4h14v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Export
    </Button>
  );
}

export function RowActions({
  label,
  actions,
  onAction,
}: {
  label: string;
  actions: string[];
  onAction: (action: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        aria-label={`Actions for ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.035] text-[18px] leading-none text-black/75 hover:bg-black/10"
      >
        ⋮
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-20 min-w-[190px] border border-black/70 bg-white p-1 shadow-md">
          {actions.map((action) => (
            <button
              type="button"
              key={action}
              onClick={() => { onAction(action); setOpen(false); }}
              className="block w-full px-2.5 py-2 text-left text-[11px] text-black hover:bg-black/[0.05]"
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ResultNotice({ children, onClose }: { children: string; onClose: () => void }) {
  return (
    <div role="status" className="mt-3 flex items-center justify-between gap-3 border border-black/20 bg-[#F1F1F1] px-3 py-2 text-[12px] text-black/75">
      {children}
      <button type="button" onClick={onClose} aria-label="Dismiss message" className="text-[17px] leading-none text-black/50 hover:text-black">×</button>
    </div>
  );
}