"use client";

import { useMemo } from "react";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import {
  getBrowserTimeZone,
  normalizeTimeZoneId,
} from "@/lib/organisation/dashboardTimezone";

/** Organisation display timezone from about-me (falls back to browser). */
export function useOrganisationTimezone() {
  const { data } = useGetAboutMeQuery();

  return useMemo(() => {
    const user = data?.data?.user;
    return (
      normalizeTimeZoneId(user?.organisation_timezone) ||
      normalizeTimeZoneId(user?.organisation?.timezone) ||
      getBrowserTimeZone()
    );
  }, [data?.data?.user]);
}
