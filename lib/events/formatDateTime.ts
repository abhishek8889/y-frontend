export type FormatDateTimeOptions = {
  /** Insert "at" between date and time, e.g. "29 Oct 2026 at 10:54 am". */
  withAt?: boolean;
  /** Date only, e.g. "29 Oct 2026". */
  dateOnly?: boolean;
  /** Include year in the date part (order details). Default false for compact event cards. */
  includeYear?: boolean;
  /** Fallback when value is empty. Defaults to "Date not set". */
  emptyLabel?: string;
  /**
   * IANA timezone for display (e.g. organisation_timezone from about-me).
   * When set, API timestamps are treated as UTC instants and rendered in this zone.
   */
  timeZone?: string | null;
};

/** Parse API UTC values (`YYYY-MM-DD HH:mm:ss` or ISO) as an absolute instant. */
function parseInstant(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoCandidate = trimmed.includes("T")
    ? trimmed
    : trimmed.replace(" ", "T");
  const withZone =
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoCandidate) || isoCandidate.endsWith("Z")
      ? isoCandidate
      : `${isoCandidate}Z`;
  const ms = Date.parse(withZone);
  if (Number.isNaN(ms)) {
    const fallback = new Date(trimmed);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(ms);
}

/**
 * Shared date/time formatter using a 12-hour clock.
 * Pass `timeZone` (organisation timezone) so values are not shown in the browser local zone.
 */
export function formatDateTime(
  value: string | null | undefined,
  options: FormatDateTimeOptions = {},
) {
  const {
    withAt = false,
    dateOnly = false,
    includeYear = false,
    emptyLabel = "Date not set",
    timeZone,
  } = options;

  if (!value?.trim()) return emptyLabel;

  const date = parseInstant(value);
  if (!date) return value;

  const zone = timeZone?.trim() || undefined;
  const zoneOption = zone ? { timeZone: zone } : {};

  try {
    const datePart = new Intl.DateTimeFormat("en-GB", {
      day: includeYear || dateOnly || withAt ? "numeric" : "2-digit",
      month: "short",
      ...(includeYear || dateOnly || withAt ? { year: "numeric" as const } : {}),
      ...zoneOption,
    }).format(date);

    if (dateOnly) return datePart;

    const timePart = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...zoneOption,
    }).format(date);

    return withAt ? `${datePart} at ${timePart}` : `${datePart}, ${timePart}`;
  } catch {
    // Invalid timezone — fall back to browser local formatting.
    const datePart = new Intl.DateTimeFormat("en-GB", {
      day: includeYear || dateOnly || withAt ? "numeric" : "2-digit",
      month: "short",
      ...(includeYear || dateOnly || withAt ? { year: "numeric" as const } : {}),
    }).format(date);

    if (dateOnly) return datePart;

    const timePart = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return withAt ? `${datePart} at ${timePart}` : `${datePart}, ${timePart}`;
  }
}
