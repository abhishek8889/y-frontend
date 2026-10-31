"use client";

import Link from "next/link";
import { useGetEventCategoriesQuery } from "@/apis/events/eventsApi";
import { categoryHref } from "@/lib/public/categorySlug";

type CategoryNavProps = {
  className?: string;
  title?: string;
};

export function CategoryNav({
  className = "",
  title = "Categories",
}: CategoryNavProps) {
  const { data, isLoading, isError } = useGetEventCategoriesQuery();
  const categories = data?.data ?? [];

  if (isError) return null;

  return (
    <section
      id="categories"
      className={`public-categories ${className}`.trim()}
      aria-label="Event categories"
    >
      <h2 className="public-categories__title">{title}</h2>
      {isLoading ? (
        <p className="public-categories__status">Loading categories…</p>
      ) : categories.length === 0 ? null : (
        <ul className="public-categories__list">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={categoryHref(category)}
                className="public-categories__chip"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
