"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import eventCoverImage from "@/assets/event-cover.jpg";
import {
  getPublishedEventsSnapshot,
  parsePublishedEvents,
  subscribeToPublishedEvents,
} from "@/lib/events/eventStorage";

export default function EventsTab() {
  const snapshot = useSyncExternalStore(
    subscribeToPublishedEvents,
    getPublishedEventsSnapshot,
    () => "",
  );
  const events = useMemo(() => parsePublishedEvents(snapshot), [snapshot]);
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [savedIds, setSavedIds] = useState<string[] | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [savedHiddenIds, setSavedHiddenIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const selectedEventIds = selectedIds ?? events.map((event) => event.id);
  const visibleEvents = events.filter((event) => !hiddenIds.includes(event.id));

  function toggleEvent(eventId: string) {
    setSelectedIds((current) => {
      const selection = current ?? events.map((event) => event.id);
      return selection.includes(eventId)
        ? selection.filter((id) => id !== eventId)
        : [...selection, eventId];
    });
    setNotice("");
  }

  function removeEvent(eventId: string) {
    setHiddenIds((current) => [...current, eventId]);
    setSelectedIds((current) => (current ?? events.map((event) => event.id)).filter((id) => id !== eventId));
    setNotice("");
  }

  function saveEvents() {
    setSavedIds(selectedEventIds);
    setSavedHiddenIds(hiddenIds);
    setNotice("Clubsite events saved.");
  }

  function cancelChanges() {
    setSelectedIds(savedIds);
    setHiddenIds(savedHiddenIds);
    setNotice("");
  }

  return (
    <section className="mt-4" aria-label="Clubsite event listings">
      <h3 className="text-[18px] font-black uppercase leading-6">Events</h3>
      <p className="mt-1 text-[12px] text-[#777]">Add your event listings.</p>

      <div className="mt-4 space-y-3">
        {visibleEvents.map((event) => (
          <article key={event.id} className="flex min-h-[58px] items-center gap-4">
            <input
              type="checkbox"
              checked={selectedEventIds.includes(event.id)}
              onChange={() => toggleEvent(event.id)}
              aria-label={`Show ${event.title} on the clubsite`}
              className="h-[13px] w-[13px] shrink-0 accent-black"
            />
            <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden bg-[#eee]">
              <Image src={eventCoverImage} alt="" fill sizes="54px" className="object-cover" />
            </div>
            <p className="min-w-0 flex-1 text-[13px] text-black">{event.title}</p>
            <button
              type="button"
              onClick={() => removeEvent(event.id)}
              aria-label={`Remove ${event.title} from clubsite`}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[#ef4444] transition hover:bg-red-50"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path d="M4.5 6h11m-9.5 0 .6 10h6.8L14 6M8 6V4h4v2m-3 3v4m2-4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </article>
        ))}
        {snapshot !== "" && events.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-[#777]">
            No published events yet. Create and publish an event to add it to your clubsite.
          </p>
        ) : null}
        {events.length > 0 && visibleEvents.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-[#777]">
            No events selected. Select an event to show it on your clubsite.
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button
          type="button"
          onClick={cancelChanges}
          className="h-[35px] min-w-[96px] rounded-[3px] border border-black/70 px-4 text-[10px] uppercase hover:bg-black hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveEvents}
          className="h-[35px] min-w-[82px] rounded-[3px] border border-black bg-black px-4 text-[10px] uppercase text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </div>
    </section>
  );
}
