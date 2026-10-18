import type { ReactNode } from "react";

export type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;

  title: string;
  subtitle?: string;
  logo?: ReactNode;

  children: ReactNode;

  showFooter?: boolean;
  showCancelButton?: boolean;
  showSubmitButton?: boolean;

  cancelLabel?: string;
  onCancel?: () => void;

  submitLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;

  /** Optional class on the drawer panel */
  className?: string;
  /** Optional wider panel; default max-w-[560px] */
  panelClassName?: string;
};
