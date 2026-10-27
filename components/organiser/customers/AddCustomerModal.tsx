"use client";

import { useState } from "react";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

export type AddCustomerPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  entitlement: string;
  sendConfirmation: boolean;
};

type AddCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddCustomerPayload) => void;
};

function PersonAddIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M2.8 19.2c.4-3.2 2.7-5.2 6.2-5.2s5.8 2 6.2 5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17 7v6M14 10h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AddCustomerModal({ open, onClose, onSubmit }: AddCustomerModalProps) {
  const [sendConfirmation, setSendConfirmation] = useState(true);

  if (!open) return null;

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="add-customer-title"
      panelClassName="max-h-[min(860px,calc(100dvh-32px))] max-w-[560px] overflow-y-auto"
    >
      <form
        className="add-customer"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onSubmit({
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            phoneCode: String(formData.get("phoneCode") ?? "+44").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            entitlement: String(formData.get("entitlement") ?? "").trim(),
            sendConfirmation,
          });
        }}
      >
        <header className="add-customer-header">
          <div className="add-customer-heading">
            <span className="add-customer-icon">
              <PersonAddIcon />
            </span>
            <div>
              <h2 id="add-customer-title" className="add-customer-title">
                Add new customer
              </h2>
              <p className="add-customer-subtitle">Add customer details for this order.</p>
            </div>
          </div>
        </header>

        <div className="add-customer-body">
          <div className="add-customer-row">
            <InputField
              name="firstName"
              label="First Name *"
              required
              autoFocus
              placeholder="Enter first name"
              density="compact"
              containerClassName="!rounded-[4px] !border-black"
              className="!px-3 !text-[14px]"
              labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
            />
            <InputField
              name="lastName"
              label="Last Name *"
              required
              placeholder="Enter last name"
              density="compact"
              containerClassName="!rounded-[4px] !border-black"
              className="!px-3 !text-[14px]"
              labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
            />
          </div>

          <InputField
            name="email"
            type="email"
            label="Email *"
            required
            placeholder="Enter your email"
            density="compact"
            containerClassName="!rounded-[4px] !border-black"
            className="!px-3 !text-[14px]"
            labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
          />

          <div>
            <p className="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]">
              Phone Number *
            </p>
            <div className="add-customer-phone">
              <SelectField
                name="phoneCode"
                aria-label="Country code"
                density="compact"
                defaultValue="+44"
                options={[
                  { value: "+44", label: "+44" },
                  { value: "+1", label: "+1" },
                  { value: "+91", label: "+91" },
                ]}
                containerClassName="!rounded-[4px] !border-black"
                className="!px-2 !text-[13px] !font-normal normal-case"
              />
              <InputField
                name="phone"
                type="tel"
                required
                placeholder="(000) 000 - 0000"
                density="compact"
                containerClassName="!rounded-[4px] !border-black"
                className="!px-3 !text-[14px]"
              />
            </div>
          </div>

          <InputField
            name="entitlement"
            label="Entitlement"
            placeholder="Add entitlement"
            density="compact"
            containerClassName="!rounded-[4px] !border-black"
            className="!px-3 !text-[14px]"
            labelClassName="input-heading mb-1 block text-[14px] font-normal text-[#6f6e69]"
          />

          <label className="add-customer-check">
            <input
              type="checkbox"
              checked={sendConfirmation}
              onChange={(event) => setSendConfirmation(event.target.checked)}
            />
            <span className="add-customer-check-copy">
              <span className="add-customer-check-label">
                Send order confirmation to this customer
              </span>
              <span className="add-customer-check-note">
                Ticket details will be sent to the email address provided.
              </span>
            </span>
          </label>
        </div>

        <footer className="add-customer-footer">
          <button type="button" className="add-customer-btn add-customer-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="add-customer-btn add-customer-btn-primary">
            Add customer
          </button>
        </footer>
      </form>
    </OrganiserModal>
  );
}
