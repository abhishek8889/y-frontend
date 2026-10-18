export type PublishedEvent = {
  id: string;
  title: string;
  category: string;
  description: string;
  venue: string;
  capacity: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
};

const storageKey = "yourlist.published-events";
const eventUpdateName = "yourlist:published-events";

function isPublishedEvent(value: unknown): value is PublishedEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as Record<string, unknown>;
  return [
    "id",
    "title",
    "category",
    "description",
    "venue",
    "capacity",
    "startDateTime",
    "endDateTime",
    "timezone",
  ].every((key) => typeof event[key] === "string");
}

export function getPublishedEventsSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey) ?? "[]";
}

export function parsePublishedEvents(snapshot: string): PublishedEvent[] {
  try {
    const storedEvents: unknown = JSON.parse(snapshot || "[]");
    return Array.isArray(storedEvents) ? storedEvents.filter(isPublishedEvent) : [];
  } catch {
    return [];
  }
}

export function subscribeToPublishedEvents(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(eventUpdateName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventUpdateName, callback);
  };
}

function writePublishedEvents(events: PublishedEvent[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(events));
  window.dispatchEvent(new Event(eventUpdateName));
}

export function savePublishedEvent(event: PublishedEvent) {
  writePublishedEvents([event, ...parsePublishedEvents(getPublishedEventsSnapshot())]);
}

export function deletePublishedEvent(id: string) {
  writePublishedEvents(parsePublishedEvents(getPublishedEventsSnapshot()).filter((event) => event.id !== id));
}