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
import { SelectField } from "@/components/ui/SelectField";
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
    <span className="staff-form-logo">
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
      panelClassName="!max-w-[640px]"
    >
      {isEditLoading ? (
        <p className="staff-form-state">Loading staff details...</p>
      ) : null}
      {isEdit && isDetailsError ? (
        <p className="staff-form-state staff-form-state-error">Unable to load staff details.</p>
      ) : null}

      {!isEditLoading && !(isEdit && isDetailsError) ? (
        <div className="staff-form">
          <div className="staff-form-row">
            <InputField
              label="First name *"
              id="staff-first-name"
              autoFocus
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Enter first name"
              labelClassName="input-heading"
            />
            <InputField
              label="Last name *"
              id="staff-last-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Enter last name"
              labelClassName="input-heading"
            />
            <InputField
              label="Email address *"
              id="staff-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              labelClassName="input-heading"
            />
            <InputField
              label="Phone number *"
              id="staff-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone"
              labelClassName="input-heading"
            />
          </div>

          <div className="staff-form-row">
            <SelectField
              id="staff-country"
              label="Country *"
              labelClassName="input-heading"
              value={country}
              options={COUNTRY_OPTIONS.map(({ value, label }) => ({ value, label }))}
              onChange={(event) => setCountry(event.target.value)}
              aria-label="Country"
            />
            <SelectField
              id="staff-status"
              label="Status *"
              labelClassName="input-heading"
              value={status}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              onChange={(event) =>
                setStatus(event.target.value === "inactive" ? "inactive" : "active")
              }
              aria-label="Status"
            />
          </div>

          <div className="staff-form-row">
            <InputField
              label={isEdit ? "Password (optional)" : "Password *"}
              id="staff-password"
              type="password"
              required={!isEdit}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
              labelClassName="input-heading"
              autoComplete="new-password"
            />
            <InputField
              label={isEdit ? "Confirm password" : "Confirm password *"}
              id="staff-confirm-password"
              type="password"
              required={!isEdit}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              labelClassName="input-heading"
              autoComplete="new-password"
            />
          </div>

          <div className="staff-role-field">
            <label className="input-heading" htmlFor="staff-role-picker">
              Assign role(s) *
            </label>
            <p className="staff-form-helper">
              Select one or more roles for this staff member.
            </p>
            <div className="staff-role-picker">
              <button
                id="staff-role-picker"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={rolePickerOpen}
                onClick={() => setRolePickerOpen((open) => !open)}
                className="staff-role-trigger"
              >
                {isRolesLoading ? "Loading roles..." : "Select role"}
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className={`staff-role-chevron ${rolePickerOpen ? "staff-role-chevron-open" : ""}`}
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
                  className="staff-role-menu"
                >
                  {roleOptions.length === 0 ? (
                    <p className="staff-form-state">No roles available.</p>
                  ) : (
                    roleOptions.map((roleOption) => (
                      <label key={roleOption.id} className="staff-role-option">
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(roleOption.id)}
                          onChange={() => toggleRole(roleOption.id)}
                        />
                        {roleOption.name}
                      </label>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <div className="staff-role-chips">
              {selectedRoles.map((selectedRole) => (
                <span key={selectedRole.id} className="staff-role-chip">
                  {selectedRole.name}
                  <button
                    type="button"
                    onClick={() => toggleRole(selectedRole.id)}
                    aria-label={`Remove ${selectedRole.name}`}
                    className="staff-role-chip-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {selectedRoleIds.length === 0 ? (
              <p role="alert" className="staff-form-error">
                Select at least one role.
              </p>
            ) : null}
          </div>

          <div className="staff-photo-field">
            <p className="staff-form-section-label">Photo (Optional)</p>
            <div className="staff-photo-row">
              <span
                aria-hidden="true"
                className="staff-photo-preview"
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
                <label className="staff-photo-button">
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
                <p className="staff-form-helper">
                  {photoError || (profileImagePath ? "Photo ready" : "JPG, PNG (Max 2MB)")}
                </p>
              </div>
            </div>
          </div>

          <InputField
            as="textarea"
            label="Description"
            id="staff-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Provide a short brief..."
            labelClassName="input-heading"
            containerClassName="staff-form-textarea"
          />
        </div>
      ) : null}
    </SideDrawer>
  );
}
