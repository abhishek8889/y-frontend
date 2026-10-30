"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { clearAuthSession, getAuthUser } from "@/lib/api/authStorage";
import { getUserScope } from "@/lib/auth/roles";
import { AuthScope } from "@/lib/auth/scopes";
import { getDisplayName, type AuthUser } from "@/lib/auth/session";
import { buildSurfaceUrl, defaultPathForSurface, getSurfaceHost } from "@/lib/hosts";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import { WishlistIcon } from "@/components/public/WishlistIcon";
import IconCard, { LOGOUT_ICON, VIEW_TICKETS_ICON } from "@/components/ui/IconCard";

/**
 * Workspaces are derived only from the active JWT `scope`.
 * The backend login/OTP responses return one active scope per token — there is
 * no workspaces list API. Do not invent memberships from hostname or guesswork.
 */
function workspacesForScope(scope: AuthScope | null, host: string) {
  const items: { key: string; label: string; hostLabel: string; href: string }[] = [];

  if (scope === AuthScope.Platform) {
    items.push({
      key: "platform",
      label: "Platform Admin",
      hostLabel: getSurfaceHost("superadmin", host),
      href: buildSurfaceUrl("superadmin", defaultPathForSurface("superadmin"), host),
    });
  }

  if (scope === AuthScope.Organisation) {
    items.push({
      key: "organisation",
      label: "Organiser Dashboard",
      hostLabel: getSurfaceHost("organiser", host),
      href: buildSurfaceUrl("organiser", defaultPathForSurface("organiser"), host),
    });
  }

  return items;
}

/** Outline / border-type user glyph — head circle + shoulders arc, no fill. */
function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5.2 19.2c1.7-3.2 4.2-4.8 6.8-4.8s5.1 1.6 6.8 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M1 1.25 5 5.25 9 1.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8A1.5 1.5 0 0 0 13 12.5V10M9 2h5v5M14 2 7 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PublicAccountMenuProps = {
  /** `button` — outline user icon + “My List” + chevron; `icon` — icon only. */
  variant?: "button" | "icon";
};

export function PublicAccountMenu({ variant = "button" }: PublicAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [host, setHost] = useState("localhost");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUser(getAuthUser());
    setHost(window.location.host);
  }, []);

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

  const scope = getUserScope(user);
  const workspaces = useMemo(() => workspacesForScope(scope, host), [scope, host]);
  const displayName = getDisplayName(user);

  function handleLogout() {
    setOpen(false);
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/");
  }

  return (
    <div className="relative inline-flex h-full items-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label="My List"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={
          variant === "button"
            ? "flex h-7 cursor-pointer items-center gap-2 border-0 bg-transparent px-0 text-[12px] uppercase leading-[15.6px] tracking-[0.36px] text-black transition hover:opacity-60"
            : "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black transition hover:bg-black/5"
        }
      >
        {variant === "button" ? (
          <>
            <UserIcon className="h-[18px] w-[18px] shrink-0" />
            <span>My List</span>
            <ChevronIcon open={open} />
          </>
        ) : (
          <UserIcon />
        )}
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-[100] -mt-px w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-none border border-black bg-white text-black shadow-none"
        >
          <div className="flex items-center gap-3 border-b border-[#d8d8d8] px-4 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black text-[12px] font-body-bold uppercase">
              {(displayName || "A").charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-body-bold truncate text-[14px] leading-5">{displayName}</p>
              <p className="text-[12px] leading-4 text-black/50">Signed in</p>
            </div>
          </div>

          <div className="border-b border-[#d8d8d8] py-1">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.04]"
            >
              <UserIcon className="h-4 w-4" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-5">Account</span>
                <span className="block text-[12px] leading-4 text-black/50">
                  Name, email, and phone
                </span>
              </span>
              <span className="text-black/40" aria-hidden="true">
                ›
              </span>
            </Link>
            <Link
              href="/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.04]"
            >
              <IconCard name={VIEW_TICKETS_ICON} className="h-4 w-4 [&_path]:stroke-black" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-5">My orders</span>
                <span className="block text-[12px] leading-4 text-black/50">
                  Orders, items, and tickets
                </span>
              </span>
              <span className="text-black/40" aria-hidden="true">
                ›
              </span>
            </Link>
            <Link
              href="/wishlist"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.04]"
            >
              <WishlistIcon size={14} className="text-black" />
              <span className="min-w-0 flex-1 text-[14px] leading-5">My Favourites</span>
              <span className="text-black/40" aria-hidden="true">
                ›
              </span>
            </Link>
          </div>

          {workspaces.length > 0 ? (
            <div className="border-b border-[#d8d8d8] py-2">
              <p className="px-4 pb-1.5">
                <span className="font-heading text-[12px] leading-4">Your workspaces</span>
              </p>
              {workspaces.map((workspace) => (
                <a
                  key={workspace.key}
                  href={workspace.href}
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.04]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black text-[12px] font-body-bold">
                    {workspace.key === "platform" ? "P" : "O"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] leading-5">{workspace.label}</span>
                    <span className="block truncate text-[12px] leading-4 text-black/50">
                      {workspace.hostLabel}
                    </span>
                  </span>
                  <ExternalIcon className="text-black/45" />
                </a>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[14px] leading-5 transition hover:bg-black/[0.04]"
          >
            <IconCard name={LOGOUT_ICON} className="h-4 w-4 [&_path]:stroke-black" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
