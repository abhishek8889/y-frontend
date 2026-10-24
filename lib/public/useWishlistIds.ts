"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/apis/public/wishlistApi";
import { getAuthToken } from "@/lib/api/token";
import { useHasAuthToken } from "@/lib/public/useHasAuthToken";

/**
 * Shared wishlist id set for public listing / details / wishlist pages.
 * Skips the GET when the user has no auth token.
 */
export function useWishlistIds() {
  const router = useRouter();
  const hasToken = useHasAuthToken();

  const { data, isLoading, isFetching, isError } = useGetWishlistQuery(
    { per_page: 100 },
    { skip: !hasToken },
  );

  const [addToWishlist, addState] = useAddToWishlistMutation();
  const [removeFromWishlist, removeState] = useRemoveFromWishlistMutation();

  const wishlistedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const item of data?.data?.items ?? []) {
      if (typeof item.event_id === "number") ids.add(item.event_id);
    }
    return ids;
  }, [data]);

  const isMutating = addState.isLoading || removeState.isLoading;

  async function toggleWishlist(eventId: number, organisationId?: number | null) {
    if (!getAuthToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (isMutating) return;

    try {
      if (wishlistedIds.has(eventId)) {
        await removeFromWishlist({ event_id: eventId }).unwrap();
      } else {
        await addToWishlist({
          event_id: eventId,
          ...(organisationId ? { organisation_id: organisationId } : {}),
        }).unwrap();
      }
    } catch {
      // Error toast handled by withQueryToast.
    }
  }

  return {
    hasToken,
    wishlistedIds,
    isWishlistLoading: hasToken && (isLoading || isFetching),
    isWishlistError: isError,
    isMutating,
    toggleWishlist,
  };
}
