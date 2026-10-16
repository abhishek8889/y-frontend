"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { clearAuthSession } from "@/lib/api/authStorage";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import IconCard, { LOGOUT_ICON, SETTINGS_ICON, VIEW_ORDERS_ICON } from "@/components/ui/IconCard";

const menuItems = [
  { key: "account", label: "My Account", href: "/account" },
  { key: "orders", label: "Orders", href: "/orders" },
  { key: "wishlist", label: "Wishlist", href: "/wishlist" },
  { key: "settings", label: "Setting", href: "/settings" },
] as const;

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 18.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PublicAccountMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const dispatch = useAppDispatch();

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
  }, [open]);

  function handleLogout() {
    setOpen(false);
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/");
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black transition hover:bg-black/5"
      >
        <UserIcon />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[180px] rounded-[4px] border border-black bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-2 text-left text-[14px] leading-[18px] text-black transition hover:bg-black/[0.04]"
            >
              {item.key === "orders" ? (
                <IconCard name={VIEW_ORDERS_ICON} className="h-4 w-4" />
              ) : item.key === "settings" ? (
                <IconCard name={SETTINGS_ICON} className="h-4 w-4" />
              ) : null}
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[3px] px-2.5 py-2 text-left text-[14px] leading-[18px] text-black transition hover:bg-black/[0.04]"
          >
            <IconCard name={LOGOUT_ICON} className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
