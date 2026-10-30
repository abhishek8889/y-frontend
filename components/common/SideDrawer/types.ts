import type { ReactNode } from "react";

export type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;

  title: ReactNode;
  subtitle?: ReactNode;
  logo?: ReactNode;
  /** Optional actions rendered in the header before the close control. */
  headerActions?: ReactNode;

  children: ReactNode;

  showFooter?: boolean;
  showCancelButton?: boolean;
  showSubmitButton?: boolean;

  cancelLabel?: string;
  onCancel?: () => void;

  submitLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;

  /** Optional class on the outer drawer root */
  className?: string;
  /** Optional wider/narrower panel; default max-width comes from CSS */
  panelClassName?: string;
};
