import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type DataTableCellContext<T> = {
  row: T;
  value: unknown;
  rowIndex: number;
};

/**
 * Column tooltip config.
 *
 * - `true` → tip uses the accessor value (stringified)
 * - `string` → static tip text
 * - `fn` → dynamic tip text from the row
 * - `{ content, label? }` → same, with optional aria-label
 *
 * Tip is omitted when resolved content is empty.
 */
export type DataTableColumnTooltip<T> =
  | boolean
  | string
  | ((ctx: DataTableCellContext<T>) => string | null | undefined)
  | {
      content?:
        | boolean
        | string
        | ((ctx: DataTableCellContext<T>) => string | null | undefined);
      label?: string | ((ctx: DataTableCellContext<T>) => string);
    };

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Dot-path into the row, e.g. `venue_type.name` */
  accessorKey?: string;
  /** Custom cell renderer. Takes precedence over accessorKey. */
  cell?: (ctx: DataTableCellContext<T>) => ReactNode;
  /**
   * Show an info tip beside the cell value.
   * Portaled above the table so it is not clipped by overflow.
   */
  tooltip?: DataTableColumnTooltip<T>;
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

export type DataTableEmptyState = {
  title: string;
  subtitle?: string;
  showButton?: boolean;
  buttonLabel?: string;
  onButtonClick?: () => void;
};

/**
 * Toggle optional DataTable chrome. Defaults keep previous behaviour
 * (search/filters/pagination show when their data props are provided).
 */
export type DataTableFeatures = {
  /** Show search input when `search` prop is set. Default true. */
  search?: boolean;
  /** Show filter selects when `filters` prop is set. Default true. */
  filters?: boolean;
  /** Show pagination footer when `pagination` is set. Default true. */
  pagination?: boolean;
  /** Show per-page select inside pagination. Default true when `onPageSizeChange` is set. */
  pageSize?: boolean;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string | number;

  /** Feature toggles for search / filters / pagination / per_page. */
  features?: DataTableFeatures;

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
  /** Simple empty text fallback when `emptyState` is not provided. */
  emptyMessage?: string;
  /**
   * Rich empty state (title / subtitle / optional CTA).
   * Used when the table has no rows and is not loading/erroring.
   */
  emptyState?: DataTableEmptyState;
  loadingMessage?: string;

  className?: string;
  /**
   * Desktop table body height. Defaults to a fixed viewport-based height
   * with internal scroll. Pass `false` to disable, or a custom class string.
   */
  bodyHeightClassName?: string | false;
  /**
   * Header background color (CSS color). Defaults to white.
   * e.g. `"#EEEEEE"` for light grey product offer tables.
   */
  headerBackground?: string;

  /**
   * Returns one or more `<tr>` nodes inserted after the parent when expanded.
   * Pair with `isRowExpanded`.
   */
  renderExpandedRows?: (ctx: { row: T; rowIndex: number }) => ReactNode;
  /** Whether expanded rows for this parent are visible. */
  isRowExpanded?: (row: T, rowIndex: number) => boolean;
};
