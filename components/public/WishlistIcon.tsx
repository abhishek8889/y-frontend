"use client";

import { useId } from "react";

type WishlistIconProps = {
  className?: string;
  filled?: boolean;
  size?: number;
};

/** Shared wishlist / save glyph for public header, cards, and detail. */
export function WishlistIcon({
  className = "",
  filled = false,
  size = 14,
}: WishlistIconProps) {
  const maskId = useId().replace(/:/g, "");
  const height = Math.round((size * 17) / 14);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 14 17"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {filled ? (
        <>
          <path d="M0 0H14V17L7 9.63333L0 17V0Z" fill="currentColor" />
          <mask id={maskId} fill="white">
            <path d="M0 0H14V17L7 9.63333L0 17V0Z" />
          </mask>
          <path
            d="M0 0H14V17L7 9.63333L0 17V0Z"
            stroke="currentColor"
            strokeWidth="2.33333"
            mask={`url(#${maskId})`}
          />
        </>
      ) : (
        <>
          <mask id={maskId} fill="white">
            <path d="M14 0H0V17L7 9.63333L14 17V0Z" />
          </mask>
          <path
            d="M0 0H14V17L7 9.63333L0 17V0Z"
            stroke="currentColor"
            strokeWidth="2.33333"
            mask={`url(#${maskId})`}
          />
        </>
      )}
    </svg>
  );
}
