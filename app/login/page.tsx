"use client";

import { useRef, useState } from "react";

import { AuthPage } from "@/components/auth/AuthPage";
import { InputField } from "@/components/ui/InputField";

const initialCode = ["", "", "", "", "", ""];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [modalState, setModalState] = useState<
    "reset" | "verify" | "create" | "success" | null
  >(null);
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
        title="LOG IN"
        subtitle="Enter your details to access your account"
        footer={
          <p className="text-center text-[16px] leading-[24px] text-black">
            No account yet? <a href="/signup" className="font-bold uppercase">SIGN UP</a>
          </p>
        }
      >
        <form className="space-y-[22px]" onSubmit={(event) => event.preventDefault()}>
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            name="email"
            containerClassName="mb-[22px]"
          />

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            name="password"
            suffix={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="flex h-[20px] w-[20px] items-center justify-center text-black/70 transition hover:text-black"
              >
                {showPassword ? (
                  <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3599 9.58956C15.0609 8.07156 16.0009 6.35156 16.0009 6.35156C16.0009 6.35156 13.0009 0.851562 8.00094 0.851562C7.04045 0.854074 6.09075 1.05423 5.21094 1.43956L5.98094 2.21056C6.62867 1.97581 7.31199 1.85437 8.00094 1.85156C10.1209 1.85156 11.8799 3.01956 13.1689 4.30856C13.79 4.93164 14.3462 5.61615 14.8289 6.35156C14.7716 6.43823 14.7066 6.53423 14.6339 6.63956C14.2989 7.11956 13.8039 7.75956 13.1689 8.39456C13.0043 8.5599 12.8319 8.7219 12.6519 8.88056L13.3599 9.58956Z" fill="black"/>
                  <path d="M11.2993 7.52987C11.5225 6.90571 11.5638 6.23102 11.4185 5.58429C11.2732 4.93756 10.9472 4.3454 10.4785 3.87669C10.0098 3.40798 9.41761 3.08201 8.77089 2.9367C8.12416 2.79139 7.44947 2.83272 6.82531 3.05587L7.64831 3.87887C8.03262 3.82386 8.42446 3.85911 8.79278 3.98183C9.1611 4.10455 9.49578 4.31136 9.7703 4.58588C10.0448 4.8604 10.2516 5.19508 10.3743 5.5634C10.4971 5.93172 10.5323 6.32356 10.4773 6.70787L11.2993 7.52987ZM8.35631 8.82887L9.17831 9.65087C8.55415 9.87402 7.87945 9.91535 7.23273 9.77004C6.586 9.62473 5.99383 9.29876 5.52513 8.83005C5.05642 8.36134 4.73045 7.76918 4.58514 7.12245C4.43983 6.47572 4.48115 5.80103 4.70431 5.17687L5.52731 5.99987C5.4723 6.38418 5.50755 6.77602 5.63027 7.14434C5.75299 7.51266 5.9598 7.84734 6.23432 8.12186C6.50884 8.39638 6.84352 8.60319 7.21184 8.72591C7.58016 8.84863 7.972 8.88388 8.35631 8.82887Z" fill="black"/>
                  <path d="M3.35 3.824C3.17 3.984 2.99733 4.14633 2.832 4.311C2.21097 4.93408 1.65478 5.61859 1.172 6.354L1.367 6.642C1.702 7.122 2.197 7.762 2.832 8.397C4.121 9.686 5.881 10.854 8 10.854C8.716 10.854 9.39 10.721 10.02 10.494L10.79 11.266C9.91019 11.6513 8.96049 11.8515 8 11.854C3 11.854 0 6.354 0 6.354C0 6.354 0.939 4.633 2.641 3.116L3.349 3.825L3.35 3.824ZM13.646 12.708L1.646 0.708L2.354 0L14.354 12L13.646 12.708Z" fill="black"/>
                  </svg>
                ) : (
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 5.5C16 5.5 13 0 8 0C3 0 0 5.5 0 5.5C0 5.5 3 11 8 11C13 11 16 5.5 16 5.5ZM1.173 5.5C1.65578 4.76459 2.21197 4.08008 2.833 3.457C4.12 2.168 5.88 1 8 1C10.12 1 11.879 2.168 13.168 3.457C13.789 4.08008 14.3452 4.76459 14.828 5.5C14.7707 5.58667 14.7057 5.68267 14.633 5.788C14.298 6.268 13.803 6.908 13.168 7.543C11.879 8.832 10.119 10 8 10C5.881 10 4.121 8.832 2.832 7.543C2.21097 6.91992 1.65578 6.23541 1.173 5.5Z" fill="black"/>
                  <path d="M8 3C7.33696 3 6.70107 3.26339 6.23223 3.73223C5.76339 4.20107 5.5 4.83696 5.5 5.5C5.5 6.16304 5.76339 6.79893 6.23223 7.26777C6.70107 7.73661 7.33696 8 8 8C8.66304 8 9.29893 7.73661 9.76777 7.26777C10.2366 6.79893 10.5 6.16304 10.5 5.5C10.5 4.83696 10.2366 4.20107 9.76777 3.73223C9.29893 3.26339 8.66304 3 8 3ZM4.5 5.5C4.5 4.57174 4.86875 3.6815 5.52513 3.02513C6.1815 2.36875 7.07174 2 8 2C8.92826 2 9.8185 2.36875 10.4749 3.02513C11.1313 3.6815 11.5 4.57174 11.5 5.5C11.5 6.42826 11.1313 7.3185 10.4749 7.97487C9.8185 8.63125 8.92826 9 8 9C7.07174 9 6.1815 8.63125 5.52513 7.97487C4.86875 7.3185 4.5 6.42826 4.5 5.5Z" fill="black"/>
                  </svg>
                )}
              </button>
            }
          />

          <div className="pt-[12px] pb-[40px] mb-0">
            <button
              type="button"
              onClick={() => setModalState("reset")}
              className="text-left text-[16px] cursor-pointer font-bold leading-[24px] text-black underline-offset-2 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="rounded-[4px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </AuthPage>

      {modalState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="relative w-full max-w-[500px] rounded-[4px] bg-white p-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setModalState(null)}
              className="absolute right-[14px] top-[14px] flex h-[24px] w-[24px] items-center justify-center text-[20px] leading-none text-black/70 hover:text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="23" height="23" rx="4.5" stroke="#E5E5E5" />
                <path d="M16 8L8 16" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8L16 16" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {modalState === "reset" ? (
              <>
                <h2 className="text-center font-[Univers] text-[24px] font-bold uppercase leading-[38px] tracking-[0%] text-black" style={{ fontFamily: 'Univers, sans-serif', fontStyle: 'normal' }}>
                  Reset your password
                </h2>

                <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black/100">
                  Enter your email address and we&apos;ll send you a verification code to reset your password.
                </p>

                <div className="mt-[37px]">
                  <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.08em] text-black">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-[44px] w-full rounded-[4px] border border-black bg-white px-[12px] text-[14px] text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setModalState("verify")}
                  className="mt-[44px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
                >
                  Send Code
                </button>
              </>
            ) : null}

            {modalState === "verify" ? (
              <>
                <div className="mx-auto flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-black">
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 5.5C3 4.4 3.9 3.5 5 3.5H17C18.1 3.5 19 4.4 19 5.5V12.5C19 13.6 18.1 14.5 17 14.5H5C3.9 14.5 3 13.6 3 12.5V5.5Z" fill="white"/>
                    <path d="M4 5L11 10L18 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="mt-[30px] text-center text-[24px] font-bold uppercase leading-[38px] tracking-[0.02em] text-black">
                  Verify your email
                </h2>

                <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black/100">
                  We&apos;ve sent you a verification code to user@gmail.com
                  <br />
                  Enter it below to verify your email address.
                </p>

                <div className="mt-[22px] border-t border-[#E5E5E5] pt-[22px]">
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
                        className="h-[54px] w-[54px] rounded-[4px] border border-[#B7B7B7] bg-white text-center text-[24px] font-normal leading-[44px] text-black outline-none focus:border-black"
                        aria-label={`Verification code digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-[19px] text-center text-[16px] font-normal leading-[24px] text-black">
                  Didn&apos;t get your code? <button type="button" className="font-bold underline underline-offset-2">Send a new code</button>
                </p>

                <div className="mt-[30px] flex items-start gap-[10px] rounded-[4px] bg-[#F4F4F4] px-[22px] py-[12px] text-left text-[13px] font-normal leading-[18px] border border-[#E5E5E5] text-black/80">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-[2px] shrink-0" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" stroke="#7A7A7A" strokeWidth="1.2"/>
                    <path d="M8 11.75V7.5" stroke="#7A7A7A" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="8" cy="5" r="0.8" fill="#7A7A7A"/>
                  </svg>
                  <span>
                    The code expires in 10 minutes. If you don&apos;t see the email,
                    check your spam folder or use the resend option above.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState("create")}
                  className="mt-[28px] cursor-pointer flex h-[52px] w-full items-center rounded-[4px] justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white"
                >
                  Verify &amp; continue
                </button>
              </>
            ) : null}

            {modalState === "create" ? (
              <>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setModalState(null)}
                  className="absolute right-[14px] top-[14px] flex h-[24px] w-[24px] items-center justify-center text-[20px] leading-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="23" height="23" rx="4.5" stroke="#E5E5E5" />
                <path d="M16 8L8 16" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8L16 16" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
                </button>

                <h2 className="text-center text-[24px] font-bold uppercase leading-[38px] tracking-[0.02em] text-black">
                  Create new password
                </h2>

                <div className="mt-[37px] space-y-[18px]">
                  <div>
                    <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.08em] text-black">
                      New Password
                    </label>
                    <div className="flex h-[44px] items-center rounded-[4px] border border-black bg-white px-[12px]">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="h-full w-full bg-transparent text-[14px] text-black placeholder:text-black/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.08em] text-black">
                      Confirm Password
                    </label>
                    <div className="flex h-[44px] items-center rounded-[4px] border border-black bg-white px-[12px]">
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="h-full w-full bg-transparent text-[14px] text-black placeholder:text-black/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalState("success")}
                  className="mt-[44px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white"
                >
                  Reset Password
                </button>
              </>
            ) : null}

            {modalState === "success" ? (
              <>
                <div className="mx-auto items-center flex justify-center">
                  <svg width="80px" height="80px" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><g data-name="Layer 2"><g data-name="checkmark-circle"><path width="24" height="24" opacity="0" d="M0 0H80V80H0V0z"/><path d="M32.367 37.633a3.333 3.333 0 0 0 -4.733 4.733l10 10A3.333 3.333 0 0 0 40 53.333a3.333 3.333 0 0 0 2.4 -1.133l23.333 -26.667a3.333 3.333 0 0 0 -5 -4.4L40 45.133z"/><path d="M70 36.667a3.333 3.333 0 0 0 -3.333 3.333 26.667 26.667 0 0 1 -26.667 26.667A26.667 26.667 0 0 1 21.1 21.2 26.433 26.433 0 0 1 40 13.333a29.333 29.333 0 0 1 6.333 0.733 3.333 3.333 0 1 0 1.567 -6.467A35 35 0 0 0 40 6.667a33.333 33.333 0 0 0 -23.333 56.967A33.1 33.1 0 0 0 40 73.333a33.333 33.333 0 0 0 33.333 -33.333 3.333 3.333 0 0 0 -3.333 -3.333"/></g></g></svg>
                </div>

                <h2 className="mt-[30px] text-center text-[24px] font-bold uppercase leading-[38px] tracking-[0.02em] text-black">
                  Password updated
                </h2>

                <p className="mt-[5px] text-center text-[16px] font-normal leading-[24px] text-black/80">
                  Your password has been successfully updated.
                </p>

                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="mt-[34px] cursor-pointer flex h-[52px] w-full items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white"
                >
                  Log in
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
