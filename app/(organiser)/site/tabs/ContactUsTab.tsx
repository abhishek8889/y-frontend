"use client";

import { useState, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

const defaultContactFields = [
  { id: "firstName", label: "First Name", included: true, required: true },
  { id: "lastName", label: "Last Name", included: true, required: true },
  { id: "email", label: "Email", included: true, required: true },
  { id: "address", label: "Address", included: true, required: false },
  { id: "mobilePhone", label: "Mobile Phone", included: true, required: false },
  { id: "gender", label: "Gender", included: true, required: true },
  { id: "subject", label: "Subject", included: true, required: true },
  { id: "message", label: "Message", included: true, required: true },
] as const;

type ContactField = {
  id: (typeof defaultContactFields)[number]["id"];
  label: string;
  included: boolean;
  required: boolean;
};

type ContactDraft = {
  title: string;
  subtitle: string;
  deliveryEmail: string;
  fields: ContactField[];
};

const initialContactDraft: ContactDraft = {
  title: "",
  subtitle: "",
  deliveryEmail: "",
  fields: defaultContactFields.map((field) => ({ ...field })),
};

function ContactSwitch({
  label,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`site-switch${checked ? " site-switch-on" : ""}`}
    >
      <span aria-hidden="true" className="site-switch-knob" />
    </button>
  );
}

export default function ContactUsTab() {
  const [draft, setDraft] = useState<ContactDraft>(() => ({
    ...initialContactDraft,
    fields: initialContactDraft.fields.map((field) => ({ ...field })),
  }));
  const [savedDraft, setSavedDraft] = useState<ContactDraft>(() => ({
    ...initialContactDraft,
    fields: initialContactDraft.fields.map((field) => ({ ...field })),
  }));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function updateText(field: "title" | "subtitle" | "deliveryEmail", value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setNotice("");
    setError("");
  }

  function toggleField(fieldId: ContactField["id"], setting: "included" | "required") {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) => {
        if (field.id !== fieldId) return field;
        if (setting === "included") {
          const included = !field.included;
          return { ...field, included, required: included && field.required };
        }
        return { ...field, required: !field.required };
      }),
    }));
    setNotice("");
  }

  function saveContactPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const deliveryEmail = draft.deliveryEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)) {
      setError("Enter a valid email where contact form submissions should be delivered.");
      return;
    }
    const nextSaved = {
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      deliveryEmail,
      fields: draft.fields.map((field) => ({ ...field })),
    };
    setDraft(nextSaved);
    setSavedDraft(nextSaved);
    setError("");
    setNotice("Contact page saved.");
  }

  function cancelChanges() {
    setDraft({
      ...savedDraft,
      fields: savedDraft.fields.map((field) => ({ ...field })),
    });
    setNotice("");
  }

  return (
    <form onSubmit={saveContactPage} className="site-tab" aria-label="Contact page settings">
      <h3 className="site-tab-title">Contact Page</h3>
      <p className="site-tab-subtitle">Create contact form to collect essential data.</p>

      <div className="site-form-grid-2 site-form-grid-2-mt">
        <InputField
          id="contact-title"
          label="Title"
          labelClassName="input-heading"
          required
          value={draft.title}
          onChange={(event) => updateText("title", event.target.value)}
          placeholder="Enter headline"
        />
        <InputField
          id="contact-subtitle"
          required
          label="Subtitle"
          labelClassName="input-heading"
          value={draft.subtitle}
          onChange={(event) => updateText("subtitle", event.target.value)}
          placeholder="Supporting text..."
        />
        <div className="site-field-span-half">
          <InputField
            id="contact-delivery-email"
            type="email"
            required
            label="Delivery email *"
            labelClassName="input-heading"
            value={draft.deliveryEmail}
            onChange={(event) => updateText("deliveryEmail", event.target.value)}
            placeholder="Where contact form submissions are sent"
          />
        </div>
      </div>

      <fieldset className="site-contact-table">
        <legend className="site-contact-legend">What data do you want to collect?</legend>
        <div className="site-contact-head">
          <span>Data Field</span>
          <span>Include</span>
          <span>Required</span>
        </div>
        <div>
          {draft.fields.map((field) => (
            <div key={field.id} className="site-contact-row">
              <span>{field.label}</span>
              <span className="site-contact-cell">
                <ContactSwitch
                  label={`Include ${field.label}`}
                  checked={field.included}
                  onChange={() => toggleField(field.id, "included")}
                />
              </span>
              <span className="site-contact-cell">
                <ContactSwitch
                  label={`Require ${field.label}`}
                  checked={field.required}
                  disabled={!field.included}
                  onChange={() => toggleField(field.id, "required")}
                />
              </span>
            </div>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="site-error">
          {error}
        </p>
      ) : null}

      <div className="site-form-actions">
        {notice ? (
          <p role="status" className="site-notice">
            {notice}
          </p>
        ) : null}
        <button type="button" onClick={cancelChanges} className="form-footer-btn form-footer-btn-secondary">
          Cancel
        </button>
        <button type="submit" className="form-footer-btn form-footer-btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
