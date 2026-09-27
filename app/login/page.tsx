"use client";

import { useRef, useState } from "react";

import { AuthPage } from "@/components/auth/AuthPage";
import IconCard, {
  CLOSE_ICON,
  EMAIL_SENT_ICON,
  EYE_OFF_ICON,
  EYE_OPEN_ICON,
  INFO_ICON,
  CHECK_CIRCLE_ICON,
} from "@/components/ui/IconCard";
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
                <IconCard
                  name={showPassword ? EYE_OFF_ICON : EYE_OPEN_ICON}
                  className="h-4 w-4"
                />
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
              <IconCard name={CLOSE_ICON} className="h-6 w-6" />
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
                <div className="mx-auto flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-black text-white">
                  <IconCard name={EMAIL_SENT_ICON} className="h-[22px] w-[22px]" />
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
                  <IconCard name={INFO_ICON} className="mt-[2px] h-4 w-4 shrink-0 text-[#7A7A7A]" />
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
                  <IconCard name={CLOSE_ICON} className="h-6 w-6" />
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
                <div className="mx-auto flex items-center justify-center text-black">
                  <IconCard name={CHECK_CIRCLE_ICON} className="h-[80px] w-[80px]" />
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
