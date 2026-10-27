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
    <div className="datatable-pagination">
      <p className="datatable-pagination-meta">
        Showing {from}-{to} of {total}
      </p>

      <div className="datatable-pagination-buttons">
        {showPageSize ? (
          <div className="flex items-center gap-2">
            <span className="datatable-pagination-label">Rows</span>
            <SelectField
              name="datatable-page-size"
              aria-label="Rows per page"
              value={String(pageSize)}
              options={pageSizeSelectOptions}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              density="compact"
              wrapperClassName="datatable-filter-option !gap-0 w-[88px]"
              containerClassName="input-box input-box-compact"
              className="w-full text-[12px] font-normal uppercase text-black"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className="datatable-pagination-btn"
          >
            Prev
          </button>
          <span className="datatable-pagination-page">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className="datatable-pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
