"use client";

import { useEffect, type ReactNode } from "react";
import IconCard, { CLOSE_ICON } from "@/components/ui/IconCard";

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
  panelClassName = "max-w-[500px]",
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
      className="organiser-modal fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      role="presentation"
      onClick={(event) => {
        if (onClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`organiser-modal__panel relative w-full overflow-hidden rounded-[4px] bg-white ${panelClassName}`.trim()}
      >
        {showClose && onClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="organiser-modal__close absolute right-4 top-4 z-[2] flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-black/15 bg-white text-black/70 transition hover:bg-black/[0.04] hover:text-black"
          >
            <IconCard name={CLOSE_ICON} className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
