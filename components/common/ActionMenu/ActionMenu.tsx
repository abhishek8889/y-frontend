"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActionMenuItem, ActionMenuProps } from "./types";

type MenuPosition = {
  top: number;
  left: number;
};

const VIEWPORT_PADDING = 8;
const TRIGGER_GAP = 6;

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

function computeMenuPosition(
  trigger: DOMRect,
  menuWidth: number,
  menuHeight: number,
  align: "left" | "right",
): MenuPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = align === "right" ? trigger.right - menuWidth : trigger.left;
  left = Math.min(
    Math.max(VIEWPORT_PADDING, left),
    Math.max(VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING),
  );

  const spaceBelow = viewportHeight - trigger.bottom - TRIGGER_GAP - VIEWPORT_PADDING;
  const spaceAbove = trigger.top - TRIGGER_GAP - VIEWPORT_PADDING;
  const fitsBelow = menuHeight <= spaceBelow;
  const fitsAbove = menuHeight <= spaceAbove;

  // Prefer below; flip above when there isn't enough room underneath.
  const openAbove = !fitsBelow && (fitsAbove || spaceAbove > spaceBelow);

  let top = openAbove ? trigger.top - menuHeight - TRIGGER_GAP : trigger.bottom + TRIGGER_GAP;

  // Keep the full menu inside the viewport when neither side fits perfectly.
  top = Math.min(
    Math.max(VIEWPORT_PADDING, top),
    Math.max(VIEWPORT_PADDING, viewportHeight - menuHeight - VIEWPORT_PADDING),
  );

  return { top, left };
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
    if (!trigger || !menu) return;

    const next = computeMenuPosition(
      trigger.getBoundingClientRect(),
      menu.offsetWidth,
      menu.offsetHeight,
      align,
    );
    setPosition(next);
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

    const menu = menuRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && menu
        ? new ResizeObserver(() => {
            updatePosition();
          })
        : null;
    if (menu && resizeObserver) resizeObserver.observe(menu);

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      resizeObserver?.disconnect();
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

  // Render while open even before position is known so we can measure real menu size,
  // then flip above/below based on available viewport space.
  const menu =
    mounted && open ? (
      createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Actions"
          className="fixed z-[100] min-w-[180px] rounded-[4px] border border-black bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            visibility: position ? "visible" : "hidden",
            pointerEvents: position ? "auto" : "none",
          }}
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
