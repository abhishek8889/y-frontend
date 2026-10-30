const STORAGE_KEY = "yourlist.dashboard.timezone";

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZoneId(timeZone: string | null | undefined) {
  const zone = String(timeZone ?? "")
    .trim()
    .replace(/\\+/g, "");
  if (!zone) return null;
  return isValidTimeZone(zone) ? zone : null;
}

export function readDashboardTimezone() {
  if (typeof window === "undefined") return getBrowserTimeZone();
  try {
    const stored = normalizeTimeZoneId(
      window.localStorage.getItem(STORAGE_KEY),
    );
    if (stored) return stored;
  } catch {
    // ignore storage errors
  }
  return getBrowserTimeZone();
}

/** Prefer organisation timezone from about-me, then local override, then browser. */
export function resolveDashboardTimezone(
  organisationTimezone?: string | null,
) {
  return (
    normalizeTimeZoneId(organisationTimezone) || readDashboardTimezone()
  );
}

export function writeDashboardTimezone(timeZone: string) {
  if (typeof window === "undefined") return;
  const zone = timeZone.trim();
  if (!isValidTimeZone(zone)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, zone);
  } catch {
    // ignore storage errors
  }
}

export function formatDashboardClock(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDashboardTimezoneLabel(date: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const city = timeZone.split("/").pop()?.replaceAll("_", " ") || timeZone;
    return offset ? `${city} (${offset})` : city;
  } catch {
    return timeZone;
  }
}
