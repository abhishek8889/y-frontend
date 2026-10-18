"use client";

import type { ReactNode } from "react";
import { DataTableEmpty } from "./DataTableEmpty";
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
  emptyState,
  loadingMessage = "Loading...",
  className = "",
  bodyHeightClassName = "lg:h-[min(480px,calc(100vh-420px))]",
}: DataTableProps<T>) {
  const isEmpty = !isError && !isLoading && data.length === 0;

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

      <div className="bg-white">
        <div className={scrollAreaClass}>
          <table className="w-full min-w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-black/20 text-[14px] font-bold uppercase text-black">
                {columns.map((column) => {
                  const isSorted = sorting?.id === column.id;
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      className={`bg-white px-3 py-4 text-[14px] font-bold uppercase text-black ${alignClass(column.align)} ${column.headerClassName ?? ""}`.trim()}
                    >
                      {column.sortable && onSortingChange ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.id, column.sortable)}
                          className="inline-flex items-center gap-1 uppercase transition hover:opacity-70"
                        >
                          {column.header}
                          <span aria-hidden="true" className="text-[10px] text-black/50">
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

            <tbody className="divide-y divide-black/20">
              {isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-[12px] text-[#d32f2f]"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : null}

              {!isError && isLoading && data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-[12px] text-black/55"
                  >
                    {loadingMessage}
                  </td>
                </tr>
              ) : null}

              {isEmpty ? (
                <tr>
                  <td colSpan={columns.length} className="px-3">
                    <DataTableEmpty
                      title={emptyState?.title ?? emptyMessage}
                      subtitle={emptyState?.subtitle}
                      showButton={emptyState?.showButton}
                      buttonLabel={emptyState?.buttonLabel}
                      onButtonClick={emptyState?.onButtonClick}
                    />
                  </td>
                </tr>
              ) : null}

              {!isError &&
                data.map((row, rowIndex) => {
                  const rowKey = getRowId?.(row, rowIndex) ?? rowIndex;

                  return (
                    <tr key={rowKey} className="text-[16px] text-black">
                      {columns.map((column) => {
                        const value = getNestedValue(row, column.accessorKey);
                        const content = column.cell
                          ? column.cell({ row, value, rowIndex })
                          : ((value as ReactNode) ?? "—");

                        return (
                          <td
                            key={column.id}
                            className={`px-2.5 py-4 text-[16px] leading-[20px] text-black ${alignClass(column.align)} ${column.className ?? ""}`.trim()}
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

        {pagination && onPageChange && !isEmpty ? (
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
