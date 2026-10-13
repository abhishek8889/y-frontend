"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  normalizeEventTickets,
  useGetEventCategoriesQuery,
  useGetEventTicketsQuery,
  useGetOrganisationEventsQuery,
  useManageEventStatusMutation,
  type EventLifecycleStatus,
  type OrganisationEvent,
} from "@/apis/events/eventsApi";
import { StatusBadge, WarningAlertIcon, YourlistAlert } from "@/components/common";
import {
  EVENT_LIST_FILTER_DEFAULTS,
  EventFilterButton,
  EventListFilters,
  filterDateToUtcEndsAt,
  filterDateToUtcStartsAt,
  hasActiveEventFilters,
  type EventListFilterValues,
} from "@/components/organiser/events/EventListFilters";
import { getBrowserTimeZone } from "@/components/organiser/events/eventFormHelpers";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { formatStatusLabel } from "@/lib/ui/statusColors";
import { EventImage } from "./EventImage";
import AttendeesTab from "./tabs/AttendeesTab";
import DetailsTab from "./tabs/DetailsTab";
import OrdersTab from "./tabs/OrdersTab";
import ReportsTab from "./tabs/ReportsTab";
import ScanEntryTab from "./tabs/ScanEntryTab";
import TicketsTab from "./tabs/TicketsTab";

const eventTabs = ["Details", "Tickets", "Orders", "Attendees", "Scan / Entry", "Reports"];
const EVENTS_PAGE_SIZE = 10;

const EVENT_STATUS_OPTIONS: { value: EventLifecycleStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

type StatusConfirmState = {
  event: OrganisationEvent;
  status: EventLifecycleStatus;
};

function toEventLifecycleStatus(status: string | null | undefined): EventLifecycleStatus {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "published") return "published";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  if (normalized === "completed") return "completed";
  return "draft";
}

function getStatusConfirmCopy(state: StatusConfirmState) {
  const nextLabel = formatStatusLabel(state.status);
  return {
    message: `Change status of "${state.event.name}" to ${nextLabel}?`,
    primaryButtonLabel: `SET ${nextLabel.toUpperCase()}`,
  };
}

function getBannerUrl(event: OrganisationEvent) {
  return event.images?.find((image) => image.type === "banner")?.url || event.images?.[0]?.url || "";
}

function CreateEventButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 ${className}`.trim()}
    >
      + CREATE EVENT
    </Button>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EventListFilterValues>(EVENT_LIST_FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [listCursor, setListCursor] = useState<string | undefined>(undefined);
  const [events, setEvents] = useState<OrganisationEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<StatusConfirmState | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);

  const statusFilter = filters.status === "all" ? "" : filters.status;
  const categoryFilter =
    filters.eventCategoryId === "all" ? "" : filters.eventCategoryId.trim();
  const dateFrom = filters.dateFrom.trim();
  const dateTo = filters.dateTo.trim();
  const filterTimeZone = getBrowserTimeZone();
  const startsAtUtc = useMemo(
    () => (dateFrom ? filterDateToUtcStartsAt(dateFrom, filterTimeZone) : ""),
    [dateFrom, filterTimeZone],
  );
  const endsAtUtc = useMemo(
    () => (dateTo ? filterDateToUtcEndsAt(dateTo, filterTimeZone) : ""),
    [dateTo, filterTimeZone],
  );
  const filtersActive = hasActiveEventFilters(filters);

  const { data: categoriesData } = useGetEventCategoriesQuery();
  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data ?? []).map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoriesData?.data],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetOrganisationEventsQuery({
    per_page: EVENTS_PAGE_SIZE,
    search: debouncedSearch.trim(),
    cursor: listCursor,
    status: statusFilter,
    event_category_id: categoryFilter || undefined,
    starts_at: startsAtUtc || undefined,
    ends_at: endsAtUtc || undefined,
  });
  const [manageEventStatus, { isLoading: isManagingStatus }] = useManageEventStatusMutation();

  const hasMore = Boolean(nextCursor);
  const hasSearch = Boolean(debouncedSearch.trim());
  const hasListQuery = hasSearch || filtersActive;
  const isInitialLoading = isLoading && events.length === 0;
  const isEmpty = !isInitialLoading && !isFetching && !isError && events.length === 0;
  const isLoadingMore = isFetching && events.length > 0 && Boolean(listCursor);

  // Reset list when search or filters change
  useEffect(() => {
    setListCursor(undefined);
    setEvents([]);
    setNextCursor(null);
    loadMoreLockRef.current = false;
  }, [debouncedSearch, statusFilter, categoryFilter, startsAtUtc, endsAtUtc]);

  // Append / replace pages from the cursor response
  useEffect(() => {
    const pageItems = data?.data?.items;
    if (!pageItems) return;

    setNextCursor(data.data.pagination?.next_cursor ?? null);
    setEvents((current) => {
      if (!listCursor) return pageItems;

      const seen = new Set(current.map((event) => event.id));
      const appended = pageItems.filter((event) => !seen.has(event.id));
      if (!appended.length) return current;
      return [...current, ...appended];
    });
    loadMoreLockRef.current = false;
  }, [data, listCursor]);

  useEffect(() => {
    if (!isFetching) {
      loadMoreLockRef.current = false;
    }
  }, [isFetching]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isFetching || loadMoreLockRef.current) return;
    loadMoreLockRef.current = true;

    if (listCursor === nextCursor) {
      void refetch();
      return;
    }

    setListCursor(nextCursor);
  }, [nextCursor, isFetching, listCursor, refetch]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { root, rootMargin: "160px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, events.length]);

  const activeEvent = useMemo(() => {
    if (!events.length) return null;
    if (activeEventId == null) return events[0] ?? null;
    return events.find((event) => event.id === activeEventId) ?? events[0] ?? null;
  }, [activeEventId, events]);

  const { data: ticketsData } = useGetEventTicketsQuery(activeEvent?.id as number, {
    skip: activeEvent?.id == null,
  });
  const hasTickets = normalizeEventTickets(ticketsData?.data).length > 0;

  function goToCreate() {
    router.push("/events/create");
  }

  function clearFilters() {
    setFilters(EVENT_LIST_FILTER_DEFAULTS);
  }

  function openStatusConfirm(status: EventLifecycleStatus) {
    if (!activeEvent) return;
    if (toEventLifecycleStatus(activeEvent.status) === status) return;
    setStatusConfirm({ event: activeEvent, status });
  }

  function closeStatusConfirm() {
    if (isManagingStatus) return;
    setStatusConfirm(null);
  }

  async function confirmStatusChange() {
    if (!statusConfirm) return;

    const { event, status } = statusConfirm;
    try {
      await manageEventStatus({ eventId: event.id, status }).unwrap();
      setEvents((current) =>
        current.map((item) => (item.id === event.id ? { ...item, status } : item)),
      );
      setStatusConfirm(null);
      setListCursor(undefined);
      setNextCursor(null);
      loadMoreLockRef.current = false;
    } catch {
      // toast handled by mutation
    }
  }

  const statusConfirmCopy = statusConfirm ? getStatusConfirmCopy(statusConfirm) : null;

  const searchAndFilterControls = (
    <>
      <div className="mt-4 flex items-center gap-2">
        <label className="flex h-[38px] min-w-0 flex-1 items-center gap-2 border-b border-black/35 px-2 text-black/60 focus-within:border-black">
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
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-[18px] leading-none text-black/50 hover:text-black"
            >
              ×
            </button>
          ) : null}
        </label>
        <EventFilterButton
          open={filtersOpen}
          active={filtersActive}
          onClick={() => setFiltersOpen((current) => !current)}
        />
      </div>

      {filtersOpen ? (
        <EventListFilters
          values={filters}
          categoryOptions={categoryOptions}
          onChange={setFilters}
          onClear={clearFilters}
        />
      ) : null}
    </>
  );

  if (isInitialLoading) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="min-h-full bg-white p-5 md:p-6">
          <p className="text-[14px] text-black/55">Loading events...</p>
        </div>
      </DashboardShell>
    );
  }

  if (isError && events.length === 0 && !hasListQuery) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="min-h-full bg-white p-5 md:p-6">
          <p className="text-[14px] text-[#d32f2f]">Unable to load events.</p>
        </div>
      </DashboardShell>
    );
  }

  // Truly empty account — no search/filters applied
  if (isEmpty && !hasListQuery) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="flex min-h-[calc(100vh-72px)] flex-col bg-white p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold uppercase leading-[32px] tracking-[-0.05em] text-black md:text-[32px]">
                EVENTS
              </h1>
              <p className="mt-1 text-[14px] font-normal leading-[20px] text-black/60">
                Create, manage and organize all your events.
              </p>
            </div>
            <CreateEventButton onClick={goToCreate} />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <h2 className="text-[22px] font-bold uppercase leading-[28px] tracking-[-0.03em] text-black sm:text-[28px] sm:leading-[34px]">
              NO EVENTS YET
            </h2>
            <p className="mt-2 max-w-[360px] text-[14px] font-normal leading-[20px] text-black/55 sm:text-[15px] sm:leading-[22px]">
              Create your first event and sell tickets.
            </p>
            <CreateEventButton onClick={goToCreate} className="mt-6" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-white">
        <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="border-b border-black/30 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div>
              <h1 className="text-[26px] font-black uppercase leading-[1.1] tracking-[-0.04em] text-black">
                Events
              </h1>
              <p className="mt-[10px] text-[14px] leading-[19.6px] text-[#6F6E69]">
                Create, manage and organize all your events.
              </p>
            </div>

            <CreateEventButton onClick={goToCreate} className="mt-4" />

            {searchAndFilterControls}

            <div
              ref={scrollContainerRef}
              className="mt-4 space-y-3 lg:max-h-[calc(100vh-265px)] lg:overflow-y-auto lg:pr-1"
            >
              {isError && events.length === 0 ? (
                <p className="border border-dashed border-[#d32f2f]/40 px-3 py-8 text-center text-[13px] text-[#d32f2f]">
                  Unable to load events.
                </p>
              ) : null}

              {isEmpty && hasListQuery ? (
                <div className="border border-dashed border-black/25 px-3 py-10 text-center">
                  <p className="text-[14px] font-bold uppercase text-black">No events found</p>
                  <p className="mt-2 text-[13px] leading-[18px] text-black/55">
                    Try adjusting your search or filters.
                  </p>
                  {filtersActive ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 text-[12px] font-bold uppercase underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : null}

              {events.map((event) => {
                const isActive = activeEvent?.id === event.id;
                const bannerUrl = getBannerUrl(event);

                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => setActiveEventId(event.id)}
                    aria-pressed={isActive}
                    className={`cursor-pointer block w-full border p-3 text-left transition ${
                      isActive ? "border-black bg-black/[0.025]" : "border-transparent hover:border-black/35"
                    }`}
                  >
                    <EventImage src={bannerUrl} alt={event.name} />
                    <span className="mt-[10px] block text-[16px] font-bold uppercase leading-none text-black">
                      {event.name}
                    </span>
                    <span className="my-[10px] flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] leading-[14px] text-[#666666]">
                      <span>{event.category?.name || "Uncategorised"}</span>
                      {event.status ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <StatusBadge status={event.status} className="text-[14px] leading-[14px]" />
                        </>
                      ) : null}
                    </span>
                    <span className="block text-[14px] leading-none text-black">
                      {formatDateTime(event.starts_at)}
                      {event.ends_at ? ` - ${formatDateTime(event.ends_at)}` : ""}
                    </span>
                  </button>
                );
              })}

              <div ref={loadMoreSentinelRef} className="h-1 w-full" aria-hidden="true" />

              {isLoadingMore ? (
                <p className="py-3 text-center text-[13px] text-black/50" role="status">
                  Loading more events...
                </p>
              ) : null}

              {isError && events.length > 0 ? (
                <p className="py-3 text-center text-[13px] text-[#d32f2f]" role="alert">
                  Couldn&apos;t load more events.
                </p>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0 p-5 md:p-7">
            {activeEvent ? (
              <div key={activeEvent.id}>
                <header className="flex flex-wrap items-center gap-4 border-b border-black/30 pb-5">
                  <div className="w-[112px] shrink-0">
                    <EventImage src={getBannerUrl(activeEvent)} alt={activeEvent.name} />
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <h2 className="text-[26px] font-black uppercase leading-[24px] text-black">
                      {activeEvent.name}
                    </h2>
                    <p className="my-[10px] flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-[#6F6E69]">
                      <span>{activeEvent.category?.name || "Uncategorised"}</span>
                      {activeEvent.status ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <StatusBadge status={activeEvent.status} className="text-[14px]" />
                        </>
                      ) : null}
                    </p>
                    <p className="text-[14px] leading-[18px] text-black/80">
                      {formatDateTime(activeEvent.starts_at)}
                      {activeEvent.ends_at ? ` - ${formatDateTime(activeEvent.ends_at)}` : ""}
                      {activeEvent.venue?.name ? `  •  ${activeEvent.venue.name}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <SelectField
                      name="eventLifecycleStatus"
                      aria-label="Event status"
                      value={toEventLifecycleStatus(activeEvent.status)}
                      disabled={isManagingStatus}
                      onChange={(event) => {
                        openStatusConfirm(event.target.value as EventLifecycleStatus);
                      }}
                      options={EVENT_STATUS_OPTIONS}
                      density="compact"
                      wrapperClassName="!gap-0"
                      containerClassName="!h-[34px] min-w-[140px] !rounded-[3px] !border-black/55"
                      className="!rounded-[3px] !border-black/55 !px-2 !pr-9 !text-[10px] !font-bold uppercase"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        router.push(`/events/create?mode=edit&id=${activeEvent.id}`)
                      }
                      className="h-[34px] min-w-[74px] rounded-[3px] border border-black/55 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white"
                    >
                      Edit
                    </Button>
                  </div>
                </header>

                <nav
                  aria-label="Event management"
                  role="tablist"
                  className="mt-4 flex gap-6 overflow-x-auto border-b border-black/10"
                >
                  {eventTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      id={`event-tab-${tab.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      role="tab"
                      aria-selected={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 cursor-pointer border-b-2 px-2 pb-2 pt-1 text-[16px] font-bold uppercase tracking-[0.03em] transition ${
                        activeTab === tab
                          ? "border-black text-black"
                          : "border-transparent text-[#949494] hover:text-black"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <div
                  id={`event-panel-${activeTab.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  role="tabpanel"
                  aria-labelledby={`event-tab-${activeTab.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                >
                  {activeTab === "Details" ? (
                    <DetailsTab event={activeEvent} hasTickets={hasTickets} />
                  ) : null}
                  {activeTab === "Tickets" ? (
                    <TicketsTab
                      eventId={activeEvent.id}
                      eventTitle={activeEvent.name}
                      eventTimezone={activeEvent.timezone}
                    />
                  ) : null}
                  {activeTab === "Orders" ? <OrdersTab eventTitle={activeEvent.name} /> : null}
                  {activeTab === "Attendees" ? (
                    <AttendeesTab eventTitle={activeEvent.name} />
                  ) : null}
                  {activeTab === "Scan / Entry" ? (
                    <ScanEntryTab eventTitle={activeEvent.name} />
                  ) : null}
                  {activeTab === "Reports" ? <ReportsTab eventTitle={activeEvent.name} /> : null}
                </div>
              </div>
            ) : isEmpty && hasListQuery ? (
              <div className="flex h-full min-h-[240px] items-center justify-center text-center">
                <p className="max-w-[280px] text-[14px] leading-[20px] text-black/55">
                  Select different filters or clear them to see events here.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <YourlistAlert
        isOpen={Boolean(statusConfirm)}
        onClose={closeStatusConfirm}
        title="ARE YOU SURE?"
        message={statusConfirmCopy?.message}
        icon={<WarningAlertIcon />}
        variant="warning"
        showFooter
        secondaryButtonLabel="CANCEL"
        onSecondaryClick={closeStatusConfirm}
        primaryButtonLabel={statusConfirmCopy?.primaryButtonLabel}
        onPrimaryClick={() => {
          void confirmStatusChange();
        }}
        isSubmitting={isManagingStatus}
      />
    </DashboardShell>
  );
}
