"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import {
  useRegisterOrganiserMutation,
  useVerifyOrganiserEmailMutation,
  type RegisterOrganiserRequest,
} from "@/apis/auth/authApi";
import { AuthPage } from "@/components/auth/AuthPage";
import IconCard, {
  CLOSE_ICON,
  EMAIL_SENT_ICON,
  EYE_OFF_ICON,
  EYE_OPEN_ICON,
  INFO_ICON,
} from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { resolvePostLoginUrl, setAuthSession } from "@/lib/api/authStorage";
import { appToast } from "@/lib/ui/toast";

const countryOptions = [
  { value: "United States", label: "United States" },
  { value: "Great Britain", label: "Great Britain" },
  { value: "India", label: "India" },
  { value: "Australia", label: "Australia" },
];

/** ISO alpha-2 from country select when phone parse has no country. */
const countryNameToIso: Record<string, string> = {
  "United States": "US",
  "Great Britain": "GB",
  "United Kingdom": "GB",
  India: "IN",
  Australia: "AU",
};

const initialCode = ["", "", "", "", "", ""];

const otpFieldClass =
  "aspect-square h-auto w-full max-h-[54px] rounded-none border border-[#A9A9A9] bg-white text-center text-[24px] font-normal uppercase leading-[44px] text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/70 sm:text-[30px]";

type Step1Values = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type Step2Values = {
  orgName: string;
  orgEmail: string;
  orgCountry: string;
  orgPhone: string;
  orgCity: string;
  orgAddress1: string;
  orgAddress2: string;
  orgPostalCode: string;
  orgWebsite: string;
  orgLogo: string;
};

const emptyStep1: Step1Values = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const emptyStep2: Step2Values = {
  orgName: "",
  orgEmail: "",
  orgCountry: "",
  orgPhone: "",
  orgCity: "",
  orgAddress1: "",
  orgAddress2: "",
  orgPostalCode: "",
  orgWebsite: "",
  orgLogo: "",
};

function resolveCountryParts(phone: string, countryName: string) {
  const parsed = phone ? parsePhoneNumber(phone) : undefined;
  if (!parsed) return null;

  const iso = parsed.country ?? countryNameToIso[countryName.trim()] ?? "";
  if (!iso) return null;

  return {
    nationalNumber: parsed.nationalNumber,
    callingCode: `+${parsed.countryCallingCode}`,
    iso,
  };
}

function buildRegisterPayload(
  step1: Step1Values,
  step2: Step2Values,
): RegisterOrganiserRequest | null {
  const personal = resolveCountryParts(step1.phone, step1.country);
  const organisation = resolveCountryParts(step2.orgPhone, step2.orgCountry);
  if (!personal || !organisation) return null;

  const firstName = step1.firstName.trim();
  const lastName = step1.lastName.trim();

  const payload: RegisterOrganiserRequest = {
    first_name: firstName,
    last_name: lastName,
    email: step1.email.trim(),
    phone: personal.nationalNumber,
    country_code: personal.callingCode,
    country: step1.country.trim(),
    password: step1.password,
    confirm_password: step1.confirmPassword,
    org_organiser_name: `${firstName} ${lastName}`.trim(),
    org_name: step2.orgName.trim(),
    org_email: step2.orgEmail.trim(),
    org_country_calling_code: organisation.callingCode,
    org_country_code: organisation.iso,
    org_phone: organisation.nationalNumber,
    org_country: step2.orgCountry.trim(),
    org_city: step2.orgCity.trim(),
    org_address1: step2.orgAddress1.trim(),
    org_postal_code: step2.orgPostalCode.trim(),
  };

  const address2 = step2.orgAddress2.trim();
  if (address2) payload.org_address2 = address2;

  const website = step2.orgWebsite.trim();
  if (website) payload.org_website = website;

  const logo = step2.orgLogo.trim();
  if (logo) payload.org_logo = logo;

  return payload;
}

function PhoneField({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[16px] font-bold uppercase leading-6 text-[#161616]">
        {label}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      <div className="overflow-hidden rounded-[4px] border border-black bg-white">
        <PhoneInput
          id={id}
          international
          defaultCountry="US"
          value={value || undefined}
          onChange={(next) => onChange(next ?? "")}
          placeholder="(000) 000 - 0000"
          className="phone-input"
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [registerOrganiser, { isLoading: isRegistering }] = useRegisterOrganiserMutation();
  const [verifyOrganiserEmail, { isLoading: isVerifying }] = useVerifyOrganiserEmailMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1Values>(emptyStep1);
  const [step2, setStep2] = useState<Step2Values>(emptyStep2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const editableOtpIndex = (() => {
    const firstEmpty = verificationCode.findIndex((digit) => !digit);
    return firstEmpty === -1 ? verificationCode.length - 1 : firstEmpty;
  })();

  const isOtpBusy = isRegistering || isVerifying;

  function updateStep1<K extends keyof Step1Values>(key: K, value: Step1Values[K]) {
    setStep1((current) => ({ ...current, [key]: value }));
  }

  function updateStep2<K extends keyof Step2Values>(key: K, value: Step2Values[K]) {
    setStep2((current) => ({ ...current, [key]: value }));
  }

  function focusOtpIndex(index: number) {
    queueMicrotask(() => inputRefs.current[index]?.focus());
  }

  useEffect(() => {
    if (!isVerificationOpen) return;
    focusOtpIndex(editableOtpIndex);
  }, [isVerificationOpen, editableOtpIndex]);

  useEffect(() => {
    if (!isVerificationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVerificationOpen]);

  const renderPasswordToggle = (isVisible: boolean, onToggle: () => void) => (
    <button
      type="button"
      aria-label={isVisible ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="flex h-5 w-5 items-center justify-center text-black/70 transition hover:text-black"
    >
      <IconCard name={isVisible ? EYE_OFF_ICON : EYE_OPEN_ICON} className="h-4 w-4" />
    </button>
  );

  const handleStep1Submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step1.password !== step1.confirmPassword) {
      appToast.warning("Passwords do not match.");
      return;
    }

    if (!resolveCountryParts(step1.phone, step1.country)) {
      appToast.warning("Enter a valid phone number.");
      return;
    }

    setStep2((current) => ({
      ...current,
      orgEmail: step1.email.trim(),
      orgCountry: step1.country,
      orgPhone: step1.phone,
    }));
    setStep(2);
  };

  async function submitRegistration() {
    if (step1.password !== step1.confirmPassword) {
      appToast.warning("Passwords do not match.");
      return false;
    }

    const payload = buildRegisterPayload(step1, step2);
    if (!payload) {
      appToast.warning("Enter valid phone numbers for organiser and organisation.");
      return false;
    }

    try {
      const result = await registerOrganiser(payload).unwrap();
      if (result.success === false) {
        appToast.error(result.message || "Registration could not be completed.");
        return false;
      }

      setVerificationCode(initialCode);
      setIsVerificationOpen(true);
      return true;
    } catch {
      return false;
    }
  }

  const handleStep2Submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitRegistration();
  };

  function handleCodeChange(index: number, value: string) {
    if (index !== editableOtpIndex) return;

    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (cleaned.length > 1) {
      const nextCode = [...verificationCode];
      for (let i = 0; i < cleaned.length && index + i < nextCode.length; i += 1) {
        nextCode[index + i] = cleaned[i] ?? "";
      }
      setVerificationCode(nextCode);
      focusOtpIndex(Math.min(index + cleaned.length, nextCode.length - 1));
      return;
    }

    const sanitizedValue = cleaned.slice(-1);
    const nextCode = [...verificationCode];
    nextCode[index] = sanitizedValue;
    setVerificationCode(nextCode);

    if (sanitizedValue && index < inputRefs.current.length - 1) {
      focusOtpIndex(index + 1);
    }
  }

  function handleCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 6);

    if (!pasted) return;

    const nextCode = [...initialCode];
    for (let i = 0; i < pasted.length; i += 1) {
      nextCode[i] = pasted[i] ?? "";
    }
    setVerificationCode(nextCode);
    focusOtpIndex(Math.min(pasted.length, nextCode.length) - 1);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Backspace") return;

    if (verificationCode[index]) {
      const nextCode = [...verificationCode];
      nextCode[index] = "";
      setVerificationCode(nextCode);
      return;
    }

    if (index > 0) {
      event.preventDefault();
      const nextCode = [...verificationCode];
      nextCode[index - 1] = "";
      setVerificationCode(nextCode);
      focusOtpIndex(index - 1);
    }
  }

  async function handleVerifyEmail() {
    const otp = verificationCode.join("");
    if (otp.length !== 6) {
      appToast.warning("Enter the 6-character verification code.");
      return;
    }

    try {
      const result = await verifyOrganiserEmail({
        email: step1.email.trim(),
        otp,
      }).unwrap();

      const token = result.data?.access_token;
      const user = result.data?.user;

      if (!token || !user) {
        appToast.error(
          result.message || "Verification succeeded but no session was returned.",
        );
        return;
      }

      setAuthSession(token, user);
      setIsVerificationOpen(false);
      window.location.assign(resolvePostLoginUrl(user, null, window.location.host));
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handleResendCode() {
    await submitRegistration();
  }

  return (
    <>
      <AuthPage
        title={step === 1 ? "Create an account" : "Organisation Details"}
        subtitle={
          step === 1
            ? "Let get start & enter your details to create your account"
            : "Enter your organisation’s details to finish creating your account."
        }
        footer={
          <p className="text-center text-[16px] leading-6 text-black">
            Already register?{" "}
            <a href="/login" className="font-heading text-[14px]">
              Log in
            </a>
          </p>
        }
      >
        {step === 1 ? (
          <form className="flex flex-col gap-[22px]" onSubmit={handleStep1Submit}>
            <div className="grid gap-[22px] sm:grid-cols-2 sm:gap-5">
              <InputField
                label="First Name"
                type="text"
                placeholder="Enter first name"
                name="firstName"
                value={step1.firstName}
                onChange={(event) => updateStep1("firstName", event.target.value)}
                required
                className="!px-5"
              />
              <InputField
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                name="lastName"
                value={step1.lastName}
                onChange={(event) => updateStep1("lastName", event.target.value)}
                required
                className="!px-5"
              />
            </div>

            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              name="email"
              value={step1.email}
              onChange={(event) => updateStep1("email", event.target.value)}
              required
              className="!px-5"
            />

            <SelectField
              label="Country"
              name="country"
              value={step1.country}
              onChange={(event) => updateStep1("country", event.target.value)}
              options={countryOptions}
              placeholder="Select Country"
              required
            />

            <PhoneField
              id="organiser-phone"
              label="Phone Number"
              value={step1.phone}
              onChange={(value) => updateStep1("phone", value)}
              required
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              name="password"
              value={step1.password}
              onChange={(event) => updateStep1("password", event.target.value)}
              required
              className="!px-5"
              suffix={renderPasswordToggle(showPassword, () => setShowPassword((value) => !value))}
            />

            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              name="confirmPassword"
              value={step1.confirmPassword}
              onChange={(event) => updateStep1("confirmPassword", event.target.value)}
              required
              className="!px-5"
              suffix={renderPasswordToggle(showConfirmPassword, () =>
                setShowConfirmPassword((value) => !value),
              )}
            />

            <button
              type="submit"
              className="auth-primary-button mt-[13px]"
            >
              Continue
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-[22px]" onSubmit={handleStep2Submit}>
            <InputField
              label="Organisation Name"
              type="text"
              placeholder="Enter Your Organisation Name"
              name="orgName"
              value={step2.orgName}
              onChange={(event) => updateStep2("orgName", event.target.value)}
              required
              className="!px-5"
            />

            <InputField
              label="Organisation Email"
              type="email"
              placeholder="contact@organisation.com"
              name="orgEmail"
              value={step2.orgEmail}
              onChange={(event) => updateStep2("orgEmail", event.target.value)}
              required
              className="!px-5"
            />

            <SelectField
              label="Organisation Country"
              name="orgCountry"
              value={step2.orgCountry}
              onChange={(event) => updateStep2("orgCountry", event.target.value)}
              options={countryOptions}
              placeholder="Select Country"
              required
            />

            <PhoneField
              id="organisation-phone"
              label="Organisation Phone"
              value={step2.orgPhone}
              onChange={(value) => updateStep2("orgPhone", value)}
              required
            />

            <InputField
              label="City"
              type="text"
              placeholder="Enter city"
              name="orgCity"
              value={step2.orgCity}
              onChange={(event) => updateStep2("orgCity", event.target.value)}
              required
              className="!px-5"
            />

            <InputField
              label="Address Line 1"
              type="text"
              placeholder="Address Line 1"
              name="orgAddress1"
              value={step2.orgAddress1}
              onChange={(event) => updateStep2("orgAddress1", event.target.value)}
              required
              className="!px-5"
            />

            <InputField
              label={
                <>
                  Address Line 2{" "}
                  <span className="font-normal normal-case text-black/55">(optional)</span>
                </>
              }
              type="text"
              placeholder="Address Line 2"
              name="orgAddress2"
              value={step2.orgAddress2}
              onChange={(event) => updateStep2("orgAddress2", event.target.value)}
              className="!px-5"
            />

            <InputField
              label="Postal Code"
              type="text"
              placeholder="Enter postal code"
              name="orgPostalCode"
              value={step2.orgPostalCode}
              onChange={(event) => updateStep2("orgPostalCode", event.target.value)}
              required
              className="!px-5"
            />

            <InputField
              label={
                <>
                  Website URL <span className="font-normal normal-case text-black/55">(optional)</span>
                </>
              }
              type="text"
              inputMode="url"
              placeholder="https://yourlist.com"
              name="orgWebsite"
              value={step2.orgWebsite}
              onChange={(event) => updateStep2("orgWebsite", event.target.value)}
              className="!px-5"
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="orgLogo"
                className="text-[16px] font-bold uppercase leading-6 text-[#161616]"
              >
                Organisation Logo{" "}
                <span className="font-normal normal-case text-black/55">(optional)</span>
              </label>
              <div className="flex h-[48px] items-center gap-3 rounded-[4px] border border-black bg-white px-5">
                <input
                  ref={logoInputRef}
                  id="orgLogo"
                  name="orgLogo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    updateStep2("orgLogo", file?.name ?? "");
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="cursor-pointer text-[14px] font-normal text-black underline underline-offset-2"
                >
                  {step2.orgLogo ? "Change file" : "Choose file"}
                </button>
                <span className="truncate text-[14px] text-black/60">
                  {step2.orgLogo || "No file selected"}
                </span>
              </div>
            </div>

            <p className="text-[16px] font-normal leading-6 text-black/80">
              By completing your profile, you are agreeing to our{" "}
              <a href="/#terms" className="font-heading text-black">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="/#privacy" className="font-heading text-black">
                Privacy Policy
              </a>{" "}
              on YOURLIST.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isRegistering}
                className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white text-[14px] font-normal uppercase leading-6 text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isRegistering}
                className="auth-primary-button flex-1"
              >
                {isRegistering ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </AuthPage>

      {isVerificationOpen ? (
        <div className="auth-site fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-email-title"
            className="relative w-full max-w-[500px] overflow-hidden rounded-[4px] bg-white px-5 pb-[30px] pt-10 shadow-[0_35px_90px_rgba(0,0,0,0.28)] sm:px-10"
          >
            <button
              type="button"
              aria-label="Close modal"
              disabled={isOtpBusy}
              onClick={() => setIsVerificationOpen(false)}
              className="absolute right-5 top-5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border border-[#e5e5e5] bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconCard name={CLOSE_ICON} className="h-3.5 w-3.5" />
            </button>

            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-black text-white">
              <IconCard name={EMAIL_SENT_ICON} className="h-8 w-8" />
            </div>

            <h2
              id="verify-email-title"
              className="font-heading mt-[30px] text-center text-[24px] uppercase leading-[38px] text-black"
            >
              Verify your email
            </h2>

            <p className="mt-2.5 text-center text-[16px] font-normal leading-6 text-black">
              We&apos;ve sent you a verification code to{" "}
              <span className="font-heading">{step1.email.trim()}</span>
              <br />
              Enter it below to verify your email address.
            </p>

            <div className="mt-[30px] border-t border-[#E5E5E5] pt-[27px]">
              <div className="mx-auto grid max-w-[420px] grid-cols-6 gap-[10px] sm:gap-[18px]">
                {verificationCode.map((digit, index) => {
                  const isEditable = index === editableOtpIndex;
                  return (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="text"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={isEditable ? 6 : 1}
                      value={digit}
                      disabled={!isEditable || isOtpBusy}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      onPaste={handleCodePaste}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      className={otpFieldClass}
                      aria-label={`Verification code character ${index + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-center text-[16px] font-normal leading-6 text-black">
              Didn&apos;t get your code?{" "}
              <button
                type="button"
                disabled={isOtpBusy}
                onClick={handleResendCode}
                className="font-heading cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRegistering ? "Sending..." : "Send a new code"}
              </button>
            </p>

            <div className="mt-[30px] flex items-start gap-2.5 rounded-[4px] border border-[#e5e5e5] bg-[#F5F5F5] px-[22px] py-3 text-left text-[14px] font-normal leading-5 text-black/80">
              <IconCard name={INFO_ICON} className="mt-0.5 h-4 w-4 shrink-0 text-[#949494]" />
              <span>
                The code expires in 10 minutes. If you don&apos;t see the email, check your spam
                folder or use the resend option above.
              </span>
            </div>

            <button
              type="button"
              disabled={isOtpBusy}
              onClick={handleVerifyEmail}
              className="mt-[30px] flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-normal uppercase tracking-[0.02em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify & continue"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
