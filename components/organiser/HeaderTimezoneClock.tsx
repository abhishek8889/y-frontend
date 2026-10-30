"use client";

import { useEffect, useState } from "react";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import {
  formatDashboardClock,
  formatDashboardTimezoneLabel,
  getBrowserTimeZone,
  normalizeTimeZoneId,
  writeDashboardTimezone,
} from "@/lib/organisation/dashboardTimezone";

type HeaderTimezoneClockProps = {
  className?: string;
};

function organisationTimezoneFromAboutMe(user: {
  organisation_timezone?: string | null;
  organisation?: { timezone?: string | null } | null;
} | null | undefined) {
  return (
    normalizeTimeZoneId(user?.organisation_timezone) ||
    normalizeTimeZoneId(user?.organisation?.timezone)
  );
}

export function HeaderTimezoneClock({ className = "" }: HeaderTimezoneClockProps) {
  const { data: aboutMeData, isLoading } = useGetAboutMeQuery();
  const organisationTimezone = organisationTimezoneFromAboutMe(
    aboutMeData?.data?.user,
  );
  const timezone = organisationTimezone || getBrowserTimeZone();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (organisationTimezone) {
      writeDashboardTimezone(organisationTimezone);
    }
  }, [organisationTimezone]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const clockLabel = formatDashboardClock(now, timezone);
  const zoneLabel = formatDashboardTimezoneLabel(now, timezone);

  return (
    <div
      className={`header-timezone-clock ${className}`.trim()}
      aria-live="polite"
      aria-atomic="true"
      title={isLoading ? "Loading timezone…" : zoneLabel}
    >
      <time
        className="header-timezone-clock__clock"
        dateTime={now.toISOString()}
      >
        {clockLabel}
      </time>
      <span className="header-timezone-clock__zone">{timezone}</span>
    </div>
  );
}
