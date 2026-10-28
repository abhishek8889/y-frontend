"use client";

import { useEffect, type ReactNode } from "react";

type OrganiserModalProps = {
  open: boolean;
  children: ReactNode;
  /** Accessible title for the dialog. */
  titleId?: string;
  /** Show top-right close control. */
  showClose?: boolean;
  onClose?: () => void;
  /** Extra classes on the white panel. */
  panelClassName?: string;
};

/**
 * Shared organiser dashboard modal chrome: dimmed overlay + white panel.
 * Pass modal body as children (title, copy, CTA, etc.).
 */
export function OrganiserModal({
  open,
  children,
  titleId,
  showClose = false,
  onClose,
  panelClassName = "",
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
      className="organiser-modal"
      role="presentation"
      onClick={(event) => {
        if (onClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={["organiser-modal__panel", panelClassName].filter(Boolean).join(" ")}
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
