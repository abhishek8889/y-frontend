import type { ReactNode } from "react";

export type YourlistAlertVariant = "default" | "success" | "warning" | "error" | "info";

export type YourlistAlertProps = {
  isOpen: boolean;
  onClose: () => void;

  title: string;
  message?: string;
  icon?: ReactNode;
  children?: ReactNode;

  /** Visual hint only — does not change layout or hardcode icons/messages. */
  variant?: YourlistAlertVariant;

  showFooter?: boolean;

  primaryButtonLabel?: string;
  onPrimaryClick?: () => void;

  secondaryButtonLabel?: string;
  onSecondaryClick?: () => void;

  /** Disables footer buttons while an action is in flight. */
  isSubmitting?: boolean;

  /** Replaces the default footer button row when provided. */
  footer?: ReactNode;

  className?: string;
  panelClassName?: string;
};
