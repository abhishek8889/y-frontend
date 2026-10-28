"use client";

import type { CSSProperties, ReactNode } from "react";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableProps } from "./types";
import { alignClass, getNestedValue } from "./utils";

export function DataTable<T>({
  columns,
  data,
  getRowId,
  features,
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
  headerBackground,
}: DataTableProps<T>) {
  const enableSearch = features?.search ?? true;
  const enableFilters = features?.filters ?? true;
  const enablePagination = features?.pagination ?? true;
  const enablePageSize = features?.pageSize ?? true;

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
    "overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
    bodyHeightClassName === false ? "" : `${bodyHeightClassName} lg:overflow-y-auto`,
  ]
    .filter(Boolean)
    .join(" ");

  const showPagination =
    enablePagination && Boolean(pagination && onPageChange) && !isEmpty;

  return (
    <div className={`datatable datatable-box ${className}`.trim()}>
      <DataTableToolbar
        search={search}
        filters={filters}
        onFilterChange={onFilterChange}
        toolbarExtra={toolbarExtra}
        enableSearch={enableSearch}
        enableFilters={enableFilters}
      />

      <div className="bg-white">
        <div className={scrollAreaClass}>
          <table
            className="datatable-table"
            style={
              headerBackground
                ? ({ "--od-datatable-header-bg": headerBackground } as CSSProperties)
                : undefined
            }
          >
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((column) => {
                  const isSorted = sorting?.id === column.id;
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      className={`datatable-column-title text-left ${column.headerClassName ?? ""}`.trim()}
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

            <tbody>
              {isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="datatable-column-value text-center text-[#d32f2f]"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : null}

              {!isError && isLoading && data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="datatable-column-value text-center text-black/55"
                  >
                    {loadingMessage}
                  </td>
                </tr>
              ) : null}

              {isEmpty ? (
                <tr>
                  <td colSpan={columns.length} className="datatable-column-value">
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
                    <tr key={rowKey}>
                      {columns.map((column) => {
                        const value = getNestedValue(row, column.accessorKey);
                        const content = column.cell
                          ? column.cell({ row, value, rowIndex })
                          : ((value as ReactNode) ?? "—");

                        return (
                          <td
                            key={column.id}
                            className={`datatable-column-value ${alignClass(column.align)} ${column.className ?? ""}`.trim()}
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

        {showPagination && pagination && onPageChange ? (
          <DataTablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            enablePageSize={enablePageSize}
          />
        ) : null}
      </div>
    </div>
  );
}
