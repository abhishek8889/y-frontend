"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import yourlistLogo from "@/assets/yourlist-logo.png";
import { PublicAccountMenu } from "@/components/public/PublicAccountMenu";
import { getAuthUser } from "@/lib/api/authStorage";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/constants";
import { buildSurfaceUrl } from "@/lib/hosts";

type PublicSiteHeaderProps = {
  /** Show favorites / wishlist control in the header. */
  showFavorites?: boolean;
  isFavorite?: boolean;
  favoriteCount?: number;
  onToggleFavorite?: () => void;
};

function subscribeAuthUser(onStoreChange: () => void) {
  window.addEventListener("focus", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

/** Primitive snapshot — getAuthUser() returns a new object each call and breaks useSyncExternalStore. */
function getIsLoggedIn() {
  return getAuthUser() !== null;
}

let cachedOrganiserSignupUrl = "#";

function getOrganiserSignupUrl() {
  const next = buildSurfaceUrl("organiser", "/signup", window.location.host);
  if (next !== cachedOrganiserSignupUrl) {
    cachedOrganiserSignupUrl = next;
  }
  return cachedOrganiserSignupUrl;
}

/**
 * Public header:
 * - Guest → Login + Organiser (app signup)
 * - Logged in → wishlist + ACCOUNT menu (no dashboard shortcut button)
 */
export function PublicSiteHeader({
  showFavorites = false,
  isFavorite = false,
  favoriteCount = 0,
  onToggleFavorite,
}: PublicSiteHeaderProps) {
  const isLoggedIn = useSyncExternalStore(subscribeAuthUser, getIsLoggedIn, () => false);
  const organiserSignupUrl = useSyncExternalStore(
    () => () => {},
    getOrganiserSignupUrl,
    () => "#",
  );

  return (
    <header className="relative flex h-[44px] items-center justify-between border-b border-black/80 px-5 md:px-8">
      <Link href="/" className="text-[11px] font-medium uppercase text-black hover:opacity-60">
        Events
      </Link>

      <Link
        href="/"
        aria-label="Yourlist home"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Image src={yourlistLogo} alt="Yourlist" priority className="h-auto w-[76px]" />
      </Link>

      <nav aria-label="Account navigation" className="ml-auto flex h-full items-center gap-3 md:gap-5">
        {!isLoggedIn ? (
          <Link href="/login" className="text-[11px] font-medium uppercase text-black hover:opacity-60">
            Login
          </Link>
        ) : null}

        {showFavorites || isLoggedIn ? (
          <Link
            href="/wishlist"
            aria-label={isFavorite ? "Open favourites" : "Favourites"}
            onClick={onToggleFavorite}
            className="relative flex h-8 w-7 items-center justify-center text-black"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            >
              <path
                d="M20.8 8.6c0 4.1-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            {favoriteCount > 0 || isFavorite ? (
              <span className="absolute right-[-2px] top-0 flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-black px-[3px] text-[8px] leading-none text-white">
                {favoriteCount || (isFavorite ? 1 : 0)}
              </span>
            ) : null}
          </Link>
        ) : null}

        {isLoggedIn ? (
          <PublicAccountMenu variant="button" />
        ) : (
          <a
            href={organiserSignupUrl}
            className="flex h-[28px] items-center justify-center bg-black px-5 text-[9px] font-medium uppercase text-white transition hover:bg-black/75"
          >
            Organiser
          </a>
        )}
      </nav>
    </header>
  );
}
