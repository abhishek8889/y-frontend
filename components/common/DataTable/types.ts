import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Dot-path into the row, e.g. `venue_type.name` */
  accessorKey?: string;
  /** Custom cell renderer. Takes precedence over accessorKey. */
  cell?: (ctx: { row: T; value: unknown; rowIndex: number }) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
};

export type DataTableFilterOption = {
  value: string;
  label: string;
};

export type DataTableFilter = {
  key: string;
  label?: string;
  type: "select";
  options: DataTableFilterOption[];
  /** Controlled value from the page */
  value?: string;
  className?: string;
};

export type DataTableSortState = {
  id: string;
  direction: SortDirection;
} | null;

export type DataTablePaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string | number;

  /** Toolbar */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: DataTableFilter[];
  onFilterChange?: (key: string, value: string) => void;
  toolbarExtra?: ReactNode;

  /** Sorting (controlled by page) */
  sorting?: DataTableSortState;
  onSortingChange?: (next: DataTableSortState) => void;

  /** Pagination (controlled by page). Omit to hide pagination. */
  pagination?: DataTablePaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];

  /** States */
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  loadingMessage?: string;

  className?: string;
  /**
   * Desktop table body height. Defaults to a fixed viewport-based height
   * with internal scroll. Pass `false` to disable, or a custom class string.
   */
  bodyHeightClassName?: string | false;
};
