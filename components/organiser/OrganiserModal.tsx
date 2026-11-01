"use client";

import { useEffect, type ReactNode } from "react";

export type OrganiserModalSize = "default" | "lg" | "xl";

type OrganiserModalProps = {
  open: boolean;
  children: ReactNode;
  /** Accessible title for the dialog. */
  titleId?: string;
  /** Show top-right close control. */
  showClose?: boolean;
  onClose?: () => void;
  /**
   * Optional width preset. Only applies a modifier class when not `default`,
   * so other modals keep the base `max-width: 500px`.
   */
  size?: OrganiserModalSize;
  /**
   * Extra classes on the white panel only (e.g. `sites-dns-modal-panel`).
   * Use this for per-modal styles so shared modal chrome stays untouched.
   */
  panelClassName?: string;
  /** Extra classes on the overlay root. */
  className?: string;
};

const SIZE_CLASS: Record<OrganiserModalSize, string> = {
  default: "",
  lg: "organiser-modal__panel--lg",
  xl: "organiser-modal__panel--xl",
};

/**
 * Shared organiser dashboard modal chrome: dimmed overlay + white panel.
 * Pass modal body as children (title, copy, CTA, etc.).
 * Size / panelClassName are opt-in — they never change other modals' defaults.
 */
export function OrganiserModal({
  open,
  children,
  titleId,
  showClose = false,
  onClose,
  size = "default",
  panelClassName = "",
  className = "",
}: OrganiserModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={["organiser-modal", className].filter(Boolean).join(" ")}
      role="presentation"
      onClick={(event) => {
        if (onClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "organiser-modal__panel",
          SIZE_CLASS[size],
          panelClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showClose && onClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="organiser-modal__close"
          >
            ×
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
