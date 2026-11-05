"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PublicAccountMenu } from "@/components/public/PublicAccountMenu";
import { PUBLIC_SEARCH_EVENT } from "@/components/public/PublicSiteHeader";
import { clearAuthSession, getAuthUser } from "@/lib/api/authStorage";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/constants";
import { getDisplayName } from "@/lib/auth/session";
import {
  siteDisplayName,
  siteLogoUrl,
  siteNavigation,
  useHostResolution,
} from "@/lib/public/hostResolution";
import { useHasAuthToken } from "@/lib/public/useHasAuthToken";
import { useWishlistIds } from "@/lib/public/useWishlistIds";
import { baseApi } from "@/lib/store/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";

function MenuIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1 13 13M13 1 1 13" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function SiteLogo({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={className ?? "h-6 w-auto max-w-[120px] object-contain"} />
    );
  }

  return (
    <span className="font-heading text-[14px] uppercase tracking-[0.08em] text-black">{name}</span>
  );
}

/**
 * Microsite header — same structure as public, with site logo + dynamic navigation.
 */
export function MicrositeHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { resolution } = useHostResolution();
  const { wishlistedIds } = useWishlistIds();
  const isLoggedIn = useHasAuthToken();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [displayName, setDisplayName] = useState("");

  const logoSrc = siteLogoUrl(resolution);
  const siteName = siteDisplayName(resolution);
  const navigation = siteNavigation(resolution);
  const savedCount = wishlistedIds.size;
  const showDesktopSearch = !pathname?.startsWith("/event/");

  useEffect(() => {
    setMenuOpen(false);
    setMenuQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  useEffect(() => {
    function syncName() {
      setDisplayName(getDisplayName(getAuthUser()));
    }
    syncName();
    window.addEventListener(AUTH_CHANGE_EVENT, syncName);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncName);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleLogout() {
    setMenuOpen(false);
    clearAuthSession();
    dispatch(baseApi.util.resetApiState());
    window.location.assign("/");
  }

  function submitMenuSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = menuQuery.trim();
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent(PUBLIC_SEARCH_EVENT, { detail: next }));
    router.push(next ? `/?q=${encodeURIComponent(next)}` : "/");
  }

  const wishlistLink = (
    <Link
      href="/wishlist"
      aria-label={savedCount > 0 ? "Open favourites" : "Favourites"}
      className="relative flex size-5 items-center justify-center"
    >
      <img src="/landing/save-for-letter.svg" width={14} height={17} alt="" />
      {savedCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-[12px] min-w-[12px] items-center justify-center rounded-full bg-black px-[2px] text-[8px] leading-[8px] text-white">
          {savedCount}
        </span>
      ) : null}
    </Link>
  );

  return (
    <div
      className={`public-site-header${showDesktopSearch ? " public-site-header--with-search" : ""}`}
    >
      <header className="public-bar relative border-b border-black bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:hidden">
          <Link href="/" aria-label={`${siteName} home`} className="shrink-0">
            <SiteLogo src={logoSrc} name={siteName} className="h-6 w-auto max-w-[100px] object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            {wishlistLink}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="microsite-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-7 w-7 items-center justify-center text-black"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <div className="hidden h-full items-center justify-between px-4 sm:flex sm:px-10">
          <nav aria-label="Site" className="flex h-full max-w-[40%] items-center gap-4 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={`${item.name}-${item.redirect_link}`}
                href={item.redirect_link}
                className="shrink-0 text-[12px] uppercase leading-[15.6px] tracking-[0.36px] text-black hover:opacity-60"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            aria-label={`${siteName} home`}
            className="shrink-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <SiteLogo
              src={logoSrc}
              name={siteName}
              className="h-[31px] w-auto max-w-[140px] object-contain"
            />
          </Link>

          <nav aria-label="Account navigation" className="ml-auto flex h-full shrink-0 items-center gap-4">
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="text-[12px] uppercase leading-[15.6px] tracking-[0.36px] text-black hover:opacity-60"
              >
                Login
              </Link>
            ) : null}
            {wishlistLink}
            {isLoggedIn ? <PublicAccountMenu variant="button" /> : null}
          </nav>
        </div>
      </header>

      {showDesktopSearch ? (
        <form
          onSubmit={submitMenuSearch}
          className="public-bar home-search public-site-header__search"
        >
          <img
            src="/landing/search.svg"
            width={26}
            height={26}
            alt=""
            className="home-search__icon"
          />
          <input
            type="search"
            value={menuQuery}
            onChange={(event) => setMenuQuery(event.target.value)}
            placeholder="What are you looking for?"
            aria-label="Search events"
            className="home-search__input"
          />
        </form>
      ) : null}

      {menuOpen ? (
        <div id="microsite-mobile-menu" className="border-b border-black bg-white sm:hidden">
          <form
            onSubmit={submitMenuSearch}
            className="public-bar flex items-center gap-3 border-b border-black px-4"
          >
            <img src="/landing/search.svg" width={22} height={22} alt="" className="shrink-0 -scale-y-100" />
            <input
              type="search"
              value={menuQuery}
              onChange={(event) => setMenuQuery(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search events"
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] uppercase leading-[15.6px] text-black placeholder:text-black/60 focus:outline-none"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col items-center gap-4 px-4 py-6">
            {isLoggedIn && displayName ? (
              <p className="font-body-bold text-[14px] leading-5">{displayName}</p>
            ) : null}
            {navigation.map((item) => (
              <Link
                key={`m-${item.name}-${item.redirect_link}`}
                href={item.redirect_link}
                className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/wishlist"
              className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
              onClick={() => setMenuOpen(false)}
            >
              My favourites
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/account"
                  className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/orders"
                  className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
                  onClick={() => setMenuOpen(false)}
                >
                  My orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-[13px] uppercase tracking-[0.08em] hover:opacity-60"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
