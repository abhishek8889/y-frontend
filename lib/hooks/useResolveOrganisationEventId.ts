"use client";

import { useMemo } from "react";
import {
  useGetOrganisationEventsQuery,
  type OrganisationEvent,
} from "@/apis/events/eventsApi";
import {
  isNumericEventId,
  matchOrganisationEventByKey,
} from "@/components/organiser/events/eventFormHelpers";

/**
 * Browser URLs use `unique_id` for UX. Organiser event APIs expect numeric `id`.
 * Resolve a URL key (unique_id or numeric id) to the numeric id before API calls.
 */
export function useResolveOrganisationEventId(eventKey: string | null | undefined) {
  const key = eventKey?.trim() || "";
  const isNumeric = isNumericEventId(key);
  const needsLookup = Boolean(key) && !isNumeric;

  const { data, isLoading, isFetching, isError } = useGetOrganisationEventsQuery(
    { per_page: 15, search: key },
    { skip: !needsLookup },
  );

  const matchedEvent = useMemo(() => {
    if (!key) return null;
    if (isNumeric) return null;
    return matchOrganisationEventByKey(data?.data?.items ?? [], key);
  }, [data?.data?.items, isNumeric, key]);

  const numericId = useMemo(() => {
    if (!key) return null;
    if (isNumeric) return key;
    return matchedEvent ? String(matchedEvent.id) : null;
  }, [isNumeric, key, matchedEvent]);

  const isResolving = needsLookup && (isLoading || isFetching) && numericId == null;
  const isUnresolved = needsLookup && !isResolving && !isError && numericId == null;

  return {
    eventKey: key || null,
    numericId,
    matchedEvent: matchedEvent as OrganisationEvent | null,
    isResolving,
    isUnresolved,
    isError: needsLookup && isError,
  };
}
