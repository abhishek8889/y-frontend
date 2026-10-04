"use client";

import { useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

const countryOptions = [
  { value: "usa", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "india", label: "India" },
  { value: "australia", label: "Australia" },
];

const initialCode = ["", "", "", "", "", ""];

export default function SignupPage() {
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const renderPasswordToggle = (
    isVisible: boolean,
    onToggle: () => void,
  ) => (
    <button
      type="button"
      aria-label={isVisible ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="flex h-[20px] w-[20px] items-center justify-center text-black/70 transition hover:text-black"
    >
      <IconCard
        name={isVisible ? EYE_OFF_ICON : EYE_OPEN_ICON}
        className="h-4 w-4"
      />
    </button>
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsVerificationOpen(true);
  };

  const handleCodeChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...verificationCode];
    nextCode[index] = sanitizedValue;
    setVerificationCode(nextCode);

    if (sanitizedValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <AuthPage
        title="Create an account"
        subtitle="Let get start & enter your details to create your account"
        footer={
          <p className="text-center text-[16px] leading-[24px] text-black">
            Already registered? <a href="/login" className="font-bold uppercase">LOG IN</a>
          </p>
        }
      >
        <form className="space-y-[22px]" onSubmit={handleSubmit}>
          <div className="grid gap-[22px] sm:grid-cols-2">
            <InputField
              label="First Name"
              type="text"
              placeholder="Enter first name"
              name="firstName"
            />
            <InputField
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              name="lastName"
            />
          </div>

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            name="email"
            containerClassName="mb-[22px]"
          />

          <SelectField
            label="Country"
            name="country"
            defaultValue=""
            options={countryOptions}
            placeholder="Select Country"
          />

          <div className="flex flex-col gap-[6px]">
            <label className="text-[16px] font-bold uppercase leading-[24px] text-black">
              Phone Number
            </label>

            <div className="rounded-[4px] border border-black bg-white">
              <PhoneInput
                international
                defaultCountry="US"
                value={phone}
                onChange={(value) => setPhone(value ?? "")}
                placeholder="(000) 000-0000"
                className="phone-input h-[48px] w-full px-[14px]"
              />
            </div>
          </div>

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            name="password"
            containerClassName="mb-[22px]"
            suffix={renderPasswordToggle(showPassword, () => setShowPassword((value) => !value))}
          />

          <InputField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            name="confirmPassword"
            suffix={renderPasswordToggle(
              showConfirmPassword,
              () => setShowConfirmPassword((value) => !value),
            )}
          />

          <button
            type="submit"
            className="mt-[35px] rounded-[4px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-normal uppercase leading-[24px] text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </AuthPage>

      {isVerificationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-[500px] rounded-[4px] bg-white px-[32px] pb-[30px] pt-[28px] shadow-[0_35px_90px_rgba(0,0,0,0.28)]">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setIsVerificationOpen(false)}
              className="absolute cursor-pointer right-[18px] top-[18px] flex h-[28px] w-[28px] items-center justify-center bg-white"
            >
              <IconCard name={CLOSE_ICON} className="h-6 w-6" />
            </button>

            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center text-black">
              <IconCard name={EMAIL_SENT_ICON} className="h-[52px] w-[52px]" />
            </div>

            <h2 className="mt-[30px] text-center text-[24px] font-bold uppercase leading-[38px] text-black">
              Verify your email
            </h2>

            <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black/100">
              We&apos;ve sent you a verification code to user@gmail.com
              <br />
              Enter it below to verify your email address.
            </p>

            <div className="mt-[30px] border-t border-[#E5E5E5] pt-[27px]">
              <div className="grid grid-cols-6 gap-[10px]">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleCodeChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    className="h-[56px] rounded-[4px] border border-[#A9A9A9] bg-white text-center text-[30px] font-normal leading-[44px] text-black outline-none placeholder:text-black/30 focus:border-black"
                    aria-label={`Verification code digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <p className="mt-[20px] text-center text-[16px] font-normal leading-[24px] text-black">
              Didn&apos;t get your code? <button type="button" className="!font-bold underline underline-offset-2">Send a new code</button>
            </p>

            <div className="mt-[30px] flex items-start gap-[10px] rounded-[4px] bg-[#F5F5F5] px-[22px] py-[12px] text-left text-[14px] font-normal leading-[20px] text-black/100">
              <IconCard name={INFO_ICON} className="mt-[2px] h-4 w-4 shrink-0 text-[#949494]" />
              <span>
                The code expires in 10 minutes. If you don&apos;t see the email,
                check your spam folder or use the resend option above.
              </span>
            </div>

            <button
              type="button"
              className="mt-[30px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.02em] text-white"
            >
              Verify &amp; continue
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
