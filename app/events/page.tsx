"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import {
  deletePublishedEvent,
  getPublishedEventsSnapshot,
  parsePublishedEvents,
  subscribeToPublishedEvents,
} from "./eventStorage";
import eventCoverImage from "@/assets/event-cover.jpg";
import Image from "next/image";

const eventTabs = ["Details", "Tickets", "Orders", "Attendees", "Scan / Entry", "Reports"];

function formatDateTime(value: string) {
  if (!value) return "Date not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function EventImage({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center bg-[#dedede] text-[10px] font-bold uppercase tracking-[0.12em] text-black/45 ${
        large ? "aspect-[1.55] w-full" : "aspect-[1.75] w-full"
      }`}
      aria-label="No event image uploaded"
    >
      <Image
        className="object-contain"
        src={eventCoverImage}
        alt="YourList logo"
        // width={"100%"}
        // height={"100%"}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 border-b border-black/10 py-2.5 last:border-0">
      <dt className="text-[11px] font-bold uppercase text-black/40">{label}</dt>
      <dd className="min-w-0 whitespace-pre-wrap break-words text-[13px] leading-[19px] text-black/80">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const eventsSnapshot = useSyncExternalStore(
    subscribeToPublishedEvents,
    getPublishedEventsSnapshot,
    () => "",
  );
  const events = parsePublishedEvents(eventsSnapshot);
  const [search, setSearch] = useState("");
  const [activeEventId, setActiveEventId] = useState("");
  const [activeTab, setActiveTab] = useState("Details");
  const loaded = eventsSnapshot !== "";

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const activeEvent = filteredEvents.find((event) => event.id === activeEventId) ?? filteredEvents[0] ?? null;

  function handleDelete(eventId: string) {
    deletePublishedEvent(eventId);
    setActiveEventId("");
  }

  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="min-h-full bg-white">
        <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="border-b border-black/30 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-[26px] font-black uppercase leading-[1.1] tracking-[-0.04em] text-black">Events</h1>
                <p className="font-normal text-[14px] leading-[19.6px] tracking-normal mt-[10px] text-[#6F6E69]">Create, manage and organize all your events.</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => router.push("/events/create")}
              className="mt-4 inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[3px] border border-black bg-black px-3 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-black"
            >
              + Create event
            </Button>

            <label className="mt-4 flex h-[38px] items-center gap-2 border-b border-black/35 px-2 text-black/60 focus-within:border-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="SEARCH"
                aria-label="SEARCH"
                className="min-w-0 flex-1 bg-transparent font-normal text-[14px] leading-[20px] tracking-normal text-[#666666] uppercase"
              />
              {search ? (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-[18px] leading-none text-black/50 hover:text-black">
                  ×
                </button>
              ) : null}
            </label>

            <div className="mt-4 space-y-3 lg:max-h-[calc(100vh-265px)] lg:overflow-y-auto lg:pr-1">
              {filteredEvents.map((event) => {
                const isActive = activeEvent?.id === event.id;

                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => setActiveEventId(event.id)}
                    aria-pressed={isActive}
                    className={`block w-full border p-3 text-left transition ${
                      isActive ? "border-black bg-black/[0.025]" : "border-transparent hover:border-black/35"
                    }`}
                  >
                    <EventImage />
                    <span className="mt-[10px] block font-bold text-[16px] leading-none tracking-normal uppercase text-black">
                      {event.title}
                    </span>
                    <span className="block font-normal text-[14px] leading-[14px] tracking-normal align-middle text-[#666666] my-[10px]">{event.category}</span>
                    <span className="block font-normal text-[14px] leading-none tracking-normal text-black">
                      {formatDateTime(event.startDateTime)}
                      {event.endDateTime ? ` - ${formatDateTime(event.endDateTime)}` : ""}
                    </span>
                  </button>
                );
              })}
              {loaded && filteredEvents.length === 0 ? (
                <p className="px-2 py-8 text-center text-[12px] text-black/50">
                  {events.length ? "No events match your search." : "No events yet. Create your first event."}
                </p>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0 p-5 md:p-7">
            {activeEvent ? (
              <>
                <header className="flex flex-wrap items-center gap-4 border-b border-black/30 pb-5">
                  <div className="w-[112px] shrink-0">
                    <EventImage />
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <h2 className="text-[21px] font-black uppercase leading-[1.12] tracking-[-0.025em] text-black md:text-[24px]">
                      {activeEvent.title}
                    </h2>
                    <p className="mt-1 text-[12px] text-black/55">{activeEvent.category}</p>
                    <p className="mt-1 text-[12px] leading-[18px] text-black/80">
                      {formatDateTime(activeEvent.startDateTime)}
                      {activeEvent.endDateTime ? ` - ${formatDateTime(activeEvent.endDateTime)}` : ""}
                      {activeEvent.venue !== "Not selected" ? `  •  ${activeEvent.venue}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      onClick={() => router.push("/events/create")}
                      className="h-[34px] min-w-[74px] rounded-[3px] border border-black/55 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDelete(activeEvent.id)}
                      className="h-[34px] min-w-[74px] rounded-[3px] border border-black/55 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </header>

                <nav aria-label="Event management" className="mt-4 flex gap-6 overflow-x-auto border-b border-black/10">
                  {eventTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      role="tab"
                      aria-selected={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 border-b-2 px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.03em] transition ${
                        activeTab === tab ? "border-black text-black" : "border-transparent text-black/45 hover:text-black"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                {activeTab === "Details" ? (
                  <div className="pt-4">
                    <div className="mb-5 border border-black/10 bg-black/[0.035] px-3 py-2 text-[11px] leading-[16px] text-black/70">
                      <span className="mr-2 font-bold" aria-hidden="true">i</span>
                      No tickets have been created for this event yet. Create tickets through Event Management to start selling tickets.
                    </div>
                    <h3 className="mb-3 text-[20px] font-black uppercase leading-none tracking-[-0.03em] text-black">Details</h3>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)]">
                      <div>
                        <EventImage large />
                        <h4 className="mb-2 mt-4 text-[11px] font-bold uppercase text-black">Gallery images</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className="aspect-square bg-[#dedede]" aria-label="No gallery image uploaded" />
                          ))}
                        </div>
                      </div>

                      <dl>
                        <DetailRow label="Event name" value={activeEvent.title} />
                        <DetailRow label="Category" value={activeEvent.category} />
                        <DetailRow label="Description" value={activeEvent.description} />
                        <DetailRow label="Venue" value={activeEvent.venue} />
                        <DetailRow label="Capacity" value={activeEvent.capacity} />
                        <DetailRow
                          label="Date & time"
                          value={activeEvent.startDateTime
                            ? `${formatDateTime(activeEvent.startDateTime)}${activeEvent.endDateTime ? ` - ${formatDateTime(activeEvent.endDateTime)}` : ""}${activeEvent.timezone !== "Not selected" ? ` (${activeEvent.timezone})` : ""}`
                            : "Date not set"}
                        />
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-black/10 py-8">
                    <h3 className="text-[20px] font-black uppercase leading-none tracking-[-0.03em] text-black">
                      {activeTab}
                    </h3>
                    <p className="mt-3 text-[13px] leading-[20px] text-black/55">
                      {activeTab === "Tickets"
                        ? "No tickets have been created for this event yet."
                        : `No ${activeTab.toLowerCase()} to show for ${activeEvent.title}.`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center text-center">
                <div>
                  <h2 className="text-[24px] font-black uppercase leading-[1.1] tracking-[-0.04em] text-black">
                    {loaded && events.length ? "No matching events" : "No events yet"}
                  </h2>
                  <p className="mt-2 text-[13px] text-black/55">
                    {loaded && events.length ? "Try another search term." : "Create your first event to see its details here."}
                  </p>
                  {!events.length ? (
                    <Button
                      type="button"
                      onClick={() => router.push("/events/create")}
                      className="mt-5 h-[38px] rounded-[3px] border border-black bg-black px-4 text-[11px] font-bold uppercase text-white"
                    >
                      + Create event
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
