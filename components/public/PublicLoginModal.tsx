"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  useSendPublicLoginOtpMutation,
  useVerifyPublicLoginOtpMutation,
} from "@/apis/auth/authApi";
import { setAuthSession } from "@/lib/api/authStorage";
import { appToast } from "@/lib/ui/toast";
import IconCard, { CLOSE_ICON, EMAIL_SENT_ICON, INFO_ICON } from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";

const initialCode = ["", "", "", "", "", ""];

type PublicLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PublicLoginModal({ isOpen, onClose, onSuccess }: PublicLoginModalProps) {
  const [sendPublicOtp, { isLoading: isSendingOtp }] = useSendPublicLoginOtpMutation();
  const [verifyPublicOtp, { isLoading: isVerifyingOtp }] = useVerifyPublicLoginOtpMutation();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const onCloseRef = useRef(onClose);
  const titleId = "public-login-title";
  onCloseRef.current = onClose;

  const isBusy = isSendingOtp || isVerifyingOtp;
  const editableOtpIndex = (() => {
    const firstEmpty = verificationCode.findIndex((digit) => !digit);
    return firstEmpty === -1 ? verificationCode.length - 1 : firstEmpty;
  })();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== "otp") return;
    queueMicrotask(() => inputRefs.current[editableOtpIndex]?.focus());
  }, [isOpen, step, editableOtpIndex]);

  if (!isOpen) return null;

  function focusOtpIndex(index: number) {
    queueMicrotask(() => inputRefs.current[index]?.focus());
  }

  function handleCodeChange(index: number, value: string) {
    if (index !== editableOtpIndex) return;

    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
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

  function handleCodePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    if (!pasted) return;

    const nextCode = [...initialCode];
    for (let i = 0; i < pasted.length; i += 1) {
      nextCode[i] = pasted[i] ?? "";
    }
    setVerificationCode(nextCode);
    focusOtpIndex(Math.min(pasted.length, nextCode.length) - 1);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
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

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail || !trimmedPhone) {
      appToast.warning("Email and phone are required.");
      return;
    }

    try {
      await sendPublicOtp({ email: trimmedEmail, phone: trimmedPhone }).unwrap();
      setVerificationCode(initialCode);
      setStep("otp");
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handleVerifyOtp() {
    const otp = verificationCode.join("");
    if (otp.length !== 6) {
      appToast.warning("Enter the 6-character verification code.");
      return;
    }

    try {
      const result = await verifyPublicOtp({
        email: email.trim(),
        otp,
      }).unwrap();

      const token = result.data?.access_token;
      const user = result.data?.user;

      if (!token || !user) {
        appToast.error("Verification succeeded but no access token was returned.");
        return;
      }

      setAuthSession(token, user);
      onSuccess();
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handleResendOtp() {
    try {
      await sendPublicOtp({
        email: email.trim(),
        phone: phone.trim(),
      }).unwrap();
      setVerificationCode(initialCode);
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <button
        type="button"
        aria-label="Close login"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[500px] rounded-[4px] bg-white px-[32px] pb-[30px] pt-[28px] shadow-[0_35px_90px_rgba(0,0,0,0.28)]"
      >
        <button
          type="button"
          aria-label="Close login"
          onClick={onClose}
          className="absolute right-[18px] top-[18px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center bg-white"
        >
          <IconCard name={CLOSE_ICON} className="h-6 w-6" />
        </button>

        {step === "details" ? (
          <>
            <h2 id={titleId} className="font-heading text-center text-[24px] leading-[32px] text-black">
              Log in
            </h2>
            <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black">
              Enter your email and phone to receive a login code. Your selected tickets stay on this
              page.
            </p>
            <form className="mt-[28px] space-y-[22px]" onSubmit={(event) => void handleSendOtp(event)}>
              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                name="login-email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <InputField
                label="Phone"
                type="tel"
                placeholder="Enter your phone number"
                name="login-phone"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isBusy}
                className="mt-[22px] flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingOtp ? "Sending code..." : "Send login code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center text-black">
              <IconCard name={EMAIL_SENT_ICON} className="h-[52px] w-[52px]" />
            </div>
            <h2 id={titleId} className="font-heading mt-[30px] text-center text-[24px] leading-[32px] text-black">
              Verify your email
            </h2>
            <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black">
              We&apos;ve sent you a verification code to {email.trim() || "your email"}
              <br />
              Enter it below to verify your email address.
            </p>
            <div className="mt-[30px] border-t border-[#E5E5E5] pt-[27px]">
              <div className="grid grid-cols-6 gap-[10px]">
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
                      disabled={!isEditable}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      onPaste={handleCodePaste}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      className="h-[56px] rounded-[4px] border border-[#A9A9A9] bg-white text-center text-[30px] font-normal leading-[44px] text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-black/70"
                      aria-label={`Verification code character ${index + 1}`}
                    />
                  );
                })}
              </div>
            </div>
            <p className="mt-[20px] text-center text-[16px] font-normal leading-[24px] text-black">
              Didn&apos;t get your code?{" "}
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleResendOtp()}
                className="cursor-pointer font-bold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send a new code
              </button>
            </p>
            <div className="mt-[30px] flex items-start gap-[10px] rounded-[4px] bg-[#F5F5F5] px-[22px] py-[12px] text-left text-[14px] font-normal leading-[20px] text-black">
              <IconCard name={INFO_ICON} className="mt-[2px] h-4 w-4 shrink-0 text-[#949494]" />
              <span>
                The code expires in 10 minutes. If you don&apos;t see the email, check your spam
                folder or use the resend option above.
              </span>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleVerifyOtp()}
              className="mt-[30px] flex h-[52px] w-full cursor-pointer items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.02em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifyingOtp ? "Verifying..." : "Verify & continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
