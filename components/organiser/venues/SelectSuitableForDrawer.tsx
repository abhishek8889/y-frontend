"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCreateCustomSuitableForOptionMutation,
  useDeleteCustomSuitableForOptionMutation,
  useGetVenueSuitableForOptionsQuery,
  type VenueSuitableForOption,
} from "@/apis/organisation/venuesApi";
import { SideDrawer } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { appToast } from "@/lib/ui/toast";
import { toggleNumberInList } from "@/components/organiser/venues/venueFormHelpers";

type SelectSuitableForDrawerProps = {
  isOpen: boolean;
  selectedOptionIds: number[];
  onClose: () => void;
  onSave: (optionIds: number[]) => void;
  /** Removes a deleted custom option from the parent form without committing other draft changes. */
  onOptionDeleted?: (optionId: number) => void;
};

function isCustomOption(option: VenueSuitableForOption) {
  return option.organisation_id != null;
}

function SuitableForLogo() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-black text-white"
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 7h8M8 12h8M8 17h5M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function DeleteOptionIcon({ busy }: { busy?: boolean }) {
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

export function SelectSuitableForDrawer({
  isOpen,
  selectedOptionIds,
  onClose,
  onSave,
  onOptionDeleted,
}: SelectSuitableForDrawerProps) {
  const { data: optionsData } = useGetVenueSuitableForOptionsQuery(undefined, { skip: !isOpen });
  const [createCustomOption, { isLoading: isCreating }] = useCreateCustomSuitableForOptionMutation();
  const [deleteCustomOption] = useDeleteCustomSuitableForOptionMutation();

  const options = optionsData?.data ?? [];
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const [customName, setCustomName] = useState("");
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraftIds(selectedOptionIds);
    setCustomName("");
    setDeletingOptionId(null);
  }, [isOpen, selectedOptionIds]);

  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [options],
  );

  function handleToggle(optionId: number) {
    setDraftIds((current) => toggleNumberInList(current, optionId));
  }

  async function handleAddCustom() {
    const name = customName.trim();
    if (!name) {
      appToast.error("Option name is required.");
      return;
    }

    const duplicate = options.some((option) => option.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      appToast.error("This option already exists.");
      return;
    }

    try {
      const result = await createCustomOption({ name }).unwrap();
      const created = result.data;
      setDraftIds((current) => (current.includes(created.id) ? current : [...current, created.id]));
      setCustomName("");
    } catch {
      // toast handled by mutation
    }
  }

  async function handleDeleteCustom(option: VenueSuitableForOption) {
    if (!isCustomOption(option) || deletingOptionId != null) return;

    setDeletingOptionId(option.id);
    try {
      await deleteCustomOption(option.id).unwrap();
      setDraftIds((current) => current.filter((id) => id !== option.id));
      onOptionDeleted?.(option.id);
    } catch {
      // toast handled by mutation; keep option visible
    } finally {
      setDeletingOptionId(null);
    }
  }

  function handleCancel() {
    setDraftIds(selectedOptionIds);
    setCustomName("");
    setDeletingOptionId(null);
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
      title="Select Suitable For"
      subtitle="Select what this venue is suitable for OR add a custom option."
      logo={<SuitableForLogo />}
      cancelLabel="Cancel"
      onCancel={handleCancel}
      submitLabel="Save Options"
      onSubmit={handleSave}
      isSubmitting={isCreating || deletingOptionId != null}
    >
      <div className="space-y-6">
        <div>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {sortedOptions.map((option) => {
              const checked = draftIds.includes(option.id);
              const canDelete = isCustomOption(option);
              const isDeleting = deletingOptionId === option.id;

              return (
                <div key={option.id} className="flex min-w-0 items-center gap-2">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-[15px] text-black">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(option.id)}
                      disabled={isDeleting}
                      className="h-4 w-4 shrink-0 rounded-[2px] border border-black accent-black"
                    />
                    <span className="truncate">{option.name}</span>
                  </label>

                  {canDelete ? (
                    <button
                      type="button"
                      aria-label={`Delete ${option.name}`}
                      disabled={deletingOptionId != null}
                      onClick={() => void handleDeleteCustom(option)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-black/70 transition hover:bg-black/5 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <DeleteOptionIcon busy={isDeleting} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {sortedOptions.length === 0 ? (
            <p className="text-[14px] text-black/55">No suitable-for options available yet.</p>
          ) : null}
        </div>

        <div className="border-t border-black/30 pt-5">
          <h3 className="text-[16px] font-bold uppercase tracking-[0.04em] text-black">
            Add Custom Option
          </h3>
          <p className="mt-1 text-[14px] leading-[20px] text-[#6E6B69]">
            Add any additional option that is not listed above.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <InputField
                name="customSuitableForName"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Enter option name (e.g. Film Screenings)"
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
              disabled={isCreating || deletingOptionId != null}
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
