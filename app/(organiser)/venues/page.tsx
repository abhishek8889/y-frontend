"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDeleteVenueMutation,
  useDuplicateVenueMutation,
  useGetVenuePageOverviewQuery,
  useGetVenueTypesQuery,
  useGetVenuesQuery,
  useLazyGetVenueDetailsQuery,
  useUpdateVenueMutation,
  type Venue,
} from "@/apis/organisation/venuesApi";
import {
  ActionMenu,
  DataTable,
  GridCard,
  WarningAlertIcon,
  YourlistAlert,
  type ActionMenuItem,
  type DataTableColumn,
  type GridCardItem,
} from "@/components/common";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { buildVenuePayload, mapVenueToFormValues } from "@/components/organiser/venues/venueFormHelpers";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

type VenueConfirmAction = "delete" | "duplicate" | "deactivate" | "activate";

type VenueConfirmState = {
  action: VenueConfirmAction;
  venue: Venue;
};

function formatVenueLocation(venue: Venue) {
  const address = venue.address;
  if (!address) return "—";
  return [address.address_line_1, address.city, address.postal_code].filter(Boolean).join(", ") || "—";
}

function formatVenueCapacity(venue: Venue) {
  const lines = [
    venue.maximum_capacity != null ? `Maximum - ${venue.maximum_capacity}` : null,
    venue.standing_capacity != null ? `Standing - ${venue.standing_capacity}` : null,
    venue.seated_capacity != null ? `Seated - ${venue.seated_capacity}` : null,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}

function getVenueImageUrl(venue: Venue) {
  const banner = venue.images?.find((image) => image.type === "banner");
  return banner?.url || venue.images?.[0]?.url || "";
}

// const EyeIcon = (
//   <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
//     <path
//       d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
//       stroke="currentColor"
//       strokeWidth="1.6"
//     />
//     <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
//   </svg>
// );

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M13 6.5 17.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CopyIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6 15V6.5A1.5 1.5 0 0 1 7.5 5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CircleXIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path d="m9.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16M9 7V5h6v2m-7 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function getConfirmCopy(state: VenueConfirmState) {
  const name = state.venue.name;

  switch (state.action) {
    case "delete":
      return {
        title: "ARE YOU SURE?",
        message: `Delete "${name}"? This action cannot be undone.`,
        primaryButtonLabel: "DELETE VENUE",
        variant: "warning" as const,
      };
    case "duplicate":
      return {
        title: "ARE YOU SURE?",
        message: `Duplicate "${name}"? A copy of this venue will be created.`,
        primaryButtonLabel: "DUPLICATE VENUE",
        variant: "warning" as const,
      };
    case "activate":
      return {
        title: "ARE YOU SURE?",
        message: `Activate "${name}"? It will become available again.`,
        primaryButtonLabel: "ACTIVATE VENUE",
        variant: "warning" as const,
      };
    case "deactivate":
    default:
      return {
        title: "ARE YOU SURE?",
        message: `Deactivate "${name}"? It will be marked as inactive.`,
        primaryButtonLabel: "DEACTIVATE VENUE",
        variant: "warning" as const,
      };
  }
}

export default function VenuesPage() {
  const router = useRouter();
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<VenueConfirmState | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [venueTypeId, setVenueTypeId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: venueTypesData } = useGetVenueTypesQuery();
  const { data: overviewData } = useGetVenuePageOverviewQuery();
  const [deleteVenue, { isLoading: isDeletingVenue }] = useDeleteVenueMutation();
  const [duplicateVenue, { isLoading: isDuplicatingVenue }] = useDuplicateVenueMutation();
  const [updateVenue, { isLoading: isUpdatingVenue }] = useUpdateVenueMutation();
  const [fetchVenueDetails, { isFetching: isFetchingVenueDetails }] = useLazyGetVenueDetailsQuery();
  const { data, isLoading, isFetching, isError } = useGetVenuesQuery({
    per_page: pageSize,
    status: status === "all" ? "" : status,
    search: debouncedSearch.trim(),
    venue_type_id: venueTypeId === "all" ? undefined : venueTypeId,
    cursor,
  });

  const isConfirmSubmitting =
    isDeletingVenue || isDuplicatingVenue || isUpdatingVenue || isFetchingVenueDetails;
  const confirmCopy = confirmState ? getConfirmCopy(confirmState) : null;

  const venues = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const venueTypes = venueTypesData?.data ?? [];
  const overview = overviewData?.data;

  const overviewItems = useMemo<GridCardItem[]>(
    () => [
      {
        id: "total",
        label: "Total venues",
        value: overview?.total_venue ?? 0,
      },
      {
        id: "active",
        label: "Active",
        value: overview?.active_venue ?? 0,
        indicatorColor: "#24b26b",
      },
      {
        id: "inactive",
        label: "Inactive",
        value: overview?.inactive_venue ?? 0,
        indicatorColor: "#ff3a3a",
      }
    ],
    [overview?.active_venue, overview?.inactive_venue, overview?.total_venue],
  );

  const venueTypeOptions = useMemo(
    () => [
      { value: "all", label: "Venue Type" },
      ...venueTypes.map((type) => ({
        value: String(type.id),
        label: type.name,
      })),
    ],
    [venueTypes],
  );

  function openConfirm(action: VenueConfirmAction, venue: Venue) {
    setOpenActionId(null);
    setConfirmState({ action, venue });
  }

  function closeConfirm() {
    if (isConfirmSubmitting) return;
    setConfirmState(null);
  }

  async function handleConfirmPrimary() {
    if (!confirmState) return;

    const { action, venue } = confirmState;

    try {
      if (action === "delete") {
        await deleteVenue(venue.id).unwrap();
      } else if (action === "duplicate") {
        await duplicateVenue(venue.id).unwrap();
      } else if (action === "activate" || action === "deactivate") {
        const details = await fetchVenueDetails(venue.id).unwrap();
        const formValues = mapVenueToFormValues(details.data);
        const payload = buildVenuePayload(
          formValues,
          action === "activate" ? "active" : "inactive",
        );
        await updateVenue({ venueId: venue.id, body: payload }).unwrap();
      }
      setConfirmState(null);
    } catch {
      // Toast handled by venuesApi mutation
    }
  }

  const venueActions = useMemo<ActionMenuItem<Venue>[]>(
    () => [
      // {
      //   key: "view",
      //   label: "View Venue",
      //   icon: EyeIcon,
      //   variant: "link",
      //   onClick: (venue) => {
      //     router.push(`/venues/create?mode=edit&id=${venue.id}`);
      //   },
      // },
      {
        key: "edit",
        label: "Edit",
        icon: PencilIcon,
        onClick: (venue) => {
          router.push(`/venues/create?mode=edit&id=${venue.id}`);
        },
      },
      {
        key: "duplicate",
        label: "Duplicate",
        icon: CopyIcon,
        disabled: isConfirmSubmitting,
        onClick: (venue) => {
          openConfirm("duplicate", venue);
        },
      },
      {
        key: "deactivate",
        label: "Deactivate venue",
        icon: CircleXIcon,
        disabled: isConfirmSubmitting,
        hidden: (venue) => venue.status !== "active",
        onClick: (venue) => {
          openConfirm("deactivate", venue);
        },
      },
      {
        key: "activate",
        label: "Activate venue",
        icon: CircleXIcon,
        disabled: isConfirmSubmitting,
        hidden: (venue) => venue.status === "active",
        onClick: (venue) => {
          openConfirm("activate", venue);
        },
      },
      {
        key: "delete",
        label: "Delete",
        icon: TrashIcon,
        disabled: isConfirmSubmitting,
        onClick: (venue) => {
          openConfirm("delete", venue);
        },
      },
    ],
    [isConfirmSubmitting, router],
  );

  const columns = useMemo<DataTableColumn<Venue>[]>(
    () => [
      {
        id: "name",
        header: "Venue",
        accessorKey: "name",
        cell: ({ row }) => {
          const imageUrl = getVenueImageUrl(row);
          return (
            <div className="flex items-center gap-3 pr-3">
              <div
                className="h-[52px] w-[80px] border border-black/80 bg-cover bg-center bg-[#dfe9dc]"
                style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
                role="img"
                aria-label={row.name}
              />
              <span className="text-[14px] font-medium leading-[18px] text-black">{row.name}</span>
            </div>
          );
        },
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => formatVenueLocation(row),
      },
      {
        id: "type",
        header: "Venue Type",
        cell: ({ row }) => row.venue_type?.name || "—",
      },
      {
        id: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
          <span className="whitespace-pre-line text-[13px] leading-[18px] text-black">
            {formatVenueCapacity(row)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.status === "active";
          return (
            <span
              className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
                isActive ? "text-[#24b26b]" : "text-[#ff3a3a]"
              }`}
            >
              <span
                className="mr-2 inline-block h-[7px] w-[7px] rounded-full align-middle"
                style={{ backgroundColor: isActive ? "#24b26b" : "#ff3a3a" }}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        align: "right",
        headerClassName: "text-right",
        cell: ({ row }) => (
          <ActionMenu
            row={row}
            actions={venueActions}
            open={openActionId === row.id}
            onOpenChange={(nextOpen) => setOpenActionId(nextOpen ? row.id : null)}
            ariaLabel={`Open actions for ${row.name}`}
          />
        ),
      },
    ],
    [openActionId, venueActions],
  );

  function resetCursorAndPage() {
    setCursor(undefined);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage > page && pagination?.next_cursor) {
      setCursor(pagination.next_cursor);
      setPage(nextPage);
      return;
    }

    if (nextPage < page && pagination?.prev_cursor) {
      setCursor(pagination.prev_cursor);
      setPage(nextPage);
    }
  }

  const canGoNext = Boolean(pagination?.next_cursor) || Boolean(pagination?.has_more);
  const canGoPrev = Boolean(pagination?.prev_cursor) || page > 1;
  const paginationTotal = canGoNext ? page * pageSize + 1 : (page - 1) * pageSize + venues.length;

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="min-h-full bg-[#fff] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold uppercase leading-[32px] tracking-[-0.05em] text-black md:text-[32px]">
              VENUES
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[20px] text-black/60">
              Manage and organize all your venues
            </p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/venues/create")}
            className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90"
          >
            + CREATE VENUE
          </Button>
        </div>

        <div className="space-y-7 py-5">
          <GridCard items={overviewItems} columns={3} />

          <DataTable
            columns={columns}
            data={venues}
            getRowId={(row) => row.id}
            search={{
              value: search,
              onChange: (value) => {
                setSearch(value);
                resetCursorAndPage();
              },
              placeholder: "SEARCH",
            }}
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                value: status,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
              {
                key: "venueType",
                label: "Venue Type",
                type: "select",
                value: venueTypeId,
                options: venueTypeOptions,
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status") setStatus(value);
              if (key === "venueType") setVenueTypeId(value);
              resetCursorAndPage();
            }}
            pagination={{
              page,
              pageSize,
              total: paginationTotal,
            }}
            onPageChange={(nextPage) => {
              if (nextPage > page && !canGoNext) return;
              if (nextPage < page && !canGoPrev) return;
              handlePageChange(nextPage);
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              resetCursorAndPage();
            }}
            isLoading={isLoading || isFetching}
            isError={isError}
            errorMessage="Unable to load venues."
            emptyMessage="No venues found."
          />
        </div>
      </div>

      <YourlistAlert
        isOpen={Boolean(confirmState)}
        onClose={closeConfirm}
        title={confirmCopy?.title ?? "ARE YOU SURE?"}
        message={confirmCopy?.message}
        icon={<WarningAlertIcon />}
        variant={confirmCopy?.variant ?? "warning"}
        showFooter
        secondaryButtonLabel="CANCEL"
        onSecondaryClick={closeConfirm}
        primaryButtonLabel={confirmCopy?.primaryButtonLabel}
        onPrimaryClick={() => {
          void handleConfirmPrimary();
        }}
        isSubmitting={isConfirmSubmitting}
      />
    </DashboardShell>
  );
}
