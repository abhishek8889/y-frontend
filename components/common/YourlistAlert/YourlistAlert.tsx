"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import type { YourlistAlertProps } from "./types";

export function YourlistAlert({
  isOpen,
  onClose,
  title,
  message,
  icon,
  children,
  variant = "default",
  showFooter = true,
  primaryButtonLabel,
  onPrimaryClick,
  secondaryButtonLabel,
  onSecondaryClick,
  isSubmitting = false,
  footer,
  className = "",
  panelClassName = "",
}: YourlistAlertProps) {
  const titleId = useId();
  const descriptionId = useId();

  const hasPrimary = Boolean(primaryButtonLabel && onPrimaryClick);
  const hasSecondary = Boolean(secondaryButtonLabel && onSecondaryClick);
  const hasDefaultFooterButtons = hasPrimary || hasSecondary;
  const renderFooter =
    showFooter && (footer != null || hasDefaultFooterButtons);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      data-variant={variant}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-3 py-4 sm:px-4 ${className}`.trim()}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message || children ? descriptionId : undefined}
        className={[
          "flex max-h-[min(100vh-2rem,720px)] w-full max-w-[560px] flex-col overflow-hidden border border-black bg-white",
          panelClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <header className="relative flex shrink-0 items-center justify-center border-b border-black px-12 py-5">
          <h2
            id={titleId}
            className="text-center text-[16px] font-bold uppercase leading-[22px] tracking-[0.02em] text-black sm:text-[18px] sm:leading-[24px]"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[26px] leading-none text-black transition hover:bg-black/5 disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div
          id={descriptionId}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-10 sm:px-10 sm:py-12"
        >
          {icon ? (
            <div className="mb-6 flex items-center justify-center sm:mb-8">{icon}</div>
          ) : null}

          {message ? (
            <p className="text-center text-[15px] font-normal leading-[22px] text-black sm:text-[16px] sm:leading-[24px]">
              {message}
            </p>
          ) : null}

          {children ? <div className={message ? "mt-4" : undefined}>{children}</div> : null}
        </div>

        {renderFooter ? (
          <footer className="shrink-0 border-t border-black px-4 py-4 sm:px-5">
            {footer != null ? (
              footer
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                {hasSecondary ? (
                  <Button
                    type="button"
                    onClick={onSecondaryClick}
                    disabled={isSubmitting}
                    className={[
                      "h-[46px] rounded-[4px] border border-black bg-white px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-black transition hover:bg-black/5 disabled:opacity-60 sm:text-[13px]",
                      hasPrimary ? "sm:flex-1" : "w-full",
                    ].join(" ")}
                  >
                    {secondaryButtonLabel}
                  </Button>
                ) : null}

                {hasPrimary ? (
                  <Button
                    type="button"
                    onClick={onPrimaryClick}
                    disabled={isSubmitting}
                    className={[
                      "h-[46px] rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 disabled:opacity-60 sm:text-[13px]",
                      hasSecondary ? "sm:flex-1" : "w-full",
                    ].join(" ")}
                  >
                    {isSubmitting ? "Please wait..." : primaryButtonLabel}
                  </Button>
                ) : null}
              </div>
            )}
          </footer>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}
