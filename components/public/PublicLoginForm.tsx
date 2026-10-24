"use client";

import type { FormEvent } from "react";

export const LOGIN_COUNTRY_CODES = [
  { value: "+1", flag: "🇺🇸", name: "United States" },
  { value: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { value: "+91", flag: "🇮🇳", name: "India" },
  { value: "+61", flag: "🇦🇺", name: "Australia" },
  { value: "+353", flag: "🇮🇪", name: "Ireland" },
  { value: "+33", flag: "🇫🇷", name: "France" },
  { value: "+49", flag: "🇩🇪", name: "Germany" },
  { value: "+39", flag: "🇮🇹", name: "Italy" },
  { value: "+34", flag: "🇪🇸", name: "Spain" },
  { value: "+31", flag: "🇳🇱", name: "Netherlands" },
  { value: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { value: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { value: "+65", flag: "🇸🇬", name: "Singapore" },
  { value: "+81", flag: "🇯🇵", name: "Japan" },
  { value: "+86", flag: "🇨🇳", name: "China" },
  { value: "+64", flag: "🇳🇿", name: "New Zealand" },
  { value: "+27", flag: "🇿🇦", name: "South Africa" },
] as const;

const fieldShell =
  "h-[47px] w-full rounded-[3.52px] border-[1.17px] border-black/50 bg-white text-[14px] leading-5 text-black outline-none transition focus-within:border-black";

type PublicLoginFormProps = {
  email: string;
  phone: string;
  countryCode: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  idPrefix?: string;
};

export function PublicLoginForm({
  email,
  phone,
  countryCode,
  onEmailChange,
  onPhoneChange,
  onCountryCodeChange,
  onSubmit,
  isSubmitting,
  idPrefix = "login",
}: PublicLoginFormProps) {
  const selected =
    LOGIN_COUNTRY_CODES.find((country) => country.value === countryCode) ??
    LOGIN_COUNTRY_CODES[0];

  return (
    <form className="mt-8" onSubmit={onSubmit}>
      <div>
        <label htmlFor={`${idPrefix}-email`} className="font-body-bold mb-2 block text-[14px] leading-5 text-black">
          Enter your email
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          className={`${fieldShell} px-3 placeholder:text-black/45`}
        />
      </div>

      <div className="mt-5">
        <label htmlFor={`${idPrefix}-phone`} className="font-body-bold mb-2 block text-[14px] leading-5 text-black">
          Enter your mobile number
        </label>
        <div className={`${fieldShell} flex items-center`}>
          <div className="relative flex h-full shrink-0 items-center gap-1.5 border-r-[1.17px] border-black/50 pl-3 pr-7">
            <span className="text-[16px] leading-none" aria-hidden="true">
              {selected.flag}
            </span>
            <span className="text-[14px] leading-5">{selected.value}</span>
            <select
              aria-label="Country code"
              value={countryCode}
              onChange={(event) => onCountryCodeChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {LOGIN_COUNTRY_CODES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.flag} {country.value} {country.name}
                </option>
              ))}
            </select>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              aria-hidden="true"
              className="pointer-events-none absolute right-2 text-black"
            >
              <path
                d="M1 1 5 5 9 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="1234567890"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, "").slice(0, 15))}
            required
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[14px] leading-5 text-black outline-none placeholder:text-black/45"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="font-heading mt-6 flex h-[47px] w-full cursor-pointer items-center justify-center rounded-[3.52px] bg-black text-[14px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending code..." : "Continue"}
      </button>
    </form>
  );
}
