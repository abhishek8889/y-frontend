"use client";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import {
  getBrowserTimeZone,
  localDateTimeInZoneToUtcSql,
} from "@/components/organiser/events/eventFormHelpers";

export type EventListFilterValues = {
  status: string;
  eventCategoryId: string;
  dateFrom: string;
  dateTo: string;
};

export const EVENT_LIST_FILTER_DEFAULTS: EventListFilterValues = {
  status: "all",
  eventCategoryId: "all",
  dateFrom: "",
  dateTo: "",
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

type CategoryOption = {
  value: string;
  label: string;
};

type EventListFiltersProps = {
  values: EventListFilterValues;
  categoryOptions: CategoryOption[];
  onChange: (next: EventListFilterValues) => void;
  onClear: () => void;
};

export function hasActiveEventFilters(values: EventListFilterValues) {
  return (
    values.status !== "all" ||
    values.eventCategoryId !== "all" ||
    Boolean(values.dateFrom.trim()) ||
    Boolean(values.dateTo.trim())
  );
}

/** Convert a local calendar date in `timeZone` to UTC SQL for range start (00:00:00). */
export function filterDateToUtcStartsAt(date: string, timeZone = getBrowserTimeZone()) {
  const trimmed = date.trim();
  if (!trimmed) return "";
  return localDateTimeInZoneToUtcSql(`${trimmed}T00:00:00`, timeZone);
}

/** Convert a local calendar date in `timeZone` to UTC SQL for range end (23:59:59). */
export function filterDateToUtcEndsAt(date: string, timeZone = getBrowserTimeZone()) {
  const trimmed = date.trim();
  if (!trimmed) return "";
  return localDateTimeInZoneToUtcSql(`${trimmed}T23:59:59`, timeZone);
}

export function EventListFilters({
  values,
  categoryOptions,
  onChange,
  onClear,
}: EventListFiltersProps) {
  return (
    <div className="mt-3 space-y-3 border border-black/20 bg-[#FAFAFA] p-3">
      <SelectField
        name="eventStatusFilter"
        label="Status"
        labelClassName="!text-[12px] !mb-1 !leading-[16px]"
        value={values.status}
        onChange={(event) => onChange({ ...values, status: event.target.value })}
        options={statusOptions}
        density="compact"
        containerClassName="!h-10 !rounded-[3px]"
        className="!rounded-[3px] !border-black/50 !px-3 !text-[13px] !font-normal normal-case"
      />

      <SelectField
        name="eventCategoryFilter"
        label="Event category"
        labelClassName="!text-[12px] !mb-1 !leading-[16px]"
        value={values.eventCategoryId}
        onChange={(event) => onChange({ ...values, eventCategoryId: event.target.value })}
        options={[{ value: "all", label: "All categories" }, ...categoryOptions]}
        density="compact"
        containerClassName="!h-10 !rounded-[3px]"
        className="!rounded-[3px] !border-black/50 !px-3 !text-[13px] !font-normal normal-case"
      />

      <div>
        <p className="mb-1 text-[12px] font-bold uppercase leading-[16px] text-black">Date range</p>
        <div className="grid grid-cols-2 gap-2">
          <InputField
            name="eventDateFrom"
            type="date"
            aria-label="Start date"
            value={values.dateFrom}
            onChange={(event) => onChange({ ...values, dateFrom: event.target.value })}
            density="compact"
            containerClassName="!h-10 !rounded-[3px] !border-black/50"
            className="!px-2 !text-[12px] normal-case"
          />
          <InputField
            name="eventDateTo"
            type="date"
            aria-label="End date"
            value={values.dateTo}
            onChange={(event) => onChange({ ...values, dateTo: event.target.value })}
            density="compact"
            containerClassName="!h-10 !rounded-[3px] !border-black/50"
            className="!px-2 !text-[12px] normal-case"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onClear}
          disabled={!hasActiveEventFilters(values)}
          className="h-[34px] cursor-pointer rounded-[3px] border border-black/60 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.06em] text-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export function EventFilterButton({
  active,
  open,
  onClick,
}: {
  active?: boolean;
  open?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filter events"
      aria-expanded={open}
      className={`cursor-pointer flex h-[38px] w-[38px] shrink-0 items-center justify-center border transition ${
        open || active
          ? "border-black bg-black text-white"
          : "border-black/35 bg-white text-black hover:border-black"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2 3.5h12M4 8h8M6 12.5h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
