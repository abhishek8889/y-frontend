"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  useSendPublicLoginOtpMutation,
  useVerifyPublicLoginOtpMutation,
} from "@/apis/auth/authApi";
import { setAuthSession } from "@/lib/api/authStorage";
import { appToast } from "@/lib/ui/toast";
import { PublicLoginForm } from "@/components/public/PublicLoginForm";
import { PublicLoginOtp } from "@/components/public/PublicLoginOtp";

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
  const [countryCode, setCountryCode] = useState("+1");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const onCloseRef = useRef(onClose);
  const titleId = "public-login-title";
  onCloseRef.current = onClose;

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
    const trimmedPhone = phone.replace(/\D/g, "");
    if (!trimmedEmail || !trimmedPhone) {
      appToast.warning("Email and phone are required.");
      return;
    }

    try {
      await sendPublicOtp({
        email: trimmedEmail,
        phone: trimmedPhone,
        country_code: countryCode,
      }).unwrap();
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
        phone: phone.replace(/\D/g, ""),
        country_code: countryCode,
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
        className="relative w-full max-w-[500px] rounded-[4px] bg-white px-4 pb-8 pt-8 shadow-[0_35px_90px_rgba(0,0,0,0.28)] sm:px-8"
      >
        <button
          type="button"
          aria-label="Close login"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center bg-transparent text-black"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1 1 13 13M13 1 1 13" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>

        {step === "details" ? (
          <>
            <h2 id={titleId} className="text-center text-[18px] leading-[22px] text-black">
              Login
            </h2>
            <p className="mt-3 text-center text-[14px] leading-5 text-black">
              Discover events, book tickets, and manage your bookings — all in one place.
            </p>
            <PublicLoginForm
              idPrefix="modal-login"
              email={email}
              phone={phone}
              countryCode={countryCode}
              onEmailChange={setEmail}
              onPhoneChange={setPhone}
              onCountryCodeChange={setCountryCode}
              onSubmit={(event) => void handleSendOtp(event)}
              isSubmitting={isSendingOtp}
            />
          </>
        ) : (
          <PublicLoginOtp
            titleId={titleId}
            email={email}
            code={verificationCode}
            editableIndex={editableOtpIndex}
            inputRefs={inputRefs}
            onChange={handleCodeChange}
            onPaste={handleCodePaste}
            onKeyDown={handleKeyDown}
            onResend={() => void handleResendOtp()}
            onVerify={() => void handleVerifyOtp()}
            isSending={isSendingOtp}
            isVerifying={isVerifyingOtp}
          />
        )}
      </div>
    </div>
  );
}
