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

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function HeartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
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
  /** Use black ACCOUNT button trigger (design) vs icon-only. */
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
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={
          variant === "button"
            ? "flex h-[28px] cursor-pointer items-center justify-center bg-black px-5 text-[9px] font-medium uppercase text-white transition hover:bg-black/75"
            : "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black transition hover:bg-black/5"
        }
      >
        {variant === "button" ? "Account" : <UserIcon />}
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[280px] overflow-hidden rounded-[4px] border border-black bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3 border-b border-black/20 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-black">
              <UserIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium leading-5">{displayName}</p>
              <p className="text-[12px] leading-4 text-black/50">Signed in</p>
            </div>
          </div>

          <div className="border-b border-black/20 py-1.5">
            <Link
              href="/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-black/5"
            >
              <IconCard name={VIEW_TICKETS_ICON} className="h-4 w-4 [&_path]:stroke-black" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-5">My Tickets</span>
                <span className="block text-[12px] leading-4 text-black/50">
                  View bookings and tickets
                </span>
              </span>
              <span className="text-black/35" aria-hidden="true">
                ›
              </span>
            </Link>
            <Link
              href="/wishlist"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-black/5"
            >
              <HeartIcon className="h-4 w-4 text-black" />
              <span className="min-w-0 flex-1 text-[14px] leading-5">My Favourites</span>
              <span className="text-black/35" aria-hidden="true">
                ›
              </span>
            </Link>
          </div>

          {workspaces.length > 0 ? (
            <div className="border-b border-black/20 py-2">
              <p className="px-4 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
                Your workspaces
              </p>
              {workspaces.map((workspace) => (
                <a
                  key={workspace.key}
                  href={workspace.href}
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-black/5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-black/15 bg-black/[0.03] text-[12px]">
                    {workspace.key === "platform" ? "P" : "O"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] leading-5">{workspace.label}</span>
                    <span className="block truncate text-[11px] leading-4 text-black/50">
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
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[14px] transition hover:bg-black/5"
          >
            <IconCard name={LOGOUT_ICON} className="h-4 w-4 [&_path]:stroke-black" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
