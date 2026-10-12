"use client";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-black/20 px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] text-black/70">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-[14px] font-bold uppercase text-black">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-[40px] min-w-[72px] border border-black bg-white px-2 text-[14px] font-bold uppercase text-black outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className="h-[40px] min-w-[72px] border border-black bg-white px-3 text-[14px] font-bold uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
          >
            Prev
          </button>
          <span className="min-w-[72px] text-center text-[14px] font-bold uppercase text-black">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className="h-[40px] min-w-[72px] border border-black bg-white px-3 text-[14px] font-bold uppercase text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
