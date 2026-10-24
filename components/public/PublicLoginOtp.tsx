"use client";

import type { ClipboardEvent, KeyboardEvent } from "react";
import IconCard, { INFO_ICON } from "@/components/ui/IconCard";

const codeFieldClass =
  "h-[47px] w-full min-w-0 rounded-[3.52px] border-[1.17px] border-black/50 bg-white text-center text-[18px] leading-none text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/70";

type PublicLoginOtpProps = {
  titleId?: string;
  email: string;
  code: string[];
  editableIndex: number;
  inputRefs: { current: Array<HTMLInputElement | null> };
  onChange: (index: number, value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onResend: () => void;
  onVerify: () => void;
  isSending: boolean;
  isVerifying: boolean;
};

export function PublicLoginOtp({
  titleId,
  email,
  code,
  editableIndex,
  inputRefs,
  onChange,
  onPaste,
  onKeyDown,
  onResend,
  onVerify,
  isSending,
  isVerifying,
}: PublicLoginOtpProps) {
  const isBusy = isSending || isVerifying;

  return (
    <>
      <h2 id={titleId} className="text-center text-[18px] leading-[22px] text-black">
        Verify your email
      </h2>
      <p className="mt-3 text-center text-[14px] leading-5 text-black">
        We&apos;ve sent a verification code to {email.trim() || "your email"}. Enter it below to
        continue.
      </p>

      <div className="mt-6 grid grid-cols-6 gap-2">
        {code.map((digit, index) => {
          const isEditable = index === editableIndex;
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
              onChange={(event) => onChange(index, event.target.value)}
              onPaste={onPaste}
              onKeyDown={(event) => onKeyDown(index, event)}
              className={codeFieldClass}
              aria-label={`Verification code character ${index + 1}`}
            />
          );
        })}
      </div>

      <p className="mt-5 text-center text-[14px] leading-5 text-black">
        Didn&apos;t get your code?{" "}
        <button
          type="button"
          disabled={isBusy}
          onClick={onResend}
          className="font-body-bold cursor-pointer underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send a new code"}
        </button>
      </p>

      <div className="mt-6 flex items-start gap-2.5 rounded-[3.52px] bg-black/[0.04] px-4 py-3 text-left text-[14px] leading-5 text-black">
        <IconCard name={INFO_ICON} className="mt-0.5 h-4 w-4 shrink-0 text-black/45" />
        <span>
          The code expires in 10 minutes. If you don&apos;t see the email, check your spam folder or
          use the resend option above.
        </span>
      </div>

      <button
        type="button"
        disabled={isBusy}
        onClick={onVerify}
        className="font-heading mt-6 flex h-[47px] w-full cursor-pointer items-center justify-center rounded-[3.52px] bg-black text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isVerifying ? "Verifying..." : "Verify & continue"}
      </button>
    </>
  );
}
