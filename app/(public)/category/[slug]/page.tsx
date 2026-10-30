"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetEventCategoriesQuery } from "@/apis/events/eventsApi";
import { useGetPublicEventsQuery } from "@/apis/public/publicEventsApi";
import { EventCard } from "@/components/public/EventCard";
import { SelectField } from "@/components/ui/SelectField";
import { categorySlug } from "@/lib/public/categorySlug";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

function CategoryPageContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = decodeURIComponent(params.slug || "");
  const idParam = searchParams.get("id");
  const [sortBy, setSortBy] = useState("featured");

  const { data: categoriesData } = useGetEventCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const category = useMemo(() => {
    if (idParam) {
      const byId = categories.find((item) => String(item.id) === idParam);
      if (byId) return byId;
    }
    return categories.find((item) => categorySlug(item.name) === slug) ?? null;
  }, [categories, idParam, slug]);

  const categoryId = category?.id;
  const { data, isLoading, isError } = useGetPublicEventsQuery(
    {
      event_category_id: categoryId,
      per_page: 48,
    },
    { skip: !categoryId },
  );

  const { wishlistedIds, toggleWishlist, isMutating } = useWishlistIds();

  const sortedEvents = useMemo(() => {
    const items = [...(data?.data?.items ?? [])];
    if (sortBy === "name") {
      return items.sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
    }
    if (sortBy === "oldest") {
      return items.sort((a, b) => {
        const aTime = a.starts_at ? new Date(a.starts_at).getTime() : 0;
        const bTime = b.starts_at ? new Date(b.starts_at).getTime() : 0;
        return aTime - bTime || a.id - b.id;
      });
    }
    return items;
  }, [data?.data?.items, sortBy]);

  const title = category?.name || slug.replace(/-/g, " ");

  return (
    <main className="category-page">
      <header className="category-page__toolbar">
        <p aria-live="polite" className="category-page__count">
          {!categoryId || isLoading
            ? "Loading…"
            : `${sortedEvents.length} Event${sortedEvents.length === 1 ? "" : "s"}`}
        </p>
        <h1 className="category-page__title">{title}</h1>
        <SelectField
          name="eventSort"
          aria-label="Sort events"
          label="Sort by"
          labelClassName="home-events__sort-label"
          value={sortBy}
          options={SORT_OPTIONS}
          density="compact"
          onChange={(event) => setSortBy(event.target.value)}
          wrapperClassName="home-events__sort-wrap category-page__sort"
          containerClassName="home-events__sort-box"
          className="home-events__sort-select"
        />
      </header>

      {!categoryId && categoriesData ? (
        <p className="home-events__status" role="alert">
          Category not found.
        </p>
      ) : isError ? (
        <p role="alert" className="home-events__status home-events__status--error">
          Unable to load events. Please try again.
        </p>
      ) : isLoading || !categoryId ? (
        <p role="status" className="home-events__status">
          Loading events…
        </p>
      ) : sortedEvents.length === 0 ? (
        <p className="home-events__status">No events in this category yet.</p>
      ) : (
        <div className="category-page__grid">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isWishlisted={wishlistedIds.has(event.id)}
              wishlistDisabled={isMutating}
              onToggleWishlist={(eventId) => void toggleWishlist(eventId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="category-page">
          <p className="home-events__status">Loading…</p>
        </main>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
