"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { EventImage } from "./EventImage";
import { formatDateTime } from "./formatDateTime";
import {
  deletePublishedEvent,
  getPublishedEventsSnapshot,
  parsePublishedEvents,
  subscribeToPublishedEvents,
} from "./eventStorage";
import AttendeesTab from "./tabs/AttendeesTab";
import DetailsTab from "./tabs/DetailsTab";
import OrdersTab from "./tabs/OrdersTab";
import ReportsTab from "./tabs/ReportsTab";
import ScanEntryTab from "./tabs/ScanEntryTab";
import TicketsTab from "./tabs/TicketsTab";

const eventTabs = ["Details", "Tickets", "Orders", "Attendees", "Scan / Entry", "Reports"];

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
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-white">
        <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="border-b border-black/30 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div>
              <h1 className="text-[26px] font-black uppercase leading-[1.1] tracking-[-0.04em] text-black">Events</h1>
              <p className="mt-[10px] text-[14px] leading-[19.6px] text-[#6F6E69]">Create, manage and organize all your events.</p>
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
                aria-label="Search events"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] text-[#666666] placeholder:text-[#666666] focus:outline-none"
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
                    <span className="mt-[10px] block text-[16px] font-bold uppercase leading-none text-black">{event.title}</span>
                    <span className="my-[10px] block text-[14px] leading-[14px] text-[#666666]">{event.category}</span>
                    <span className="block text-[14px] leading-none text-black">
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
              <div key={activeEvent.id}>
                <header className="flex flex-wrap items-center gap-4 border-b border-black/30 pb-5">
                  <div className="w-[112px] shrink-0"><EventImage /></div>
                  <div className="min-w-[180px] flex-1">
                    <h2 className="text-[26px] font-black uppercase leading-[24px] text-black">{activeEvent.title}</h2>
                    <p className="my-[10px] text-[14px] text-[#6F6E69]">{activeEvent.category}</p>
                    <p className="text-[14px] leading-[18px] text-black/80">
                      {formatDateTime(activeEvent.startDateTime)}
                      {activeEvent.endDateTime ? ` - ${formatDateTime(activeEvent.endDateTime)}` : ""}
                      {activeEvent.venue !== "Not selected" ? `  •  ${activeEvent.venue}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" onClick={() => router.push("/events/create")} className="h-[34px] min-w-[74px] rounded-[3px] border border-black/55 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white">Edit</Button>
                    <Button type="button" onClick={() => handleDelete(activeEvent.id)} className="h-[34px] min-w-[74px] rounded-[3px] border border-black/55 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white">Delete</Button>
                  </div>
                </header>

                <nav aria-label="Event management" role="tablist" className="mt-4 flex gap-6 overflow-x-auto border-b border-black/10">
                  {eventTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      id={`event-tab-${tab.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      role="tab"
                      aria-selected={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 cursor-pointer border-b-2 px-2 pb-2 pt-1 text-[16px] font-bold uppercase tracking-[0.03em] transition ${
                        activeTab === tab ? "border-black text-black" : "border-transparent text-[#949494] hover:text-black"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <div id="event-panel-details" role="tabpanel" aria-labelledby="event-tab-details" hidden={activeTab !== "Details"}>
                  <DetailsTab event={activeEvent} />
                </div>
                <div id="event-panel-tickets" role="tabpanel" aria-labelledby="event-tab-tickets" hidden={activeTab !== "Tickets"}>
                  <TicketsTab eventTitle={activeEvent.title} />
                </div>
                <div id="event-panel-orders" role="tabpanel" aria-labelledby="event-tab-orders" hidden={activeTab !== "Orders"}>
                  <OrdersTab eventTitle={activeEvent.title} />
                </div>
                <div id="event-panel-attendees" role="tabpanel" aria-labelledby="event-tab-attendees" hidden={activeTab !== "Attendees"}>
                  <AttendeesTab eventTitle={activeEvent.title} />
                </div>
                <div id="event-panel-scan-entry" role="tabpanel" aria-labelledby="event-tab-scan-entry" hidden={activeTab !== "Scan / Entry"}>
                  <ScanEntryTab eventTitle={activeEvent.title} />
                </div>
                <div id="event-panel-reports" role="tabpanel" aria-labelledby="event-tab-reports" hidden={activeTab !== "Reports"}>
                  <ReportsTab eventTitle={activeEvent.title} />
                </div>
              </div>
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
                    <Button type="button" onClick={() => router.push("/events/create")} className="mt-5 h-[38px] rounded-[3px] border border-black bg-black px-4 text-[11px] font-bold uppercase text-white">
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