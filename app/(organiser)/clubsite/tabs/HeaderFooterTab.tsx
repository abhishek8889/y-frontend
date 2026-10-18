"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import AddNavigationModal from "./header-footer/AddNavigationModal";

type NavigationItem = {
  id: string;
  name: string;
  url: string;
  priority: string;
  included: boolean;
};

type FooterLink = {
  id: string;
  label: string;
  included: boolean;
};

type HeaderFooterSettings = {
  searchEnabled: boolean;
  accountEnabled: boolean;
  headerButtonEnabled: boolean;
  headerButtonName: string;
  navigation: NavigationItem[];
  exploreTitle: string;
  exploreLinks: FooterLink[];
  socialTitle: string;
  socialLinks: { id: string; label: string; value: string }[];
  contactTitle: string;
  phoneCountry: string;
  phoneNumber: string;
  email: string;
  address: string;
};

const initialSettings: HeaderFooterSettings = {
  searchEnabled: true,
  accountEnabled: true,
  headerButtonEnabled: true,
  headerButtonName: "",
  navigation: [
    { id: "home", name: "Home", url: "/", priority: "1", included: true },
    { id: "about", name: "About", url: "/about", priority: "2", included: true },
    { id: "events", name: "Events", url: "/events", priority: "3", included: true },
    { id: "news", name: "News", url: "/news", priority: "4", included: true },
  ],
  exploreTitle: "",
  exploreLinks: [
    { id: "about", label: "About", included: true },
    { id: "events", label: "Events", included: true },
    { id: "news", label: "News", included: true },
    { id: "tickets", label: "My Tickets", included: true },
  ],
  socialTitle: "",
  socialLinks: [
    { id: "facebook", label: "Facebook", value: "" },
    { id: "instagram", label: "Instagram", value: "" },
    { id: "tiktok", label: "TikTok", value: "" },
    { id: "youtube", label: "YouTube", value: "" },
  ],
  contactTitle: "",
  phoneCountry: "+1",
  phoneNumber: "",
  email: "",
  address: "",
};

function cloneSettings(settings: HeaderFooterSettings): HeaderFooterSettings {
  return {
    ...settings,
    navigation: settings.navigation.map((item) => ({ ...item })),
    exploreLinks: settings.exploreLinks.map((item) => ({ ...item })),
    socialLinks: settings.socialLinks.map((item) => ({ ...item })),
  };
}

function BrandLogo() {
  return (
    <div className="inline-flex min-h-[54px] items-center gap-2 border border-black/60 px-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black text-[16px] font-black" aria-hidden="true">
        H
      </span>
      <span className="text-[24px] font-black uppercase leading-5">Hednesford Town</span>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-[17px] w-[32px] shrink-0 items-center rounded-full transition ${
        checked ? "bg-black" : "bg-[#e5e7eb]"
      }`}
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

function CheckControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[1px] border border-black ${
        checked ? "bg-black text-white" : "bg-white"
      }`}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="h-[10px] w-[10px]">
          <path d="m2 6 2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-[24px] font-black uppercase leading-6">{title}</h3>
      <p className="mt-1 text-[14px] text-[#6F6E69]">{description}</p>
    </div>
  );
}

function FooterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 border border-black/60 p-2.5">
      <h4 className="!mb-[6px] text-[14px] font-bold uppercase">{title}</h4>
      {children}
    </section>
  );
}

export default function HeaderFooterTab() {
  const [settings, setSettings] = useState<HeaderFooterSettings>(() => cloneSettings(initialSettings));
  const [savedSettings, setSavedSettings] = useState<HeaderFooterSettings>(() => cloneSettings(initialSettings));
  const [notice, setNotice] = useState("");
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);

  function updateSetting<K extends keyof HeaderFooterSettings>(key: K, value: HeaderFooterSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateNavigation(id: string, field: "name" | "priority" | "included", value: string | boolean) {
    setSettings((current) => ({
      ...current,
      navigation: current.navigation.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
    setNotice("");
  }

  function updateFooterLink(id: string, included: boolean) {
    setSettings((current) => ({
      ...current,
      exploreLinks: current.exploreLinks.map((item) => item.id === id ? { ...item, included } : item),
    }));
    setNotice("");
  }

  function updateSocialLink(id: string, value: string) {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item) => item.id === id ? { ...item, value } : item),
    }));
    setNotice("");
  }

  function addNavigationItem(item: Omit<NavigationItem, "id" | "included">) {
    setSettings((current) => ({
      ...current,
      navigation: [
        ...current.navigation,
        { ...item, id: crypto.randomUUID(), included: true },
      ],
    }));
    setIsNavigationModalOpen(false);
    setNotice("");
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = cloneSettings(settings);
    next.navigation = next.navigation.map((item) => ({ ...item, name: item.name.trim() }));
    setSettings(next);
    setSavedSettings(cloneSettings(next));
    setNotice("Header and footer settings saved.");
  }

  function cancelChanges() {
    setSettings(cloneSettings(savedSettings));
    setNotice("");
  }

  return (
    <div>
    <form onSubmit={saveSettings} aria-label="Header and footer settings">
      <section className="pb-5">
        <SectionHeading
          title="Header Configuration"
          description="Set up your website header, navigation and actions."
        />

        <div className="mt-[28px]">
          <h4 className="mb-1 text-[16px] font-bold uppercase">Website logo</h4>
          <BrandLogo />
        </div>

        <div className="mt-[20px]">
          <h4 className="mb-1.5 text-[16px] font-bold uppercase">Header actions</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-[140px] text-[14px]">Show search option</span>
              <Toggle
                label="Show search option"
                checked={settings.searchEnabled}
                onChange={() => updateSetting("searchEnabled", !settings.searchEnabled)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[140px] text-[14px]">Show Login account</span>
              <Toggle
                label="Show login account"
                checked={settings.accountEnabled}
                onChange={() => updateSetting("accountEnabled", !settings.accountEnabled)}
              />
            </div>
          </div>
        </div>

        <div className="mt-[20px]">
          <h4 className="mb-1.5 text-[16px] font-bold uppercase">Header button</h4>
          <label htmlFor="header-button-name" className="mb-1 block text-[14px] font-bold uppercase">Contact Us</label>
          <div className="grid max-w-[440px] grid-cols-[14px_minmax(0,1fr)] items-center gap-2">
            <CheckControl
              label="Show header contact button"
              checked={settings.headerButtonEnabled}
              onChange={() => updateSetting("headerButtonEnabled", !settings.headerButtonEnabled)}
            />
            <InputField
              id="header-button-name"
              value={settings.headerButtonName}
              onChange={(event) => updateSetting("headerButtonName", event.target.value)}
              placeholder="Change link name to"
              density="compact"
              containerClassName="!h-[40px]"
            />
          </div>
        </div>

        <div className="mt-[20px]">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <h4 className="text-[16px] font-bold uppercase mb-[20px]">Main navigation</h4>
            <button
              type="button"
              onClick={() => setIsNavigationModalOpen(true)}
              className="inline-flex h-[40px] items-center gap-1.5 rounded-[3px] border border-black bg-black px-3 text-[14px] cursor-pointer uppercase text-white transition hover:bg-white hover:text-black"
            >
              <span aria-hidden="true" className="text-[14px] leading-none">+</span>
              Add navigation item
            </button>
          </div>

          <div className="space-y-2">
            {settings.navigation.map((item) => (
              <div key={item.id} className="grid gap-x-2 gap-y-1 sm:grid-cols-[14px_minmax(130px,0.45fr)_minmax(0,1fr)] sm:items-end">
                <label className="col-span-full text-[14px] font-bold uppercase sm:col-span-full">{item.name || "Navigation item"}</label>
                <span className="self-center">
                  <CheckControl
                    label={`Include ${item.name || "navigation item"}`}
                    checked={item.included}
                    onChange={() => updateNavigation(item.id, "included", !item.included)}
                  />
                </span>
                <InputField
                  aria-label={`${item.name || "Navigation item"} priority`}
                  type="number"
                  min="1"
                  value={item.priority}
                  onChange={(event) => updateNavigation(item.id, "priority", event.target.value)}
                  placeholder="Priority"
                  density="compact"
                  containerClassName="!h-[40px]"
                />
                <InputField
                  aria-label={`${item.name || "Navigation item"} link name`}
                  value={item.name}
                  onChange={(event) => updateNavigation(item.id, "name", event.target.value)}
                  placeholder="Change link name to"
                  density="compact"
                  containerClassName="!h-[40px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-5 border-t border-black p-[24px] md:-mx-5">
        <SectionHeading
          title="Footer Configuration"
          description="Set up your website footer with links, contact information and social media."
        />

        <div className="mt-[20px]">
          <h4 className="mb-1 text-[14px] font-bold uppercase">Website logo</h4>
          <BrandLogo />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <FooterCard title="Explore">
            <InputField
              aria-label="Explore footer title"
              value={settings.exploreTitle}
              onChange={(event) => updateSetting("exploreTitle", event.target.value)}
              placeholder="Change title name to"
              density="compact"
              className="!h-[40px]"
            />
            <h5 className="mb-1 mt-3 text-[14px] font-bold uppercase">Links</h5>
            <div className="space-y-1">
              {settings.exploreLinks.map((link) => (
                <label key={link.id} className="flex items-center gap-2 text-[14px]">
                  <span aria-hidden="true" className="cursor-grab text-[12px] leading-none text-black/60">⠿</span>
                  <CheckControl
                    label={`Show ${link.label} footer link`}
                    checked={link.included}
                    onChange={() => updateFooterLink(link.id, !link.included)}
                  />
                  {link.label}
                </label>
              ))}
            </div>
          </FooterCard>

          <FooterCard title="Social handles">
            <InputField
              aria-label="Social handles footer title"
              value={settings.socialTitle}
              onChange={(event) => updateSetting("socialTitle", event.target.value)}
              placeholder="Change title name to"
              density="compact"
              containerClassName="!h-[40px]"
            />
            <h5 className="mb-1 mt-[18px] text-[14px] font-bold uppercase">Links</h5>
            <div className="space-y-1.5">
              {settings.socialLinks.map((link) => (
                <div key={link.id}>
                 <InputField
                    id={`social-${link.id}`}
                    type="url"
                    label={`${link.label}`}
                    labelClassName="!text-[14px] !mb-[6px]"
                    value={link.value}
                    onChange={(event) => updateSocialLink(link.id, event.target.value)}
                    placeholder={`${link.id}.com/yourhandle`}
                    density="compact"
                    containerClassName="mb-[12px]"
                    className="!h-[40px]"
                  />
                </div>
              ))}
            </div>
          </FooterCard>

          <FooterCard title="Contact">
            <InputField
              aria-label="Contact footer title"
              value={settings.contactTitle}
              onChange={(event) => updateSetting("contactTitle", event.target.value)}
              placeholder="Change title name to"
              density="compact"
              containerClassName="!h-[40px] mb-[12px]"
            />
            <h5 className="mb-1 mt-[18px] text-[14px] font-bold uppercase">Links</h5>
            <div className="space-y-1.5">
              <div>
                <label htmlFor="footer-phone" className="mb-[6px] mt-[12px] block text-[14px] font-bold uppercase">Phone Number</label>
                <div className="grid grid-cols-[85px_minmax(0,1fr)] gap-1">
                  <SelectField
                    id="footer-phone-country"
                    aria-label="Phone country code"
                    value={settings.phoneCountry}
                    onChange={(event) => updateSetting("phoneCountry", event.target.value)}
                    options={[
                      { value: "+1", label: "🇺🇸 +1" },
                      { value: "+44", label: "🇬🇧 +44" },
                      { value: "+91", label: "🇮🇳 +91" },
                    ]}
                    density="compact"
                    containerClassName="!h-[40px]"
                  />
                  <InputField
                    id="footer-phone"
                    type="tel"
                    value={settings.phoneNumber}
                    onChange={(event) => updateSetting("phoneNumber", event.target.value)}
                    placeholder="(000) 000-0000"
                    density="compact"
                    containerClassName="!h-[40px]"
                  />
                </div>
              </div>
              <div>
                <InputField
                  id="footer-email"
                  label="Email"
                  labelClassName="!mb-[6px] !text-[14px]"
                  type="email"
                  value={settings.email}
                  onChange={(event) => updateSetting("email", event.target.value)}
                  placeholder="user@gmail.com"
                  density="compact"
                  containerClassName="!h-[40px]"
                />
              </div>
              <div>
                <InputField
                  as="textarea"
                  id="footer-address"
                  rows={3}
                  label="Address"
                  labelClassName="!mb-[6px] !text-[14px]"
                  value={settings.address}
                  onChange={(event) => updateSetting("address", event.target.value)}
                  placeholder="Enter address details"
                  className="!min-h-[54px]"
                />
              </div>
            </div>
          </FooterCard>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button
          type="button"
          onClick={cancelChanges}
          className="h-[40px] min-w-[90px] rounded-[3px] border border-black px-4 text-[14px] uppercase hover:bg-black hover:text-white cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[40px] min-w-[78px] rounded-[3px] border border-black bg-black px-4 text-[14px] uppercase text-white hover:bg-white hover:text-black cursor-pointer" 
        >
          Save
        </button>
      </div>
    </form>
      {isNavigationModalOpen ? (
        <AddNavigationModal
          defaultPriority={String(settings.navigation.length + 1)}
          onClose={() => setIsNavigationModalOpen(false)}
          onSave={addNavigationItem}
        />
      ) : null}
    </div>
  );
}
