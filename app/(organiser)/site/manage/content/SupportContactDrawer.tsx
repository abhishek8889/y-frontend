"use client";

import { useEffect, useState } from "react";
import {
  useCreateOrganisationSiteSupportContactMutation,
  useUpdateOrganisationSiteSupportContactMutation,
  type SiteSupportContactItem,
  type SiteSupportContactStatus,
} from "@/apis/organisation/siteSupportContactApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import { SideDrawer } from "@/components/common";
import { SelectField } from "@/components/ui/SelectField";

type SupportContactDrawerProps = {
  open: boolean;
  siteId: string;
  contact: SiteSupportContactItem | null;
  onClose: () => void;
  onSaved: () => void;
};

type SupportContactFormState = {
  departmentName: string;
  email: string;
  phone: string;
  status: SiteSupportContactStatus;
};

function blankForm(): SupportContactFormState {
  return {
    departmentName: "",
    email: "",
    phone: "",
    status: "active",
  };
}

function formFromContact(contact: SiteSupportContactItem): SupportContactFormState {
  return {
    departmentName: contact.department_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    status: contact.status === "inactive" ? "inactive" : "active",
  };
}

export function SupportContactDrawer({
  open,
  siteId,
  contact,
  onClose,
  onSaved,
}: SupportContactDrawerProps) {
  const [form, setForm] = useState<SupportContactFormState>(blankForm);

  const [createContact, { isLoading: isCreating }] =
    useCreateOrganisationSiteSupportContactMutation();
  const [updateContact, { isLoading: isUpdating }] =
    useUpdateOrganisationSiteSupportContactMutation();

  const isEditing = Boolean(contact);
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    setForm(contact ? formFromContact(contact) : blankForm());
  }, [open, contact]);

  function patch(partial: Partial<SupportContactFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  const canSave = form.departmentName.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSave) return;
    if (!isApiSiteId(siteId)) return;

    const departmentName = form.departmentName.trim();
    const email = form.email.trim() || null;
    const phone = form.phone.trim() || null;

    try {
      if (!isEditing || !contact) {
        await createContact({
          site_id: Number(siteId),
          department_name: departmentName,
          email,
          phone,
          status: form.status,
        }).unwrap();
      } else {
        await updateContact({
          contactId: contact.id,
          body: {
            site_id: Number(siteId),
            department_name: departmentName,
            email,
            phone,
            status: form.status,
          },
        }).unwrap();
      }

      onSaved();
      onClose();
    } catch {
      // Toast handled by mutations.
    }
  }

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      title={isEditing ? "Update support contact" : "Add support contact"}
      subtitle={
        isEditing
          ? "Update department name, email, phone, and status."
          : "Add a support contact for this microsite."
      }
      cancelLabel="Cancel"
      onCancel={onClose}
      submitLabel="Save"
      isSubmitting={isSubmitting}
      onSubmit={() => {
        void handleSubmit();
      }}
    >
      <div className="csp-news-drawer-form">
        <label>
          <span className="input-heading">Department name *</span>
          <input
            className="csp-input"
            value={form.departmentName}
            placeholder="e.g. Box office"
            disabled={isSubmitting}
            onChange={(event) => patch({ departmentName: event.target.value })}
          />
        </label>

        <label>
          <span className="input-heading">Email</span>
          <input
            className="csp-input"
            type="email"
            value={form.email}
            placeholder="support@yourclub.com"
            disabled={isSubmitting}
            onChange={(event) => patch({ email: event.target.value })}
          />
        </label>

        <label>
          <span className="input-heading">Phone</span>
          <input
            className="csp-input"
            type="tel"
            value={form.phone}
            placeholder="+44 20 0000 0000"
            disabled={isSubmitting}
            onChange={(event) => patch({ phone: event.target.value })}
          />
        </label>

        <SelectField
          id="csp-support-contact-status"
          label="Status"
          labelClassName="input-heading"
          value={form.status}
          disabled={isSubmitting}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          onChange={(event) =>
            patch({ status: event.target.value as SiteSupportContactStatus })
          }
        />
      </div>
    </SideDrawer>
  );
}
