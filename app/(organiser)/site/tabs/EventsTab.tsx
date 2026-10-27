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
    setNotice("Site events saved.");
  }

  function cancelChanges() {
    setSelectedIds(savedIds);
    setHiddenIds(savedHiddenIds);
    setNotice("");
  }

  return (
    <section className="site-tab" aria-label="Site event listings">
      <h3 className="site-tab-title">Events</h3>
      <p className="site-tab-subtitle">Add your event listings.</p>

      <div className="site-event-list">
        {visibleEvents.map((event) => (
          <article key={event.id} className="site-event-row">
            <input
              type="checkbox"
              checked={selectedEventIds.includes(event.id)}
              onChange={() => toggleEvent(event.id)}
              aria-label={`Show ${event.title} on the site`}
            />
            <div className="site-event-thumb">
              <Image src={eventCoverImage} alt="" fill sizes="54px" className="object-cover" />
            </div>
            <p className="site-event-title">{event.title}</p>
            <button
              type="button"
              onClick={() => removeEvent(event.id)}
              aria-label={`Remove ${event.title} from site`}
              className="site-event-remove"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4.5 6h11m-9.5 0 .6 10h6.8L14 6M8 6V4h4v2m-3 3v4m2-4v4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </article>
        ))}
        {snapshot !== "" && events.length === 0 ? (
          <p className="site-empty-message">
            No published events yet. Create and publish an event to add it to your site.
          </p>
        ) : null}
        {events.length > 0 && visibleEvents.length === 0 ? (
          <p className="site-empty-message">
            No events selected. Select an event to show it on your site.
          </p>
        ) : null}
      </div>

      <div className="site-form-actions">
        {notice ? (
          <p role="status" className="site-notice">
            {notice}
          </p>
        ) : null}
        <button type="button" onClick={cancelChanges} className="form-footer-btn form-footer-btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={saveEvents} className="form-footer-btn form-footer-btn-primary">
          Save
        </button>
      </div>
    </section>
  );
}
