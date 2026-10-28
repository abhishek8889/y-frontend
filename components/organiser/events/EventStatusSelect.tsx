"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EventLifecycleStatus } from "@/apis/events/eventsApi";
import { StatusBadge } from "@/components/common";
import { formatStatusLabel, statusBgClass, statusTextClass } from "@/lib/ui/statusColors";

export type EventStatusOption = {
  value: EventLifecycleStatus;
  label: string;
};

type EventStatusSelectProps = {
  value: EventLifecycleStatus;
  options: EventStatusOption[];
  disabled?: boolean;
  onChange: (status: EventLifecycleStatus) => void;
  "aria-label"?: string;
  className?: string;
};

export function EventStatusSelect({
  value,
  options,
  disabled = false,
  onChange,
  "aria-label": ariaLabel = "Event status",
  className = "",
}: EventStatusSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function placeMenu() {
      const trigger = rootRef.current?.getBoundingClientRect();
      const menu = menuRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const menuWidth = menu?.width ?? 160;
      const menuHeight = menu?.height ?? 180;
      const left = Math.min(
        Math.max(8, trigger.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );
      const spaceBelow = window.innerHeight - trigger.bottom - 8;
      const openAbove = spaceBelow < menuHeight && trigger.top > spaceBelow;
      const top = openAbove ? trigger.top - menuHeight - 6 : trigger.bottom + 6;
      setMenuStyle({ top, left });
    }

    placeMenu();
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`event-status-select ${className}`.trim()}>
      <button
        type="button"
        className={`event-status-select-trigger ${statusTextClass(value)}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
      >
        <StatusBadge status={value} className="event-status-select-badge" />
        <svg
          className={`event-status-select-chevron ${open ? "event-status-select-chevron-open" : ""}`.trim()}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.664062 0.664062L4.66406 4.66406L8.66406 0.664062"
            stroke="currentColor"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {mounted && open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              className="event-status-select-menu"
              style={{ top: menuStyle.top, left: menuStyle.left }}
            >
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={[
                      "event-status-select-option",
                      selected ? "event-status-select-option-active" : "",
                      statusTextClass(option.value),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setOpen(false);
                      if (option.value !== value) onChange(option.value);
                    }}
                  >
                    <span
                      className={`event-status-select-option-dot ${statusBgClass(option.value)}`}
                      aria-hidden="true"
                    />
                    <span>{option.label || formatStatusLabel(option.value)}</span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
