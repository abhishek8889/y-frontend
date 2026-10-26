"use client";

import { SelectField } from "@/components/ui/SelectField";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  /** Show rows-per-page select. Default true when `onPageSizeChange` is provided. */
  enablePageSize?: boolean;
};

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  enablePageSize = true,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const showPageSize = enablePageSize && Boolean(onPageSizeChange);

  const pageSizeSelectOptions = pageSizeOptions.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  return (
    <div className="datatable-pagination flex flex-col gap-3 border-t border-black px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-normal leading-5 text-[#6f6e69] sm:text-[14px]">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {showPageSize ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-normal uppercase text-black sm:text-[14px]">Rows</span>
            <SelectField
              name="datatable-page-size"
              aria-label="Rows per page"
              value={String(pageSize)}
              options={pageSizeSelectOptions}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              density="compact"
              wrapperClassName="!gap-0 w-[88px]"
              containerClassName="!h-10 !rounded-none !border-black"
              className="!h-10 !rounded-none !border-black text-[14px] font-normal uppercase text-black"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className="h-10 min-w-[64px] cursor-pointer border border-black bg-white px-3 text-[13px] font-normal uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black sm:min-w-[72px] sm:text-[14px]"
          >
            Prev
          </button>
          <span className="min-w-[56px] text-center text-[13px] font-normal uppercase text-black sm:min-w-[72px] sm:text-[14px]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className="h-10 min-w-[64px] cursor-pointer border border-black bg-white px-3 text-[13px] font-normal uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black sm:min-w-[72px] sm:text-[14px]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
