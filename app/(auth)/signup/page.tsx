"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  isValidPhoneNumber,
  type Country as PhoneCountry,
} from "react-phone-number-input";

import {
  useRegisterOrganiserMutation,
  useVerifyOrganiserEmailMutation,
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
import { getApiErrorMessage } from "@/lib/api/errors";
import { resolvePostLoginUrl, setAuthSession } from "@/lib/api/authStorage";

const countries = [
  { code: "US", name: "United States", callingCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "Great Britain", callingCode: "+44", flag: "🇬🇧" },
  { code: "ENG", countryCode: "GB", name: "England", callingCode: "+44", flag: "🇬🇧" },
  { code: "IN", name: "India", callingCode: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australia", callingCode: "+61", flag: "🇦🇺" },
];

const countryOptions = countries.map(({ name }) => ({
  value: name,
  label: name,
}));
const initialOtp = Array.from({ length: 6 }, () => "");

function getPhoneCountry(code: string): PhoneCountry | null {
  switch (code) {
    case "US":
    case "GB":
    case "IN":
    case "AU":
      return code;
    case "ENG":
      return "GB";
    default:
      return null;
  }
}

type SignupValues = {
  first_name: string;
  last_name: string;
  email: string;
  personal_country_code: string;
  country: string;
  phone: string;
  password: string;
  confirm_password: string;
  org_organiser_name: string;
  org_name: string;
  org_email: string;
  org_country_code: string;
  org_country: string;
  org_phone: string;
  org_city: string;
  org_address1: string;
  org_address2: string;
  org_postal_code: string;
};

type SignupErrors = Partial<Record<keyof SignupValues, string>>;

const initialValues: SignupValues = {
  first_name: "",
  last_name: "",
  email: "",
  personal_country_code: "US",
  country: "",
  phone: "",
  password: "",
  confirm_password: "",
  org_organiser_name: "",
  org_name: "",
  org_email: "",
  org_country_code: "US",
  org_country: "",
  org_phone: "",
  org_city: "",
  org_address1: "",
  org_address2: "",
  org_postal_code: "",
};

export default function SignupPage() {
  const [registerOrganiser, { isLoading }] = useRegisterOrganiserMutation();
  const [verifyOrganiserEmail, { isLoading: isVerifying }] =
    useVerifyOrganiserEmailMutation();
  const [values, setValues] = useState(initialValues);
  const [step, setStep] = useState<1 | 2>(1);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [otp, setOtp] = useState(initialOtp);
  const [verificationError, setVerificationError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateValue = (name: keyof SignupValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      if (name === "personal_country_code" || name === "org_country_code") {
        delete next[name === "personal_country_code" ? "phone" : "org_phone"];
      }
      if (name === "password" || name === "confirm_password") {
        delete next.confirm_password;
      }
      return next;
    });
    setFormError("");
  };

  function validateStep(): SignupErrors {
    const errors: SignupErrors = {};
    const requiredFields: Array<[keyof SignupValues, string]> =
      step === 1
        ? [
            ["first_name", "First name"],
            ["last_name", "Last name"],
            ["email", "Email"],
            ["country", "Country"],
            ["phone", "Phone number"],
            ["password", "Password"],
            ["confirm_password", "Confirm password"],
          ]
        : [
            ["org_organiser_name", "Organiser name"],
            ["org_name", "Organisation name"],
            ["org_email", "Organisation email"],
            ["org_country", "Organisation country"],
            ["org_phone", "Organisation phone"],
            ["org_city", "City"],
            ["org_address1", "Address line 1"],
            ["org_address2", "Address line 2"],
            ["org_postal_code", "Postal code"],
          ];

    requiredFields.forEach(([field, label]) => {
      if (!values[field].trim()) errors[field] = `${label} is required.`;
    });

    const email = step === 1 ? values.email : values.org_email;
    const emailField = step === 1 ? "email" : "org_email";
    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors[emailField] = "Enter a valid email address.";
    }

    if (step === 1) {
      const phoneCountry = getPhoneCountry(values.personal_country_code);
      if (values.phone.trim() && (
        !phoneCountry ||
        !isValidPhoneNumber(values.phone.trim(), phoneCountry)
      )) {
        errors.phone = "Enter a valid phone number for the selected country.";
      }

      if (values.password) {
        const passwordRules = [
          { test: values.password.length >= 8, message: "Use at least 8 characters." },
          { test: /[A-Z]/.test(values.password), message: "Add an uppercase letter." },
          { test: /[a-z]/.test(values.password), message: "Add a lowercase letter." },
          { test: /\d/.test(values.password), message: "Add a number." },
          { test: /[^A-Za-z0-9]/.test(values.password), message: "Add a special character." },
        ];
        const failedRule = passwordRules.find(({ test }) => !test);
        if (failedRule) errors.password = failedRule.message;
      }
      if (
        values.confirm_password &&
        values.password !== values.confirm_password
      ) {
        errors.confirm_password = "Passwords do not match.";
      }
    } else {
      const phoneCountry = getPhoneCountry(values.org_country_code);
      if (values.org_phone.trim() && (
        !phoneCountry ||
        !isValidPhoneNumber(values.org_phone.trim(), phoneCountry)
      )) {
        errors.org_phone =
          "Enter a valid organisation phone number for the selected country.";
      }
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const validationErrors = validateStep();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    const personalCountry =
      countries.find(({ code }) => code === values.personal_country_code) ??
      countries[0];
    const organisationCountry =
      countries.find(({ code }) => code === values.org_country_code) ??
      countries[0];
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      phone: values.phone.replace(/\D/g, ""),
      country_code: personalCountry.callingCode,
      country: values.country.trim(),
      password: values.password,
      confirm_password: values.confirm_password,
      org_organiser_name: values.org_organiser_name.trim(),
      org_name: values.org_name.trim(),
      org_email: values.org_email.trim(),
      org_country_calling_code: organisationCountry.callingCode,
      org_country_code: "countryCode" in organisationCountry
        ? organisationCountry.countryCode
        : organisationCountry.code,
      org_phone: values.org_phone.replace(/\D/g, ""),
      org_country: values.org_country.trim(),
      org_city: values.org_city.trim(),
      org_address1: values.org_address1.trim(),
      org_address2: values.org_address2.trim(),
      org_postal_code: values.org_postal_code.trim(),
    };

    try {
      const result = await registerOrganiser(payload).unwrap();

      if (result.success === false) {
        setFormError(result.message || "Registration could not be completed.");
        return;
      }

      setIsVerificationOpen(true);
      setOtp(initialOtp);
    } catch (error) {
      setFormError(
        getApiErrorMessage(error as never, "Unable to create your account."),
      );
    }
  }

  function updateOtp(index: number, rawValue: string) {
    const characters = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const nextOtp = [...otp];

    if (characters.length > 1) {
      characters
        .slice(0, nextOtp.length - index)
        .split("")
        .forEach((character, offset) => {
          nextOtp[index + offset] = character;
        });
      setOtp(nextOtp);
      otpRefs.current[
        Math.min(index + characters.length, nextOtp.length - 1)
      ]?.focus();
      return;
    }

    nextOtp[index] = characters;
    setOtp(nextOtp);

    if (characters && index < nextOtp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyEmail() {
    setVerificationError("");
    setResendMessage("");
    const code = otp.join("");

    if (code.length !== initialOtp.length) {
      setVerificationError("Enter the 6-character verification code.");
      return;
    }

    try {
      const result = await verifyOrganiserEmail({
        email: values.email.trim(),
        otp: code,
      }).unwrap();

      const token = result.data?.access_token;
      const user = result.data?.user;

      if (!token || !user) {
        setVerificationError(
          result.message ||
            "Verification succeeded but no session was returned.",
        );
        return;
      }

      setAuthSession(token, user);
      setIsVerificationOpen(false);
      window.location.assign(
        resolvePostLoginUrl(user, null, window.location.host),
      );
    } catch (error) {
      setVerificationError(
        getApiErrorMessage(error as never, "Unable to verify your email."),
      );
    }
  }

  const renderPasswordToggle = (visible: boolean, onToggle: () => void) => (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="flex h-5 w-5 items-center justify-center text-black/70 transition hover:text-black"
    >
      <IconCard
        name={visible ? EYE_OFF_ICON : EYE_OPEN_ICON}
        className="h-4 w-4"
      />
    </button>
  );

  return (
    <AuthPage
      title="Create an account"
      subtitle="Let get start & enter your details to create your account"
      footer={
        <p className="text-center text-[16px] leading-[24px] text-black">
          Already registered?{" "}
          <a href="/login" className="font-bold uppercase">
            LOG IN
          </a>
        </p>
      }
    >
      <form className="space-y-[22px]" noValidate onSubmit={handleSubmit}>
        <h2 className="text-[16px] font-bold uppercase leading-[24px] text-black">
          {step === 1 ? "Organiser Details" : "Organisation Details"}
        </h2>

        {step === 1 ? (
          <>
            <div className="grid gap-[22px] sm:grid-cols-2">
              <InputField
                label="First Name"
                name="first_name"
                autoComplete="given-name"
                placeholder="Enter first name"
                error={fieldErrors.first_name}
                value={values.first_name}
                onChange={(event) =>
                  updateValue("first_name", event.target.value)
                }
                required
              />
              <InputField
                label="Last Name"
                name="last_name"
                autoComplete="family-name"
                placeholder="Enter last name"
                error={fieldErrors.last_name}
                value={values.last_name}
                onChange={(event) =>
                  updateValue("last_name", event.target.value)
                }
                required
              />
            </div>

            <InputField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              error={fieldErrors.email}
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              required
            />

            <SelectField
              label="Country"
              name="country"
              error={fieldErrors.country}
              value={values.country}
              onChange={(event) => {
                const countryName = event.target.value;
                updateValue("country", countryName);
                const countryCode = countries.find(
                  ({ name }) => name === countryName,
                )?.code;
                if (countryCode) {
                  updateValue("personal_country_code", countryCode);
                }
              }}
              options={countryOptions}
              placeholder="Select Country"
              required
            />

            <div className="flex flex-col gap-[6px]">
              <label
                htmlFor="phone"
                className="text-[16px] font-bold uppercase leading-[24px] text-black"
              >
                Phone Number
              </label>
              <div
                className={`flex h-[48px] rounded-[4px] border ${
                  fieldErrors.phone ? "border-[#d32f2f]" : "border-black"
                } bg-white`}
              >
                <select
                  aria-label="Phone country calling code"
                  aria-invalid={fieldErrors.phone ? true : undefined}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  value={values.personal_country_code}
                  onChange={(event) => {
                    const countryCode = event.target.value;
                    updateValue("personal_country_code", countryCode);
                    const countryName = countries.find(
                      ({ code }) => code === countryCode,
                    )?.name;
                    if (countryName) updateValue("country", countryName);
                  }}
                  className="w-[92px] shrink-0 border-r border-black bg-transparent px-2 text-[14px] outline-none"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.callingCode}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(000) 000-0000"
                  aria-invalid={fieldErrors.phone ? true : undefined}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  value={values.phone}
                  onChange={(event) => updateValue("phone", event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-[14px] text-[14px] outline-none placeholder:text-black/60"
                />
              </div>
              {fieldErrors.phone ? (
                <p id="phone-error" role="alert" className="text-[12px] leading-[18px] text-[#d32f2f]">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>

            <div>
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Enter password"
                error={fieldErrors.password}
                value={values.password}
                onChange={(event) =>
                  updateValue("password", event.target.value)
                }
                required
                minLength={8}
                suffix={renderPasswordToggle(showPassword, () =>
                  setShowPassword((visible) => !visible),
                )}
              />
              <p className="mt-1 text-[12px] leading-[18px] text-black/60">
                Use at least 8 characters, including uppercase and lowercase
                letters, a number, and a special character.
              </p>
            </div>

            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              autoComplete="new-password"
              placeholder="Confirm password"
              error={fieldErrors.confirm_password}
              value={values.confirm_password}
              onChange={(event) =>
                updateValue("confirm_password", event.target.value)
              }
              required
              suffix={renderPasswordToggle(showConfirmPassword, () =>
                setShowConfirmPassword((visible) => !visible),
              )}
              containerClassName="mb-[44px]"
            />
          </>
        ) : (
          <>
            <InputField
              label="Organiser Name"
              name="org_organiser_name"
              placeholder="Enter organiser name"
              error={fieldErrors.org_organiser_name}
              value={values.org_organiser_name}
              onChange={(event) =>
                updateValue("org_organiser_name", event.target.value)
              }
              required
            />

            <InputField
              label="Organisation Name"
              name="org_name"
              placeholder="Enter your organisation name"
              error={fieldErrors.org_name}
              value={values.org_name}
              onChange={(event) => updateValue("org_name", event.target.value)}
              required
            />

            <InputField
              label="Organisation Email"
              type="email"
              name="org_email"
              placeholder="Enter organisation email"
              error={fieldErrors.org_email}
              value={values.org_email}
              onChange={(event) => updateValue("org_email", event.target.value)}
              required
            />

            <SelectField
              label="Organisation Country"
              name="org_country"
              error={fieldErrors.org_country}
              value={values.org_country}
              onChange={(event) => {
                const countryName = event.target.value;
                updateValue("org_country", countryName);
                const countryCode = countries.find(
                  ({ name }) => name === countryName,
                )?.code;
                if (countryCode) updateValue("org_country_code", countryCode);
              }}
              options={countryOptions}
              placeholder="Select Country"
              required
            />

            <InputField
              label="Organisation Phone"
              type="tel"
              name="org_phone"
              inputMode="tel"
              placeholder="Enter organisation phone"
              error={fieldErrors.org_phone}
              prefix={
                <select
                  aria-label="Organisation phone country calling code"
                  value={values.org_country_code}
                  onChange={(event) => {
                    const countryCode = event.target.value;
                    updateValue("org_country_code", countryCode);
                    const countryName = countries.find(
                      ({ code }) => code === countryCode,
                    )?.name;
                    if (countryName) updateValue("org_country", countryName);
                  }}
                  className="h-full border-0 bg-transparent text-[14px] outline-none"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.callingCode}
                    </option>
                  ))}
                </select>
              }
              value={values.org_phone}
              onChange={(event) => updateValue("org_phone", event.target.value)}
            />

            <InputField
              label="City"
              name="org_city"
              placeholder="Enter city"
              error={fieldErrors.org_city}
              value={values.org_city}
              onChange={(event) => updateValue("org_city", event.target.value)}
              required
            />

            <InputField
              label="Address Line 1"
              name="org_address1"
              placeholder="Address Line 1"
              error={fieldErrors.org_address1}
              value={values.org_address1}
              onChange={(event) =>
                updateValue("org_address1", event.target.value)
              }
              required
            />

            <InputField
              label="Address Line 2"
              name="org_address2"
              placeholder="Address Line 2"
              error={fieldErrors.org_address2}
              value={values.org_address2}
              onChange={(event) =>
                updateValue("org_address2", event.target.value)
              }
              required
            />

            <InputField
              label="Postal Code"
              name="org_postal_code"
              autoComplete="postal-code"
              placeholder="Enter postal code"
              error={fieldErrors.org_postal_code}
              value={values.org_postal_code}
              onChange={(event) =>
                updateValue("org_postal_code", event.target.value)
              }
              required
            />

            <p className="text-[13px] leading-[20px] text-black/80 mt-[60px]">
              By completing your profile, you agree to our{" "}
              <span className="font-bold underline">Terms and Conditions</span>{" "}
              and <span className="font-bold underline">Privacy Policy</span>.
            </p>
          </>
        )}

        {formError ? (
          <p role="alert" className="text-[13px] leading-[18px] text-[#d32f2f]">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p
            role="status"
            className="text-[13px] leading-[18px] text-green-700"
          >
            {successMessage}
          </p>
        ) : null}

        <div className="flex gap-3">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setFieldErrors({});
                setStep(1);
              }}
              className="flex h-[52px] flex-1 cursor-pointer items-center justify-center rounded-[4px] border border-black bg-white text-[14px] font-normal uppercase leading-[24px] text-black transition hover:bg-black/5"
            >
              Back
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isLoading || Boolean(successMessage)}
            className="flex h-[52px] flex-1 cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-normal uppercase leading-[24px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Submitting..."
              : successMessage
                ? "Submitted"
                : step === 1
                  ? "Continue"
                  : "Submit"}
          </button>
        </div>
      </form>

      {isVerificationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <section
            aria-labelledby="verify-email-title"
            aria-modal="true"
            className="relative w-full max-w-[500px] rounded-[4px] bg-white p-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            role="dialog"
          >
            <button
              type="button"
              aria-label="Close verification dialog"
              onClick={() => {
                setIsVerificationOpen(false);
                setVerificationError("");
              }}
              className="cursor-pointer absolute right-[14px] top-[14px] flex h-[24px] w-[24px] items-center justify-center text-[20px] leading-none text-black/70 hover:text-black"
            >
              <IconCard name={CLOSE_ICON} className="h-6 w-6" />
            </button>

            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-[8px] bg-black text-white">
              <IconCard name={EMAIL_SENT_ICON} className="h-[22px] w-[22px]" />
            </div>

            <h2
              id="verify-email-title"
              className="mt-[30px] text-center text-[24px] font-bold uppercase leading-[38px] tracking-[0.02em] text-black"
            >
              VERIFY YOUR EMAIL
            </h2>

            <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black">
              We&apos;ve sent you a verification code to {values.email}
              <br />
              Enter it below to verify your email address.
            </p>

            <div className="mt-[22px] border-t border-[#E5E5E5] pt-[22px]">
              <div className="grid grid-cols-6 gap-[10px]">
                {otp.map((character, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    aria-label={`Verification code character ${index + 1}`}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    className="h-[54px] min-w-0 w-[54px] rounded-[4px] border border-[#B7B7B7] bg-white text-center text-[24px] font-normal uppercase leading-[44px] text-black outline-none focus:border-black"
                    maxLength={6}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    type="text"
                    value={character}
                  />
                ))}
              </div>
            </div>

            {verificationError ? (
              <p
                role="alert"
                className="mt-4 text-center text-[13px] text-[#d32f2f]"
              >
                {verificationError}
              </p>
            ) : null}
            {resendMessage ? (
              <p
                role="status"
                className="mt-4 text-center text-[13px] text-green-700"
              >
                {resendMessage}
              </p>
            ) : null}

            <p className="mt-[19px] text-center text-[16px] font-normal leading-[24px] text-black">
              Didn&apos;t get your code?{" "}
              <button
                type="button"
                className="cursor-pointer font-bold underline underline-offset-2"
                onClick={() => {
                  setVerificationError(
                    "Resend code is not configured yet. Please try registering again or contact support.",
                  );
                }}
              >
                Send a new code
              </button>
            </p>

            <div className="mt-[30px] flex items-start gap-[10px] rounded-[4px] border border-[#E5E5E5] bg-[#F4F4F4] px-[22px] py-[12px] text-left text-[13px] font-normal leading-[18px] text-black/80">
              <IconCard
                name={INFO_ICON}
                className="mt-[2px] h-4 w-4 shrink-0 text-[#7A7A7A]"
              />
              <span>
                The code expires in 10 minutes. If you don&apos;t see the email,
                check your spam folder or use the resend option above.
              </span>
            </div>

            <button
              type="button"
              className="mt-[28px] flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVerifying}
              onClick={handleVerifyEmail}
            >
              {isVerifying ? "Verifying..." : "Verify & continue"}
            </button>
          </section>
        </div>
      ) : null}
    </AuthPage>
  );
}
