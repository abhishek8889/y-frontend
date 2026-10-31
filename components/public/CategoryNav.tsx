"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetEventCategoriesQuery } from "@/apis/events/eventsApi";
import { categoryHref } from "@/lib/public/categorySlug";

type CategoryNavProps = {
  className?: string;
  title?: string;
};

function ChevronLeftIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path
        d="M8.5 1.25 1.75 8l6.75 6.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.25 8.25 8 1.5 14.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryNav({
  className = "",
  title = "Categories",
}: CategoryNavProps) {
  const { data, isLoading, isError } = useGetEventCategoriesQuery();
  const categories = data?.data ?? [];
  const listRef = useRef<HTMLUListElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = listRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const max = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 2);
    setCanScrollRight(max - node.scrollLeft > 2);
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    resizeObserver?.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [categories.length, updateScrollState]);

  function scrollByDirection(direction: -1 | 1) {
    const node = listRef.current;
    if (!node) return;
    const amount = Math.max(160, Math.round(node.clientWidth * 0.55));
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  if (isError) return null;

  return (
    <section
      id="categories"
      className={`public-categories ${className}`.trim()}
      aria-label={title || "Event categories"}
    >
      {title ? <h2 className="public-categories__title">{title}</h2> : null}
      {isLoading ? (
        <p className="public-categories__status">Loading categories…</p>
      ) : categories.length === 0 ? null : (
        <div className="public-categories__slider">
          <button
            type="button"
            className="public-categories__arrow"
            aria-label="Scroll categories left"
            disabled={!canScrollLeft}
            onClick={() => scrollByDirection(-1)}
          >
            <ChevronLeftIcon />
          </button>

          <ul ref={listRef} className="public-categories__list">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={categoryHref(category)} className="public-categories__chip">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="public-categories__arrow"
            aria-label="Scroll categories right"
            disabled={!canScrollRight}
            onClick={() => scrollByDirection(1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </section>
  );
}
