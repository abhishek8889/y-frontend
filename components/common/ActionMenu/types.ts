import type { ReactNode } from "react";

export type ActionMenuItemVariant = "default" | "link" | "danger";

export type ActionMenuItem<T = unknown> = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: (row: T) => void;
  disabled?: boolean;
  /** Hide this item; pass a predicate to decide per row. */
  hidden?: boolean | ((row: T) => boolean);
  variant?: ActionMenuItemVariant;
};

export type ActionMenuProps<T = unknown> = {
  actions: ActionMenuItem<T>[];
  row: T;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "left" | "right";
  ariaLabel?: string;
  className?: string;
};
