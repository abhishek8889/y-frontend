"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGetEventCategoriesQuery } from "@/apis/events/eventsApi";
import { categoryHref } from "@/lib/public/categorySlug";

type EventsCategoryDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function EventsCategoryDrawer({
  open,
  onClose,
}: EventsCategoryDrawerProps) {
  const { data } = useGetEventCategoriesQuery();
  const categories = data?.data ?? [];

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close categories"
        className={`public-events-drawer__backdrop${open ? " is-open" : ""}`}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        id="public-events-drawer"
        className={`public-events-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Event categories"
      >
        <button
          type="button"
          className="public-events-drawer__close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <nav className="public-events-drawer__nav">
          <Link href="/#events" className="public-events-drawer__link" onClick={onClose}>
            All events
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category)}
              className="public-events-drawer__link"
              onClick={onClose}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
