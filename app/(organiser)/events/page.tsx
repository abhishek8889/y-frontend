"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  normalizeEventTickets,
  useGetEventCategoriesQuery,
  useGetEventTicketsQuery,
  useDuplicateEventMutation,
  useGetOrganisationEventsQuery,
  useManageEventStatusMutation,
  type EventLifecycleStatus,
  type OrganisationEvent,
} from "@/apis/events/eventsApi";
import {
  ActionMenu,
  WarningAlertIcon,
  YourlistAlert,
  type ActionMenuItem,
} from "@/components/common";
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
import { FormSectionTabs } from "@/components/organiser/FormSectionTabs";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { EventListCard } from "@/components/organiser/events/EventListCard";
import { getEventBanner } from "@/components/organiser/events/EventBannerMedia";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { formatStatusLabel } from "@/lib/ui/statusColors";
import { EventImage } from "./EventImage";
import AttendeesTab from "./tabs/AttendeesTab";
import DetailsTab from "./tabs/DetailsTab";
import OrdersTab from "./tabs/OrdersTab";
import OverviewTab from "./tabs/OverviewTab";
import RefundsTab from "./tabs/RefundsTab";
import ReportsTab from "./tabs/ReportsTab";
import TicketsTab from "./tabs/TicketsTab";

const eventTabs = [
  "Overview",
  "Details",
  "Products",
  "Orders",
  "Refunds",
  "Attendees",
  "Reports",
] as const;

type EventTab = (typeof eventTabs)[number];
const EVENTS_PAGE_SIZE = 10;

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
      className={`page-primary-button-action events-create-button ${className}`.trim()}
    >
      <span aria-hidden className="text-[18px] leading-none">
        +
      </span>
      CREATE EVENT
    </Button>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EventListFilterValues>(EVENT_LIST_FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<EventTab>("Overview");
  const [listCursor, setListCursor] = useState<string | undefined>(undefined);
  const [events, setEvents] = useState<OrganisationEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<StatusConfirmState | null>(null);
  const [detailActionsOpen, setDetailActionsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 400);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const [duplicateEvent, { isLoading: isDuplicatingEvent }] = useDuplicateEventMutation();

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

  const activeBanner = useMemo(
    () => (activeEvent ? getEventBanner(activeEvent.images) : null),
    [activeEvent],
  );

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

  const detailActions = useMemo<ActionMenuItem<OrganisationEvent>[]>(
    () => [
      {
        key: "edit",
        label: "Edit",
        onClick: (event) => {
          router.push(`/events/create?mode=edit&id=${event.id}`);
        },
      },
      {
        key: "duplicate",
        label: isDuplicatingEvent ? "Duplicating…" : "Duplicate",
        disabled: isDuplicatingEvent,
        onClick: (event) => {
          if (isDuplicatingEvent) return;
          void (async () => {
            try {
              const result = await duplicateEvent(event.id).unwrap();
              const duplicated = result.data;
              if (duplicated?.id != null) {
                setEvents((current) => {
                  const exists = current.some((item) => item.id === duplicated.id);
                  return exists ? current : [duplicated, ...current];
                });
                setActiveEventId(duplicated.id);
              }
              setListCursor(undefined);
              setNextCursor(null);
              loadMoreLockRef.current = false;
            } catch {
              // toast handled by mutation
            }
          })();
        },
      },
      {
        key: "publish",
        label: "Set Published",
        hidden: (event) => toEventLifecycleStatus(event.status) === "published",
        onClick: (event) => {
          if (toEventLifecycleStatus(event.status) === "published") return;
          setStatusConfirm({ event, status: "published" });
        },
      },
      {
        key: "draft",
        label: "Set Draft",
        hidden: (event) => toEventLifecycleStatus(event.status) === "draft",
        onClick: (event) => {
          if (toEventLifecycleStatus(event.status) === "draft") return;
          setStatusConfirm({ event, status: "draft" });
        },
      },
      {
        key: "complete",
        label: "Set Completed",
        hidden: (event) => toEventLifecycleStatus(event.status) === "completed",
        onClick: (event) => {
          if (toEventLifecycleStatus(event.status) === "completed") return;
          setStatusConfirm({ event, status: "completed" });
        },
      },
      {
        key: "cancel",
        label: "Set Cancelled",
        variant: "danger",
        hidden: (event) => toEventLifecycleStatus(event.status) === "cancelled",
        onClick: (event) => {
          if (toEventLifecycleStatus(event.status) === "cancelled") return;
          setStatusConfirm({ event, status: "cancelled" });
        },
      },
    ],
    [duplicateEvent, isDuplicatingEvent, router],
  );

  function dismissSearchFocus() {
    setSearchFocused(false);
    searchInputRef.current?.blur();
  }

  const searchAndFilterControls = (
    <>
      {searchFocused ? (
        <button
          type="button"
          aria-label="Dismiss search"
          className="fixed inset-0 z-[45] cursor-default bg-black/40"
          onMouseDown={(event) => {
            event.preventDefault();
            dismissSearchFocus();
          }}
        />
      ) : null}

      <div className={`mt-4 flex w-full min-w-0 items-center gap-2${searchFocused ? " relative z-[50]" : ""}`}>
        <label
          className={`events-search-bar${
            searchFocused ? " relative z-[50] bg-white text-black shadow-[0_0_0_1px_black]" : ""
          }`}
        >
          <button
            type="button"
            aria-label="Search"
            tabIndex={-1}
            onMouseDown={(event) => {
              event.preventDefault();
              dismissSearchFocus();
            }}
            className="flex shrink-0 cursor-pointer items-center justify-center text-current"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.6" />
              <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.preventDefault();
                dismissSearchFocus();
              }
            }}
            placeholder="Search..."
            aria-label="Search events"
          />
          {search ? (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                setSearch("");
                dismissSearchFocus();
              }}
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
        <div className="relative z-[50]">
          <EventListFilters
            values={filters}
            categoryOptions={categoryOptions}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>
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
        <div className="page-content flex min-h-[calc(100vh-72px)] flex-col">
          <div className="page-header">
            <div className="page-header-text">
              <h1 className="page-title">Events</h1>
              <p className="page-subtitle">
                Create, manage and organize all your events.
              </p>
            </div>
            <CreateEventButton onClick={goToCreate} />
          </div>

          <div className="mx-auto flex min-h-[280px] w-full max-w-[322px] flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center sm:min-h-[320px]">
            <h2 className="section-title">No Events Yet</h2>
            <p className="page-subtitle">
              Create your first event and sell tickets.
            </p>
            <CreateEventButton onClick={goToCreate} className="mt-1" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      {/* Independent list + detail scrolls; title/search stay fixed above the list */}
      <div className="bg-white lg:h-full lg:overflow-hidden">
        <div className="events-layout">
          <aside className="events-list-panel">
            <div className="shrink-0">
              <div className="page-header-text">
                <h1 className="page-title">Events</h1>
                <p className="page-subtitle">
                  Create, manage and organize all your events.
                </p>
              </div>

              <CreateEventButton onClick={goToCreate} />

              <div className="w-full min-w-0 lg:overflow-y-scroll lg:[scrollbar-gutter:stable] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
                {searchAndFilterControls}
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="mt-4 min-h-0 w-full flex-1 space-y-4 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
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

              {events.map((event) => (
                <EventListCard
                  key={event.id}
                  event={event}
                  selected={activeEvent?.id === event.id}
                  onSelect={() => {
                    setActiveEventId(event.id);
                    setDetailActionsOpen(false);
                    setActiveTab("Overview");
                  }}
                />
              ))}

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

          <section className="events-detail-panel">
            {activeEvent ? (
              <div key={activeEvent.id}>
                <header className="event-detail-header">
                  <div className="event-detail-thumb">
                    <EventImage
                      src={activeBanner?.url}
                      alt={activeEvent.name}
                      mediaType={activeBanner?.media_type}
                      mime={activeBanner?.mime}
                      path={activeBanner?.path}
                    />
                  </div>
                  <div className="event-detail-copy">
                    <div className="event-detail-copy-top">
                      <h2 className="event-detail-title">{activeEvent.name}</h2>
                      <p className="event-detail-category">
                        {activeEvent.category?.name || "Uncategorised"}
                      </p>
                    </div>
                    <p className="event-detail-meta-block">
                      <span className="event-detail-meta">{formatDateTime(activeEvent.starts_at)}</span>
                      {activeEvent.venue?.name ? (
                        <span className="event-detail-venue">
                          <span aria-hidden="true">•</span>
                          {activeEvent.venue.name}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="event-detail-actions">
                    <ActionMenu
                      row={activeEvent}
                      actions={detailActions}
                      open={detailActionsOpen}
                      onOpenChange={setDetailActionsOpen}
                      ariaLabel={`Open actions for ${activeEvent.name}`}
                    />
                  </div>
                </header>

                <FormSectionTabs
                  className="form-tabs-bar-inline"
                  tabs={eventTabs.map((tab) => ({ id: tab, label: tab }))}
                  activeTabId={activeTab}
                  ariaLabel="Event management"
                  asTablist
                  mode="button"
                  onTabSelect={(tabId) => setActiveTab(tabId as EventTab)}
                />

                <div
                  id={`event-panel-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
                  role="tabpanel"
                  aria-labelledby={`form-tab-${activeTab}`}
                >
                  {activeTab === "Overview" ? (
                    <OverviewTab
                      event={activeEvent}
                      onViewAllOrders={() => setActiveTab("Orders")}
                    />
                  ) : null}
                  {activeTab === "Details" ? (
                    <DetailsTab event={activeEvent} hasTickets={hasTickets} />
                  ) : null}
                  {activeTab === "Products" ? (
                    <TicketsTab
                      eventId={activeEvent.id}
                      eventTitle={activeEvent.name}
                      eventTimezone={activeEvent.timezone}
                    />
                  ) : null}
                  {activeTab === "Orders" ? (
                    <OrdersTab eventId={activeEvent.id} eventTitle={activeEvent.name} />
                  ) : null}
                  {activeTab === "Refunds" ? <RefundsTab eventTitle={activeEvent.name} /> : null}
                  {activeTab === "Attendees" ? (
                    <AttendeesTab eventTitle={activeEvent.name} />
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
