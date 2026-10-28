"use client";

import { useMemo, useState } from "react";
import {
  organisationLocation,
  useGetPlatformOrganisationListQuery,
  useManageOrganisationApproveStatusMutation,
  type PlatformOrganisation,
} from "@/apis/platform/organisationsApi";
import {
  ActionMenu,
  DataTable,
  GridCard,
  StatusBadge,
  type ActionMenuItem,
  type DataTableColumn,
  type GridCardItem,
} from "@/components/common";
import { Button } from "@/components/ui/Button";

const EyeIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 12 5 5L19 7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CircleXIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="m9.5 9.5 5 5m0-5-5 5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

function orgInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "O";
}

function formatPhone(org: PlatformOrganisation) {
  const parts = [org.country_calling_code, org.phone].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

function isImageUrl(value: string | null | undefined) {
  if (!value?.trim()) return false;
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

export default function AdminOrganisationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError } = useGetPlatformOrganisationListQuery();
  const [manageApproveStatus, { isLoading: isUpdatingStatus }] =
    useManageOrganisationApproveStatusMutation();

  const organisations = data?.data ?? [];

  const overviewItems = useMemo<GridCardItem[]>(() => {
    const total = organisations.length;
    const active = organisations.filter((org) => org.approve_status).length;
    const pending = organisations.filter((org) => !org.approve_status).length;
    const incomplete = organisations.filter((org) => !org.complete_status).length;

    return [
      { label: "Total Organisations", value: String(total) },
      {
        label: "Active",
        value: String(active),
        indicatorColor: "#1a7f37",
      },
      {
        label: "Pending Approval",
        value: String(pending),
        indicatorColor: "#ff6d00",
      },
      {
        label: "Incomplete Profile",
        value: String(incomplete),
        indicatorColor: "#949494",
      },
    ];
  }, [organisations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return organisations.filter((org) => {
      const matchesSearch =
        !query ||
        [
          org.name,
          org.unique_id,
          org.organiser_name,
          org.email,
          org.city,
          org.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && Boolean(org.approve_status)) ||
        (statusFilter === "pending" && !org.approve_status);

      return matchesSearch && matchesStatus;
    });
  }, [organisations, search, statusFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  async function handleApproveStatus(org: PlatformOrganisation, approveStatus: 1 | 2) {
    try {
      await manageApproveStatus({
        organisation_id: org.id,
        approve_status: approveStatus,
      }).unwrap();
      setOpenActionId(null);
    } catch {
      // toast handled by mutation
    }
  }

  const orgActions = useMemo<ActionMenuItem<PlatformOrganisation>[]>(
    () => [
      {
        key: "view",
        label: "View details",
        icon: EyeIcon,
        onClick: () => setOpenActionId(null),
      },
      {
        key: "approve",
        label: "Approve",
        icon: CheckIcon,
        disabled: isUpdatingStatus,
        hidden: (row) => Boolean(row.approve_status),
        onClick: (row) => {
          void handleApproveStatus(row, 1);
        },
      },
      {
        key: "reject",
        label: "Reject",
        icon: CircleXIcon,
        disabled: isUpdatingStatus,
        onClick: (row) => {
          void handleApproveStatus(row, 2);
        },
      },
    ],
    [isUpdatingStatus],
  );

  const columns = useMemo<DataTableColumn<PlatformOrganisation>[]>(
    () => [
      {
        id: "organisation",
        header: "ORGANISATION",
        cell: ({ row }) => (
          <div className="flex min-w-[180px] items-center gap-3 pr-2">
            {isImageUrl(row.logo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.logo as string}
                alt=""
                className="h-10 w-10 shrink-0 rounded-[4px] object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-black text-[14px] font-bold uppercase text-white"
              >
                {orgInitial(row.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[14px] font-normal leading-5 text-black">{row.name}</p>
              <p className="truncate text-[12px] leading-4 text-[#6f6e69]">{row.unique_id}</p>
            </div>
          </div>
        ),
      },
      {
        id: "organiser",
        header: "ORGANISER DETAILS",
        cell: ({ row }) => (
          <div className="min-w-[180px]">
            <p className="text-[14px] font-normal leading-5 text-black">
              {row.organiser_name || "—"}
            </p>
            <p className="text-[12px] leading-4 text-[#6f6e69]">{row.email || "—"}</p>
          </div>
        ),
      },
      {
        id: "location",
        header: "LOCATION",
        cell: ({ row }) => (
          <span className="block max-w-[180px] text-[14px] font-normal leading-5 text-black">
            {organisationLocation(row)}
          </span>
        ),
      },
      {
        id: "phone",
        header: "PHONE",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[14px] font-normal leading-5 text-black">
            {formatPhone(row)}
          </span>
        ),
      },
      {
        id: "profile",
        header: "PROFILE",
        cell: ({ row }) => (
          <StatusBadge
            status={row.complete_status ? "active" : "draft"}
            label={row.complete_status ? "Complete" : "Incomplete"}
            className="font-heading text-[14px] font-bold leading-5"
          />
        ),
      },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => (
          <StatusBadge
            status={row.approve_status ? "active" : "draft"}
            label={row.approve_status ? "Active" : "Pending"}
            className="font-heading text-[14px] font-bold leading-5"
          />
        ),
      },
      {
        id: "actions",
        header: "ACTION",
        align: "center",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            {!row.approve_status ? (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => {
                  void handleApproveStatus(row, 1);
                }}
                className="h-8 cursor-pointer rounded-[3px] border border-black bg-black px-3 text-[12px] font-normal uppercase text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve
              </button>
            ) : (
              <button
                type="button"
                className="h-8 cursor-pointer rounded-[3px] border border-black px-3 text-[12px] font-normal uppercase text-black transition hover:bg-black hover:text-white"
              >
                View
              </button>
            )}
            <ActionMenu
              row={row}
              actions={orgActions}
              open={openActionId === row.id}
              onOpenChange={(nextOpen) => setOpenActionId(nextOpen ? row.id : null)}
              ariaLabel={`Open actions for ${row.name}`}
            />
          </div>
        ),
      },
    ],
    [isUpdatingStatus, openActionId, orgActions],
  );

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="min-h-full bg-white p-5 md:p-6 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-[11px]">
          <h1 className="font-heading text-[24px] font-bold uppercase leading-[24.2px] text-black">
            Organisations
          </h1>
          <p className="text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">
            View and manage all organisations registered on Yourlist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="inline-flex h-auto cursor-pointer items-center justify-center gap-0.5 rounded-[4px] border border-black bg-black py-2.5 pl-1.5 pr-2.5 text-[14px] font-normal uppercase leading-[19.6px] text-white transition hover:opacity-90"
          >
            <span aria-hidden className="text-[18px] leading-none">
              +
            </span>
            CREATE ORGANISATION
          </Button>
          <Button
            type="button"
            className="inline-flex h-auto cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white px-4 py-2.5 text-[14px] font-normal uppercase leading-[19.6px] text-black transition hover:bg-black hover:text-white"
          >
            EXPORT
          </Button>
        </div>
      </div>

      <div className="mt-[26px] space-y-7">
        <GridCard items={overviewItems} isLoading={isLoading} />

        <DataTable
          columns={columns}
          data={paged}
          getRowId={(row) => row.id}
          features={{
            search: true,
            filters: true,
            pagination: true,
            pageSize: true,
          }}
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              resetPage();
            },
            placeholder: "SEARCH",
          }}
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: statusFilter,
              options: [
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            resetPage();
          }}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            resetPage();
          }}
          isLoading={isLoading || isFetching}
          isError={isError}
          errorMessage="Unable to load organisations."
          emptyState={{
            title: "NO ORGANISATIONS FOUND",
            subtitle: "Try adjusting your search or filters.",
          }}
        />
      </div>
    </div>
  );
}
