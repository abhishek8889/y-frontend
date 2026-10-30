"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

type HeroCtaButtonProps = {
  href: string;
  children: ReactNode;
};

/**
 * Balenciaga CTA roll.
 * Animation is started on mouseenter (not CSS :hover), so moving over the
 * text cannot cancel it. Label has pointer-events: none.
 */
export function HeroCtaButton({ href, children }: HeroCtaButtonProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const playingRef = useRef(false);

  function startRoll() {
    const label = labelRef.current;
    if (!label || playingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    playingRef.current = true;
    label.classList.remove("home-hero__btn-label--roll");
    void label.offsetWidth;
    label.classList.add("home-hero__btn-label--roll");
  }

  function onRollEnd() {
    playingRef.current = false;
    labelRef.current?.classList.remove("home-hero__btn-label--roll");
  }

  const label = (
    <span
      ref={labelRef}
      className="home-hero__btn-label"
      onAnimationEnd={onRollEnd}
    >
      {children}
    </span>
  );

  const shared = {
    className: "home-hero__btn",
    onMouseEnter: startRoll,
  };

  if (href.startsWith("#")) {
    return (
      <a href={href} {...shared}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} {...shared}>
      {label}
    </Link>
  );
}
