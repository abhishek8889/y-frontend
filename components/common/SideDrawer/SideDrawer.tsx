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
    <div className={`fixed inset-0 z-50 flex justify-end bg-black/40 ${className}`.trim()}>
      <button
        type="button"
        aria-label="Close drawer overlay"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-drawer-title"
        className={[
          "relative z-10 flex h-full w-full max-w-[560px] flex-col border-l border-black bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)]",
          panelClassName,
        ].join(" ")}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {logo ? <div className="shrink-0">{logo}</div> : null}
            <div className="min-w-0">
              <h2
                id="side-drawer-title"
                className="font-heading text-[18px] font-bold uppercase leading-[26px] text-black sm:text-[20px]"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-[24px] leading-none text-black transition hover:bg-black/5"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {renderFooter ? (
          <footer className="flex shrink-0 items-center gap-3 border-t border-black px-5 py-4">
            {showCancel ? (
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={[
                  "h-[46px] cursor-pointer rounded-[4px] border border-black bg-white px-5 text-[12px] font-normal uppercase leading-none text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60",
                  showSubmit ? "flex-1" : "w-full",
                ].join(" ")}
              >
                {cancelLabel}
              </Button>
            ) : null}

            {showSubmit ? (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className={[
                  "h-[46px] cursor-pointer rounded-[4px] border border-black bg-black px-5 text-[12px] font-normal uppercase leading-none text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
                  showCancel ? "flex-1" : "w-full",
                ].join(" ")}
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
