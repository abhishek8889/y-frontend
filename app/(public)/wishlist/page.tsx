"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetWishlistQuery } from "@/apis/public/wishlistApi";
import { EventCard } from "@/components/public/EventCard";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useWishlistIds } from "@/lib/public/useWishlistIds";

export default function PublicWishlistPage() {
  const router = useRouter();
  const { hasToken, wishlistedIds, toggleWishlist, isMutating } = useWishlistIds();

  useEffect(() => {
    if (!hasToken) {
      router.replace(`/login?next=${encodeURIComponent("/wishlist")}`);
    }
  }, [hasToken, router]);

  const { data, isLoading, isFetching, isError } = useGetWishlistQuery(
    { per_page: 50 },
    { skip: !hasToken },
  );

  const events = useMemo(
    () =>
      (data?.data?.items ?? [])
        .map((item) => item.event)
        .filter((event): event is NonNullable<typeof event> => Boolean(event?.unique_id)),
    [data],
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader
        showFavorites
        isFavorite={wishlistedIds.size > 0}
        favoriteCount={wishlistedIds.size}
      />

      <div className="border-b border-black/20 px-5 py-8 md:px-8">
        <h1 className="text-[24px] font-bold uppercase leading-[32px]">Wishlist</h1>
        <p className="mt-2 text-[14px] leading-[22px] text-black/70">
          Events you have saved for later.
        </p>
      </div>

      {!hasToken ? (
        <p role="status" className="px-5 py-10 text-center text-[14px] text-black/60 md:px-8">
          Redirecting to login…
        </p>
      ) : isError ? (
        <p role="alert" className="px-5 py-10 text-center text-[14px] text-[#b42318] md:px-8">
          Unable to load your wishlist. Please try again.
        </p>
      ) : isLoading || isFetching ? (
        <p role="status" className="px-5 py-10 text-center text-[14px] text-black/60 md:px-8">
          Loading wishlist…
        </p>
      ) : events.length === 0 ? (
        <div className="px-5 py-12 text-center md:px-8">
          <p className="text-[14px] text-black/70">Your wishlist is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-[40px] items-center justify-center border border-black bg-black px-5 text-[12px] font-medium uppercase text-white"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-transparent sm:grid-cols-2 xl:grid-cols-4">
          {events.map((event) => (
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

      <SiteFooter />
    </main>
  );
}
