"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCreateCustomFacilityMutation,
  useDeleteCustomFacilityMutation,
  useGetVenueFacilitiesQuery,
  type VenueFacility,
} from "@/apis/organisation/venuesApi";
import { SideDrawer } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { appToast } from "@/lib/ui/toast";
import { toggleNumberInList } from "@/components/organiser/venues/venueFormHelpers";

type SelectFacilitiesDrawerProps = {
  isOpen: boolean;
  selectedFacilityIds: number[];
  onClose: () => void;
  onSave: (facilityIds: number[]) => void;
  /** Removes a deleted custom facility from the parent form without committing other draft changes. */
  onFacilityDeleted?: (facilityId: number) => void;
};

function isCustomFacility(facility: VenueFacility) {
  return facility.organisation_id != null;
}

function FacilitiesLogo() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-black text-white"
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 10h16v10H4V10Zm2-6h4v4H6V4Zm6 0h4v4h-4V4Zm6 0h2v4h-2V4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function DeleteFacilityIcon({ busy }: { busy?: boolean }) {
  if (busy) {
    return (
      <span className="inline-block h-5 w-5 animate-pulse rounded-full border-2 border-black/40 border-t-transparent" />
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5h6v2m-7 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectFacilitiesDrawer({
  isOpen,
  selectedFacilityIds,
  onClose,
  onSave,
  onFacilityDeleted,
}: SelectFacilitiesDrawerProps) {
  const { data: facilitiesData } = useGetVenueFacilitiesQuery(undefined, { skip: !isOpen });
  const [createCustomFacility, { isLoading: isCreating }] = useCreateCustomFacilityMutation();
  const [deleteCustomFacility] = useDeleteCustomFacilityMutation();

  const facilities = facilitiesData?.data ?? [];
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const [customName, setCustomName] = useState("");
  const [deletingFacilityId, setDeletingFacilityId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraftIds(selectedFacilityIds);
    setCustomName("");
    setDeletingFacilityId(null);
  }, [isOpen, selectedFacilityIds]);

  const sortedFacilities = useMemo(
    () => [...facilities].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [facilities],
  );

  function handleToggle(facilityId: number) {
    setDraftIds((current) => toggleNumberInList(current, facilityId));
  }

  async function handleAddCustom() {
    const name = customName.trim();
    if (!name) {
      appToast.error("Facility name is required.");
      return;
    }

    const duplicate = facilities.some(
      (facility) => facility.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      appToast.error("This facility already exists.");
      return;
    }

    try {
      const result = await createCustomFacility({ name }).unwrap();
      const created = result.data as VenueFacility;
      setDraftIds((current) => (current.includes(created.id) ? current : [...current, created.id]));
      setCustomName("");
    } catch {
      // toast handled by mutation
    }
  }

  async function handleDeleteCustom(facility: VenueFacility) {
    if (!isCustomFacility(facility) || deletingFacilityId != null) return;

    setDeletingFacilityId(facility.id);
    try {
      await deleteCustomFacility(facility.id).unwrap();
      setDraftIds((current) => current.filter((id) => id !== facility.id));
      onFacilityDeleted?.(facility.id);
    } catch {
      // toast handled by mutation; keep facility visible
    } finally {
      setDeletingFacilityId(null);
    }
  }

  function handleCancel() {
    setDraftIds(selectedFacilityIds);
    setCustomName("");
    setDeletingFacilityId(null);
    onClose();
  }

  function handleSave() {
    onSave(draftIds);
    onClose();
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title="Select Facilities"
      subtitle="Select the facilities available at your venue OR add a custom facility."
      logo={<FacilitiesLogo />}
      cancelLabel="Cancel"
      onCancel={handleCancel}
      submitLabel="Save Facilities"
      onSubmit={handleSave}
      isSubmitting={isCreating || deletingFacilityId != null}
    >
      <div className="space-y-6">
        <div>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {sortedFacilities.map((facility) => {
              const checked = draftIds.includes(facility.id);
              const canDelete = isCustomFacility(facility);
              const isDeleting = deletingFacilityId === facility.id;

              return (
                <div key={facility.id} className="flex min-w-0 items-center gap-2">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-[15px] text-black">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(facility.id)}
                      disabled={isDeleting}
                      className="h-4 w-4 shrink-0 rounded-[2px] border border-black accent-black"
                    />
                    <span className="truncate">{facility.name}</span>
                  </label>

                  {canDelete ? (
                    <button
                      type="button"
                      aria-label={`Delete ${facility.name}`}
                      disabled={deletingFacilityId != null}
                      onClick={() => void handleDeleteCustom(facility)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-black/70 transition hover:bg-black/5 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <DeleteFacilityIcon busy={isDeleting} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {sortedFacilities.length === 0 ? (
            <p className="text-[14px] text-black/55">No facilities available yet.</p>
          ) : null}
        </div>

        <div className="border-t border-black/30 pt-5">
          <h3 className="text-[16px] font-bold uppercase tracking-[0.04em] text-black">
            Add Custom Facility
          </h3>
          <p className="mt-1 text-[14px] leading-[20px] text-[#6E6B69]">
            Add any additional facility that is not listed above.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <InputField
                name="customFacilityName"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Enter facility name (e.g. Baby Changing Area)"
                className="text-[14px] placeholder:text-black/45"
                containerClassName="rounded-[4px] border-black"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddCustom();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              disabled={isCreating || deletingFacilityId != null}
              onClick={() => void handleAddCustom()}
              className="h-[48px] shrink-0 rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black disabled:opacity-60"
            >
              {isCreating ? "Adding..." : "+ Add"}
            </Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
