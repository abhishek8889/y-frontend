"use client";

import type { ReactNode } from "react";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableProps } from "./types";
import { alignClass, getNestedValue } from "./utils";

export function DataTable<T>({
  columns,
  data,
  getRowId,
  search,
  filters,
  onFilterChange,
  toolbarExtra,
  sorting,
  onSortingChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  isLoading = false,
  isError = false,
  errorMessage = "Unable to load data.",
  emptyMessage = "No data available.",
  loadingMessage = "Loading...",
  className = "",
  bodyHeightClassName = "lg:h-[min(480px,calc(100vh-420px))]",
}: DataTableProps<T>) {
  function handleSort(columnId: string, sortable?: boolean) {
    if (!sortable || !onSortingChange) return;

    if (sorting?.id === columnId) {
      onSortingChange({
        id: columnId,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      });
      return;
    }

    onSortingChange({ id: columnId, direction: "asc" });
  }

  const scrollAreaClass = [
    "overflow-x-auto",
    bodyHeightClassName === false ? "" : `${bodyHeightClassName} lg:overflow-y-auto`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <DataTableToolbar
        search={search}
        filters={filters}
        onFilterChange={onFilterChange}
        toolbarExtra={toolbarExtra}
      />

      <div className="overflow-hidden border border-black/100 bg-white">
        <div className={scrollAreaClass}>
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-black/30 bg-white">
                {columns.map((column) => {
                  const isSorted = sorting?.id === column.id;
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      className={`bg-white px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black/60 ${alignClass(column.align)} ${column.headerClassName ?? ""}`.trim()}
                    >
                      {column.sortable && onSortingChange ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.id, column.sortable)}
                          className="inline-flex items-center gap-1 uppercase tracking-[0.12em] transition hover:text-black"
                        >
                          {column.header}
                          <span aria-hidden="true" className="text-[10px] text-black/40">
                            {isSorted ? (sorting?.direction === "asc" ? "↑" : "↓") : "↕"}
                          </span>
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-[13px] text-[#d32f2f]"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : null}

              {!isError && isLoading && data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-[13px] text-black/50"
                  >
                    {loadingMessage}
                  </td>
                </tr>
              ) : null}

              {!isError && !isLoading && data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-[13px] text-black/50"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : null}

              {!isError &&
                data.map((row, rowIndex) => {
                  const rowKey = getRowId?.(row, rowIndex) ?? rowIndex;

                  return (
                    <tr key={rowKey} className="border-b border-black/20 last:border-b-0">
                      {columns.map((column) => {
                        const value = getNestedValue(row, column.accessorKey);
                        const content = column.cell
                          ? column.cell({ row, value, rowIndex })
                          : ((value as ReactNode) ?? "—");

                        return (
                          <td
                            key={column.id}
                            className={`px-4 py-3 text-[14px] leading-[20px] text-black ${alignClass(column.align)} ${column.className ?? ""}`.trim()}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {pagination && onPageChange ? (
          <DataTablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        ) : null}
      </div>
    </div>
  );
}
