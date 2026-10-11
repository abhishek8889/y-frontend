"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActionMenuItem, ActionMenuProps } from "./types";

type MenuPosition = {
  top: number;
  left: number;
};

function itemClassName(variant: ActionMenuItem["variant"], disabled?: boolean) {
  const base =
    "flex w-full items-center gap-2.5 rounded-[3px] border border-transparent px-2.5 py-2 text-left text-[14px] leading-[18px] transition";

  if (disabled) {
    return `${base} cursor-not-allowed text-black/35`;
  }

  if (variant === "link") {
    return `${base} text-[#2563eb] underline underline-offset-2 hover:border-black`;
  }

  return `${base} text-black hover:border-black`;
}

export function ActionMenu<T>({
  actions,
  row,
  open: openProp,
  onOpenChange,
  align = "right",
  ariaLabel = "Open actions",
  className = "",
}: ActionMenuProps<T>) {
  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const visibleActions = actions.filter((action) => {
    if (typeof action.hidden === "function") return !action.hidden(row);
    return !action.hidden;
  });

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function updatePosition() {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu?.offsetWidth ?? 196;
    const menuHeight = menu?.offsetHeight ?? 0;
    const gap = 6;

    let left = align === "right" ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);

    let top = rect.bottom + gap;
    if (top + menuHeight > window.innerHeight - 8 && rect.top > menuHeight + gap) {
      top = rect.top - menuHeight - gap;
    }

    setPosition({ top, left });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align, visibleActions.length]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleActionClick(action: ActionMenuItem<T>) {
    if (action.disabled) return;
    action.onClick?.(row);
    setOpen(false);
  }

  const menu =
    mounted && open && position ? (
      createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Actions"
          className="fixed z-[100] min-w-[180px] rounded-[4px] border border-black bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{ top: position.top, left: position.left }}
        >
          {visibleActions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              onClick={() => handleActionClick(action)}
              className={itemClassName(action.variant, action.disabled)}
            >
              {action.icon ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current [&>svg]:h-4 [&>svg]:w-4">
                  {action.icon}
                </span>
              ) : null}
              <span className="whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )
    ) : null;

  return (
    <div className={`relative inline-flex justify-end ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[18px] leading-none text-black transition hover:bg-black/10"
      >
        ⋮
      </button>
      {menu}
    </div>
  );
}
