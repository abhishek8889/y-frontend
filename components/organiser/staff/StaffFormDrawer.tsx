"use client";

import { useEffect, useMemo, useState } from "react";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import { useGetRoleListQuery } from "@/apis/organisation/rolesApi";
import {
  staffRoleIds,
  useCreateStaffMemberMutation,
  useGetStaffMemberDetailsQuery,
  useUpdateStaffMemberMutation,
} from "@/apis/organisation/staffApi";
import { SideDrawer } from "@/components/common";
import IconCard, { STAFF_MEMBER_ICON } from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";
import { SelectBox } from "@/components/ui/SelectBox";
import { appToast } from "@/lib/ui/toast";

type StaffFormDrawerProps = {
  isOpen: boolean;
  staffId: number | null;
  onClose: () => void;
  onSaved?: () => void;
};

const COUNTRY_OPTIONS = [
  { value: "United Kingdom", label: "United Kingdom", code: "+44" },
  { value: "United States", label: "United States", code: "+1" },
  { value: "India", label: "India", code: "+91" },
  { value: "Australia", label: "Australia", code: "+61" },
];

function StaffLogo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-black bg-white">
      <IconCard name={STAFF_MEMBER_ICON} className="h-5 w-5" />
    </span>
  );
}

function countryCodeFor(country: string) {
  return COUNTRY_OPTIONS.find((option) => option.value === country)?.code ?? "+44";
}

export function StaffFormDrawer({ isOpen, staffId, onClose, onSaved }: StaffFormDrawerProps) {
  const isEdit = staffId != null;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [detailsHydratedId, setDetailsHydratedId] = useState<number | null>(null);

  const { data: rolesData, isLoading: isRolesLoading } = useGetRoleListQuery(
    { search: "", per_page: 100 },
    { skip: !isOpen },
  );

  const {
    data: detailsData,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    isFetching: isDetailsFetching,
  } = useGetStaffMemberDetailsQuery(staffId as number, {
    skip: !isOpen || staffId == null,
  });

  const [createStaff, { isLoading: isCreating }] = useCreateStaffMemberMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMemberMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const roleOptions = useMemo(
    () =>
      (rolesData?.data?.items ?? []).map((role) => ({
        id: Number(role.id),
        name: role.name,
      })),
    [rolesData?.data?.items],
  );

  const selectedRoles = useMemo(
    () => roleOptions.filter((role) => selectedRoleIds.includes(role.id)),
    [roleOptions, selectedRoleIds],
  );

  const isSaving = isCreating || isUpdating || uploadingPhoto;
  const isEditLoading =
    isEdit && (isDetailsLoading || isDetailsFetching) && detailsHydratedId !== staffId;

  useEffect(() => {
    if (!isOpen) return;
    if (staffId == null) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCountry("United Kingdom");
      setPassword("");
      setConfirmPassword("");
      setDescription("");
      setStatus("active");
      setSelectedRoleIds([]);
      setRolePickerOpen(false);
      setProfileImagePath(null);
      setProfileImageUrl(null);
      setPhotoError("");
      setDetailsHydratedId(null);
    }
  }, [isOpen, staffId]);

  useEffect(() => {
    if (!isOpen || staffId == null) {
      setDetailsHydratedId(null);
      return;
    }

    const detail = detailsData?.data;
    if (!detail || detailsHydratedId === staffId) return;
    if (detail.id != null && Number(detail.id) !== staffId) return;

    setFirstName(detail.first_name ?? "");
    setLastName(detail.last_name ?? "");
    setEmail(detail.email ?? "");
    setPhone(detail.phone ?? "");
    setCountry(detail.country?.trim() || "United Kingdom");
    setPassword("");
    setConfirmPassword("");
    setDescription(detail.description ?? "");
    setStatus(detail.status === "inactive" ? "inactive" : "active");
    setSelectedRoleIds(staffRoleIds(detail));
    setProfileImagePath(detail.profile_image ?? null);
    setProfileImageUrl(detail.profile_image_url ?? null);
    setPhotoError("");
    setDetailsHydratedId(staffId);
  }, [isOpen, staffId, detailsData?.data, detailsHydratedId]);

  function handleClose() {
    if (isSaving) return;
    onClose();
  }

  function toggleRole(roleId: number) {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  }

  async function selectPhoto(file: File | undefined) {
    if (!file) {
      setProfileImagePath(null);
      setProfileImageUrl(null);
      setPhotoError("");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoError("Choose a JPG or PNG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Photo must be 2 MB or smaller.");
      return;
    }

    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const result = await uploadMedia({ file, context: "general" }).unwrap();
      setProfileImagePath(result.data.path);
      setProfileImageUrl(result.data.url);
    } catch {
      setPhotoError("Unable to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit() {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedDescription = description.trim();

    if (!trimmedFirst || !trimmedLast) {
      appToast.error("First and last name are required.");
      return;
    }
    if (!trimmedEmail) {
      appToast.error("Email is required.");
      return;
    }
    if (!trimmedPhone) {
      appToast.error("Phone number is required.");
      return;
    }
    if (!selectedRoleIds.length) {
      appToast.error("Select at least one role.");
      return;
    }
    if (!isEdit) {
      if (!password) {
        appToast.error("Password is required.");
        return;
      }
      if (password !== confirmPassword) {
        appToast.error("Passwords do not match.");
        return;
      }
    } else if (password || confirmPassword) {
      if (password !== confirmPassword) {
        appToast.error("Passwords do not match.");
        return;
      }
    }

    const countryCode = countryCodeFor(country);

    try {
      if (isEdit && staffId != null) {
        await updateStaff({
          staffId,
          body: {
            first_name: trimmedFirst,
            last_name: trimmedLast,
            email: trimmedEmail,
            phone: trimmedPhone,
            country_code: countryCode,
            country,
            ...(password
              ? { password, confirm_password: confirmPassword }
              : {}),
            description: trimmedDescription || null,
            ...(profileImagePath ? { profile_image: profileImagePath } : {}),
            role_ids: selectedRoleIds,
            status,
          },
        }).unwrap();
      } else {
        await createStaff({
          first_name: trimmedFirst,
          last_name: trimmedLast,
          email: trimmedEmail,
          phone: trimmedPhone,
          country_code: countryCode,
          country,
          password,
          confirm_password: confirmPassword,
          role_ids: selectedRoleIds,
          status,
          ...(profileImagePath ? { profile_image: profileImagePath } : {}),
          description: trimmedDescription || null,
        }).unwrap();
      }
      onSaved?.();
      onClose();
    } catch {
      // toast handled by mutation
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit staff member" : "Add staff member"}
      subtitle="Invite and manage staff. Assign roles to control what they can access."
      logo={<StaffLogo />}
      cancelLabel="Cancel"
      onCancel={handleClose}
      submitLabel={isEdit ? "Save changes" : "Create"}
      onSubmit={() => {
        if (isSaving || isEditLoading || (isEdit && isDetailsError)) return;
        void handleSubmit();
      }}
      isSubmitting={isSaving}
      panelClassName="max-w-[640px]"
    >
      {isEditLoading ? (
        <p className="py-6 text-[13px] text-black/55">Loading staff details...</p>
      ) : null}
      {isEdit && isDetailsError ? (
        <p className="py-6 text-[13px] text-[#d32f2f]">Unable to load staff details.</p>
      ) : null}

      {!isEditLoading && !(isEdit && isDetailsError) ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <InputField
              label="First name *"
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-first-name"
              autoFocus
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Enter first name"
              density="compact"
            />
            <InputField
              label="Last name *"
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-last-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Enter last name"
              density="compact"
            />
            <InputField
              label="Email address *"
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              density="compact"
            />
            <InputField
              label="Phone number *"
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone"
              density="compact"
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                className="mb-[6px] block text-[14px] font-bold uppercase leading-[16px]"
                htmlFor="staff-country"
              >
                Country *
              </label>
              <SelectBox
                id="staff-country"
                value={country}
                options={COUNTRY_OPTIONS.map(({ value, label }) => ({ value, label }))}
                onChange={(event) => setCountry(event.target.value)}
                density="compact"
                aria-label="Country"
              />
            </div>
            <div>
              <label
                className="mb-[6px] block text-[14px] font-bold uppercase leading-[16px]"
                htmlFor="staff-status"
              >
                Status *
              </label>
              <SelectBox
                id="staff-status"
                value={status}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                onChange={(event) =>
                  setStatus(event.target.value === "inactive" ? "inactive" : "active")
                }
                density="compact"
                aria-label="Status"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <InputField
              label={isEdit ? "Password (optional)" : "Password *"}
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-password"
              type="password"
              required={!isEdit}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
              density="compact"
              autoComplete="new-password"
            />
            <InputField
              label={isEdit ? "Confirm password" : "Confirm password *"}
              labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
              id="staff-confirm-password"
              type="password"
              required={!isEdit}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              density="compact"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              className="mb-[6px] block text-[14px] font-bold uppercase leading-[16px]"
              htmlFor="staff-role-picker"
            >
              Assign role(s) *
            </label>
            <p className="mt-1 text-[11px] text-[#737b8c]">
              Select one or more roles for this staff member.
            </p>
            <div className="relative mt-1">
              <button
                id="staff-role-picker"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={rolePickerOpen}
                onClick={() => setRolePickerOpen((open) => !open)}
                className="flex h-10 w-full items-center justify-between rounded-[3px] border border-black/60 px-3 text-left text-[14px] text-[#555]"
              >
                {isRolesLoading ? "Loading roles..." : "Select role"}
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 transition-transform ${rolePickerOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="m5 7.5 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {rolePickerOpen ? (
                <div
                  role="listbox"
                  aria-label="Available roles"
                  aria-multiselectable="true"
                  className="absolute inset-x-0 top-10 z-20 max-h-48 overflow-y-auto border border-black/60 bg-white p-1 shadow-md"
                >
                  {roleOptions.length === 0 ? (
                    <p className="px-2 py-2 text-[12px] text-black/55">No roles available.</p>
                  ) : (
                    roleOptions.map((roleOption) => (
                      <label
                        key={roleOption.id}
                        className="flex cursor-pointer items-center gap-2 px-2 py-2 text-[12px] hover:bg-black/5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(roleOption.id)}
                          onChange={() => toggleRole(roleOption.id)}
                          className="h-[13px] w-[13px] accent-black"
                        />
                        {roleOption.name}
                      </label>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedRoles.map((selectedRole) => (
                <span
                  key={selectedRole.id}
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#eee] px-2.5 py-1.5 text-[11px]"
                >
                  {selectedRole.name}
                  <button
                    type="button"
                    onClick={() => toggleRole(selectedRole.id)}
                    aria-label={`Remove ${selectedRole.name}`}
                    className="font-bold leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {selectedRoleIds.length === 0 ? (
              <p role="alert" className="mt-1 text-[11px] text-red-600">
                Select at least one role.
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase">Photo (Optional)</p>
            <div className="mt-1.5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#eee] text-[15px] text-[#999]"
                style={
                  profileImageUrl
                    ? {
                        backgroundImage: `url("${profileImageUrl}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {profileImageUrl ? null : "▧"}
              </span>
              <div>
                <label className="inline-flex h-10 cursor-pointer items-center rounded-[3px] border border-black/60 px-3 text-[14px] hover:bg-black/5">
                  {uploadingPhoto ? "Uploading..." : profileImagePath ? "Change photo" : "Add photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    disabled={uploadingPhoto}
                    onChange={(event) => {
                      void selectPhoto(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-1 text-[10px] text-[#888]">
                  {photoError || (profileImagePath ? "Photo ready" : "JPG, PNG (Max 2MB)")}
                </p>
              </div>
            </div>
          </div>

          <InputField
            as="textarea"
            label="Description"
            labelClassName="!mb-[6px] !text-[14px] !leading-[16px]"
            id="staff-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Provide a short brief..."
            className="!resize-y !px-3 !py-2"
            containerClassName="!min-h-[74px]"
          />
        </div>
      ) : null}
    </SideDrawer>
  );
}
