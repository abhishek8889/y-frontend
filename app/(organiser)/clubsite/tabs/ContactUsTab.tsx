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
  fields: ContactField[];
};

const initialContactDraft: ContactDraft = {
  title: "",
  subtitle: "",
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
      className={`relative inline-flex h-[17px] w-[32px] shrink-0 items-center rounded-full transition ${
        checked ? "bg-black" : "bg-[#e5e7eb]"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        aria-hidden="true"
        className={`h-[13px] w-[13px] rounded-full bg-white transition-transform ${
          checked ? "translate-x-[16px]" : "translate-x-[2px]"
        }`}
      />
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

  function updateText(field: "title" | "subtitle", value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setNotice("");
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
    const nextSaved = {
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      fields: draft.fields.map((field) => ({ ...field })),
    };
    setDraft(nextSaved);
    setSavedDraft(nextSaved);
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
    <form onSubmit={saveContactPage} className="mt-4" aria-label="Contact page settings">
      <h3 className="text-[18px] font-black uppercase leading-6">Contact Page</h3>
      <p className="mt-1 text-[12px] text-[#777]">Create contact form to collect essential data.</p>

      <div className="mt-[24px] grid gap-3 lg:grid-cols-2">
        <div>
          <InputField
            id="contact-title"
            label="Title"
            labelClassName="!text-[14px] !leading-[20px] mb-[6px]"
            required
            value={draft.title}
            onChange={(event) => updateText("title", event.target.value)}
            placeholder="Enter headline"
            density="compact"
            containerClassName="mt-1 !h-[40px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px] normal-case placeholder:!text-[#777]"
          />
        </div>
        <div>
          <InputField
            id="contact-subtitle"
            required
            label="Subtitle"
            labelClassName="!text-[14px] !leading-[20px] mb-[6px]"
            value={draft.subtitle}
            onChange={(event) => updateText("subtitle", event.target.value)}
            placeholder="Supporting text..."
            density="compact"
            containerClassName="mt-1 !h-[40px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px] normal-case placeholder:!text-[#777]"
          />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[14px] font-bold uppercase">What data do you want to collect?</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_96px_96px] border-b border-black px-3 py-2 text-[14px] font-bold">
          <span>Data Field</span>
          <span className="text-center">Include</span>
          <span className="text-center">Required</span>
        </div>
        <div>
          {draft.fields.map((field) => (
            <div
              key={field.id}
              className="grid grid-cols-[minmax(0,1fr)_96px_96px] items-center border-b border-black/50 p-[16px] text-[14px]"
            >
              <span>{field.label}</span>
              <span className="flex justify-center">
                <ContactSwitch
                  label={`Include ${field.label}`}
                  checked={field.included}
                  onChange={() => toggleField(field.id, "included")}
                />
              </span>
              <span className="flex justify-center">
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

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button
          type="button"
          onClick={cancelChanges}
          className="cursor-pointer h-[40px] min-w-[90px] rounded border border-black px-4 text-[12px] uppercase hover:bg-black hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer h-[40px] min-w-[78px] rounded border border-black bg-black px-4 text-[12px] uppercase text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </div>
    </form>
  );
}
