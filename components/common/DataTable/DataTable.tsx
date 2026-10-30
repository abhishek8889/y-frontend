"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTableInfoTip } from "./DataTableInfoTip";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableProps } from "./types";
import { alignClass, getNestedValue, resolveColumnTooltip } from "./utils";

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
  renderExpandedRows,
  isRowExpanded,
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
                      className={`datatable-column-title ${alignClass(column.align)} ${column.headerClassName ?? ""}`.trim()}
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
                  const expanded = Boolean(isRowExpanded?.(row, rowIndex));

                  return (
                    <Fragment key={rowKey}>
                      <tr className={expanded ? "datatable-row-expanded" : undefined}>
                        {columns.map((column) => {
                          const value = getNestedValue(row, column.accessorKey);
                          const cellCtx = { row, value, rowIndex };
                          const content = column.cell
                            ? column.cell(cellCtx)
                            : ((value as ReactNode) ?? "—");
                          const tip = resolveColumnTooltip(column.tooltip, cellCtx);

                          return (
                            <td
                              key={column.id}
                              className={`datatable-column-value ${alignClass(column.align)} ${column.className ?? ""}`.trim()}
                            >
                              {tip ? (
                                <div className="datatable-cell-with-tip">
                                  <div className="datatable-cell-with-tip__value">
                                    {content}
                                  </div>
                                  <DataTableInfoTip
                                    label={tip.label}
                                    text={tip.text}
                                  />
                                </div>
                              ) : (
                                content
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {expanded && renderExpandedRows
                        ? renderExpandedRows({ row, rowIndex })
                        : null}
                    </Fragment>
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
