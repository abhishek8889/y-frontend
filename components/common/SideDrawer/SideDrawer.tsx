"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { SideDrawerProps } from "./types";

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  logo,
  children,
  showFooter = true,
  showCancelButton = true,
  showSubmitButton = true,
  cancelLabel = "Cancel",
  onCancel,
  submitLabel = "Save",
  onSubmit,
  isSubmitting = false,
  className = "",
  panelClassName = "",
}: SideDrawerProps) {
  const showCancel = showFooter && showCancelButton;
  const showSubmit = showFooter && showSubmitButton;
  const renderFooter = showCancel || showSubmit;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCancel() {
    if (onCancel) onCancel();
    else onClose();
  }

  return (
    <div className={`side-drawer ${className}`.trim()}>
      <button
        type="button"
        aria-label="Close drawer overlay"
        className="side-drawer-overlay"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-drawer-title"
        className={`side-drawer-panel ${panelClassName}`.trim()}
      >
        <header className="side-drawer-header">
          <div className="side-drawer-header-main">
            {logo ? <div className="shrink-0">{logo}</div> : null}
            <div className="min-w-0">
              <h2 id="side-drawer-title" className="side-drawer-title">
                {title}
              </h2>
              {subtitle ? <p className="side-drawer-subtitle">{subtitle}</p> : null}
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="side-drawer-close"
          >
            ×
          </button>
        </header>

        <div className="side-drawer-body">{children}</div>

        {renderFooter ? (
          <footer className="side-drawer-footer">
            {showCancel ? (
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="form-footer-btn form-footer-btn-secondary"
              >
                {cancelLabel}
              </Button>
            ) : null}

            {showSubmit ? (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="form-footer-btn form-footer-btn-primary"
              >
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            ) : null}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
