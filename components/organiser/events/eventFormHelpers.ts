import type {
  EventLifecycleStatus,
  EventPayload,
  OrganisationEvent,
} from "@/apis/events/eventsApi";
import { normalizeRichTextHtml } from "@/components/organiser/venues/venueFormHelpers";

export type EventFormImage = {
  id?: number;
  path: string;
  url: string;
  alt_text?: string | null;
  mime?: string | null;
  media_type?: "image" | "video" | string | null;
};

export type EventFormValues = {
  name: string;
  event_category_id: string;
  description: string;
  venue_id: string;
  capacity: string;
  starts_at_local: string;
  ends_at_local: string;
  timezone: string;
  status: EventLifecycleStatus;
  banner: EventFormImage | null;
  gallery: EventFormImage[];
};

export function toEventLifecycleStatus(status: string | null | undefined): EventLifecycleStatus {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "published") return "published";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  if (normalized === "completed") return "completed";
  return "draft";
}

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function createEmptyEventFormValues(): EventFormValues {
  return {
    name: "",
    event_category_id: "",
    description: "",
    venue_id: "",
    capacity: "",
    starts_at_local: "",
    ends_at_local: "",
    timezone: getBrowserTimeZone(),
    status: "draft",
    banner: null,
    gallery: [],
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getTimeZoneOffsetMs(utcMs: number, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - utcMs;
}

function assertValidTimeZone(timeZone: string) {
  const zone = timeZone.trim();
  if (!zone) throw new Error("Timezone is required.");
  try {
    // Throws RangeError for unknown IANA zones.
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
  } catch {
    throw new Error(`Invalid timezone: ${zone}`);
  }
  return zone;
}

/**
 * Convert a datetime-local wall-clock value in `timeZone` to UTC SQL `YYYY-MM-DD HH:mm:ss`.
 * Used on both event create and update so starts_at / ends_at are always stored in UTC.
 */
export function localDateTimeInZoneToUtcSql(localDateTime: string, timeZone: string) {
  const zone = assertValidTimeZone(timeZone);
  const normalized = localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime;
  const [datePart, timePart] = normalized.split("T");
  if (!datePart || !timePart) {
    throw new Error("Invalid datetime value.");
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);
  if ([year, month, day, hour, minute, second].some((part) => Number.isNaN(part))) {
    throw new Error("Invalid datetime value.");
  }

  // Interpret the wall clock in `zone`, then resolve to the matching UTC instant
  // (two-pass offset correction handles DST transitions).
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset1 = getTimeZoneOffsetMs(utcGuess, zone);
  const utcMs = utcGuess - offset1;
  const offset2 = getTimeZoneOffsetMs(utcMs, zone);
  const corrected = utcGuess - offset2;

  const date = new Date(corrected);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/** Convert UTC SQL / ISO datetime to datetime-local value in `timeZone`. */
export function utcSqlToLocalDateTimeInZone(utcValue: string, timeZone: string) {
  if (!utcValue) return "";

  const trimmed = utcValue.trim();
  const isoCandidate = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const withZone =
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoCandidate) || isoCandidate.endsWith("Z")
      ? isoCandidate
      : `${isoCandidate}Z`;
  const utcMs = Date.parse(withZone);
  if (Number.isNaN(utcMs)) return "";

  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  let hour = parts.hour;
  if (hour === "24") hour = "00";

  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

export function mapEventToFormValues(event: OrganisationEvent): EventFormValues {
  const timezone = event.timezone || getBrowserTimeZone();
  const bannerImage = event.images?.find((image) => image.type === "banner") ?? null;
  const galleryImages = (event.images ?? []).filter((image) => image.type === "gallery");

  return {
    name: event.name ?? "",
    event_category_id: event.event_category_id != null ? String(event.event_category_id) : "",
    description: event.description ?? "",
    venue_id: event.venue_id != null ? String(event.venue_id) : "",
    capacity: event.capacity != null ? String(event.capacity) : "",
    starts_at_local: utcSqlToLocalDateTimeInZone(event.starts_at, timezone),
    ends_at_local: utcSqlToLocalDateTimeInZone(event.ends_at, timezone),
    timezone,
    status: toEventLifecycleStatus(event.status),
    banner: bannerImage
      ? {
          id: bannerImage.id,
          path: bannerImage.path,
          url: bannerImage.url || "",
          alt_text: bannerImage.alt_text ?? null,
          mime: bannerImage.mime ?? null,
          media_type: bannerImage.media_type ?? null,
        }
      : null,
    gallery: galleryImages.map((image) => ({
      id: image.id,
      path: image.path,
      url: image.url || "",
      alt_text: image.alt_text ?? null,
      mime: image.mime ?? null,
      media_type: image.media_type ?? null,
    })),
  };
}

export function validateEventForm(values: EventFormValues): string | null {
  if (!values.name.trim()) return "Event title is required.";
  if (!values.event_category_id) return "Event category is required.";
  if (!values.venue_id) return "Venue is required.";
  if (!values.capacity.trim() || Number.isNaN(Number(values.capacity))) {
    return "Event capacity is required.";
  }
  if (Number(values.capacity) <= 0) return "Event capacity must be greater than 0.";
  if (!values.starts_at_local) return "Start date & time is required.";
  if (!values.ends_at_local) return "End date & time is required.";
  if (!values.timezone) return "Timezone is required.";
  if (!values.status) return "Status is required.";

  try {
    const startsUtc = localDateTimeInZoneToUtcSql(values.starts_at_local, values.timezone);
    const endsUtc = localDateTimeInZoneToUtcSql(values.ends_at_local, values.timezone);
    if (Date.parse(endsUtc.replace(" ", "T") + "Z") <= Date.parse(startsUtc.replace(" ", "T") + "Z")) {
      return "End date & time must be after start date & time.";
    }
  } catch {
    return "Invalid date & time values.";
  }

  return null;
}

export function buildEventPayload(values: EventFormValues): EventPayload {
  const timezone = assertValidTimeZone(values.timezone);
  // Create + update both send UTC instants derived from wall-clock times in `timezone`.
  const starts_at = localDateTimeInZoneToUtcSql(values.starts_at_local, timezone);
  const ends_at = localDateTimeInZoneToUtcSql(values.ends_at_local, timezone);

  const images = [
    ...(values.banner
      ? [
          {
            ...(values.banner.id ? { id: values.banner.id } : {}),
            type: "banner" as const,
            path: values.banner.path,
            alt_text: values.banner.alt_text ?? "banner",
            sort_order: 0,
          },
        ]
      : []),
    ...values.gallery.map((image, index) => ({
      ...(image.id ? { id: image.id } : {}),
      type: "gallery" as const,
      path: image.path,
      alt_text: image.alt_text ?? "gallery",
      sort_order: index + 1,
    })),
  ];

  return {
    name: values.name.trim(),
    event_category_id: Number(values.event_category_id),
    description: normalizeRichTextHtml(values.description),
    venue_id: Number(values.venue_id),
    capacity: Number(values.capacity),
    starts_at,
    ends_at,
    timezone,
    status: values.status,
    ...(images.length ? { images } : {}),
  };
}
