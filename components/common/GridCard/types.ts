import type { ReactNode } from "react";

export type GridCardItem = {
  /** Stable key for React lists */
  id?: string;
  /** Metric label, e.g. "Total venues" */
  label: ReactNode;
  /** Primary value, e.g. "24" or "£84,290" */
  value: ReactNode;
  /** Supporting text under the value (trend, date, helper) */
  description?: ReactNode;
  /** Optional leading icon / custom mark */
  icon?: ReactNode;
  /** Optional status dot next to the label */
  indicatorColor?: string;
};

export type GridCardColumns = 1 | 2 | 3 | 4 | 5 | 6;

export type GridCardProps = {
  /** Config-driven overview metrics (like Offthetree `listItems`) */
  items: GridCardItem[];
  /**
   * Desktop column count (max 6).
   * When omitted, uses `items.length` capped at 6 so cards fill the row equally.
   */
  columns?: GridCardColumns;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
};
