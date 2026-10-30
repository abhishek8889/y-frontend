"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DataTableInfoTipProps = {
  label: string;
  text: string;
};

export function DataTableInfoTip({ label, text }: DataTableInfoTipProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  function placeTip() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;

    placeTip();

    function handleReposition() {
      placeTip();
    }

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  if (!text.trim()) return null;

  return (
    <>
      <span className="datatable-info-tip">
        <button
          ref={buttonRef}
          type="button"
          className="datatable-info-tip__btn"
          aria-label={label}
          aria-expanded={open}
          onMouseEnter={() => {
            placeTip();
            setOpen(true);
          }}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => {
            placeTip();
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
        >
          i
        </button>
      </span>
      {open
        ? createPortal(
            <span
              className="datatable-info-tip__bubble"
              role="tooltip"
              style={{ top: coords.top, left: coords.left }}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
