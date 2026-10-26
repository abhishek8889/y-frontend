"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  useLoginMutation,
  usePlatformLoginMutation,
  useSendPublicLoginOtpMutation,
  useVerifyPublicLoginOtpMutation,
} from "@/apis/auth/authApi";
import { AuthPage } from "@/components/auth/AuthPage";
import { PublicLoginForm } from "@/components/public/PublicLoginForm";
import { PublicLoginOtp } from "@/components/public/PublicLoginOtp";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import IconCard, {
  CLOSE_ICON,
  EMAIL_SENT_ICON,
  EYE_OFF_ICON,
  EYE_OPEN_ICON,
  INFO_ICON,
  CHECK_CIRCLE_ICON,
} from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";
import { resolvePostLoginUrl, setAuthSession } from "@/lib/api/authStorage";
import { isOrganisationPendingApproval } from "@/lib/auth/organisationApproval";
import { buildSurfaceUrl, getHostSurface, type AppSurface } from "@/lib/hosts";
import { AuthScope } from "@/lib/auth/scopes";
import { getUserScope } from "@/lib/auth/roles";
import { appToast } from "@/lib/ui/toast";
import type { AuthUser } from "@/lib/auth/session";

const initialCode = ["", "", "", "", "", ""];

export default function LoginPage() {
  const [hostSurface, setHostSurface] = useState<AppSurface>("public");
  const [organiserLoginHref, setOrganiserLoginHref] = useState("/login");

  useEffect(() => {
    setHostSurface(getHostSurface(window.location.host));
    setOrganiserLoginHref(buildSurfaceUrl("organiser", "/login", window.location.host));
  }, []);

  const [organisationLogin, { isLoading: isOrgLoading }] = useLoginMutation();
  const [platformLogin, { isLoading: isPlatformLoading }] = usePlatformLoginMutation();
  const [sendPublicOtp, { isLoading: isSendingOtp }] = useSendPublicLoginOtpMutation();
  const [verifyPublicOtp, { isLoading: isVerifyingOtp }] = useVerifyPublicLoginOtpMutation();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalState, setModalState] = useState<
    "reset" | "verify" | "create" | "success" | "public-otp" | null
  >(null);
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isPublicLogin = hostSurface === "public";
  const isPlatformLogin = hostSurface === "superadmin";
  const isPasswordLoading = isOrgLoading || isPlatformLoading;
  const isBusy = isPasswordLoading || isSendingOtp || isVerifyingOtp;

  const title = isPlatformLogin
    ? "Platform log in"
    : isPublicLogin
      ? "Log in"
      : "Log in";

  const subtitle = isPlatformLogin
    ? "Enter your platform credentials to access the admin dashboard"
    : isPublicLogin
      ? "Discover events, book tickets, and manage your bookings — all in one place."
      : "Enter your details to access your account";

  /** First empty slot, or last slot when the code is complete. */
  const editableOtpIndex = (() => {
    const firstEmpty = verificationCode.findIndex((digit) => !digit);
    return firstEmpty === -1 ? verificationCode.length - 1 : firstEmpty;
  })();

  function focusOtpIndex(index: number) {
    queueMicrotask(() => inputRefs.current[index]?.focus());
  }

  function handleCodeChange(index: number, value: string) {
    if (index !== editableOtpIndex) return;

    // Multi-char (e.g. autofill) — treat like paste into this slot onward.
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleaned.length > 1) {
      const nextCode = [...verificationCode];
      for (let i = 0; i < cleaned.length && index + i < nextCode.length; i += 1) {
        nextCode[index + i] = cleaned[i] ?? "";
      }
      setVerificationCode(nextCode);
      const nextFocus = Math.min(index + cleaned.length, nextCode.length - 1);
      focusOtpIndex(nextFocus);
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

  useEffect(() => {
    if (modalState !== "public-otp") return;
    focusOtpIndex(editableOtpIndex);
  }, [modalState, editableOtpIndex]);

  function completeLogin(token: string, user: AuthUser) {
    const expectedScope =
      hostSurface === "superadmin"
        ? AuthScope.Platform
        : hostSurface === "organiser"
          ? AuthScope.Organisation
          : null;

    const actualScope = getUserScope(user);

    // App/admin hosts only accept their native workspace scope.
    if (expectedScope && actualScope !== expectedScope) {
      appToast.error("This account cannot sign in on this dashboard.");
      return;
    }

    setAuthSession(token, user);

    // organisation/login: unapproved organisers stay signed in on under-review.
    if (isOrganisationPendingApproval(user)) {
      window.location.assign(
        buildSurfaceUrl("organiser", "/account-under-review", window.location.host),
      );
      return;
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    // Public OTP may return organisation/platform scope for multi-workspace users;
    // stay on the public site and let the account menu link to other hosts.
    window.location.assign(
      resolvePostLoginUrl(user, nextPath, window.location.host, {
        stayOnPublic: hostSurface === "public",
      }),
    );
  }

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      appToast.warning("Email and password are required.");
      return;
    }

    try {
      const result = isPlatformLogin
        ? await platformLogin({ email: trimmedEmail, password }).unwrap()
        : await organisationLogin({ email: trimmedEmail, password }).unwrap();

      const token = result.data?.access_token;
      const user = result.data?.user;

      if (!token || !user) {
        appToast.error("Login succeeded but no access token was returned.");
        return;
      }

      completeLogin(token, user);
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handlePublicSendOtp(event: FormEvent<HTMLFormElement>) {
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
      setModalState("public-otp");
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handlePublicVerifyOtp() {
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

      completeLogin(token, user);
    } catch {
      // Toast handled by withQueryToast.
    }
  }

  async function handleResendPublicOtp() {
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
    <>
      {isPublicLogin ? (
        <div className="public-site flex min-h-screen flex-col bg-white text-black">
          <PublicSiteHeader />
          <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
            <div className="w-full max-w-[436px]">
              <h1 className="text-center text-[18px] leading-[22px]">Login</h1>
              <p className="mt-3 text-center text-[14px] leading-5 text-black">{subtitle}</p>
              <PublicLoginForm
                email={email}
                phone={phone}
                countryCode={countryCode}
                onEmailChange={setEmail}
                onPhoneChange={setPhone}
                onCountryCodeChange={setCountryCode}
                onSubmit={(event) => void handlePublicSendOtp(event)}
                isSubmitting={isSendingOtp}
              />
              <p className="mt-8 text-center text-[14px] leading-5 text-black">
                Organiser?{" "}
                <a href={organiserLoginHref} className="font-heading">
                  Organiser log in
                </a>
              </p>
            </div>
          </main>
          <SiteFooter />
        </div>
      ) : (
      <AuthPage
        title={title}
        subtitle={subtitle}
        contentClassName="sm:!pt-[70px]"
        footer={
          isPlatformLogin ? null : (
            <p className="text-center text-[16px] leading-6 text-black">
              No account yet?{" "}
              <a href="/signup" className="font-heading text-[14px]">
                Sign up
              </a>
            </p>
          )
        }
      >
          <form className="flex flex-col gap-[22px]" onSubmit={handlePasswordLogin}>
            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="!px-5"
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="!px-5"
              suffix={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="flex h-5 w-5 items-center justify-center text-black/70 transition hover:text-black"
                >
                  <IconCard
                    name={showPassword ? EYE_OFF_ICON : EYE_OPEN_ICON}
                    className="h-4 w-4"
                  />
                </button>
              }
            />

            {!isPlatformLogin ? (
              <button
                type="button"
                onClick={() => setModalState("reset")}
                className="w-fit cursor-pointer text-left text-[16px] font-heading leading-6 text-black"
              >
                Forgot Password?
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isBusy}
              className="mt-1 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-normal uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPasswordLoading ? "Signing in..." : "Continue"}
            </button>
          </form>
      </AuthPage>
      )}

      {modalState === "public-otp" ? (
        <div className="public-site fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 text-black">
          <div className="relative w-full max-w-[500px] rounded-[4px] bg-white px-4 pb-8 pt-8 shadow-[0_35px_90px_rgba(0,0,0,0.28)] sm:px-8">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setModalState(null)}
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center bg-transparent text-black"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1 13 13M13 1 1 13" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>

            <PublicLoginOtp
              email={email}
              code={verificationCode}
              editableIndex={editableOtpIndex}
              inputRefs={inputRefs}
              onChange={handleCodeChange}
              onPaste={handleCodePaste}
              onKeyDown={handleKeyDown}
              onResend={() => void handleResendPublicOtp()}
              onVerify={() => void handlePublicVerifyOtp()}
              isSending={isSendingOtp}
              isVerifying={isVerifyingOtp}
            />
          </div>
        </div>
      ) : null}

      {modalState && modalState !== "public-otp" ? (
        <div className="auth-site fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-[500px] rounded-[4px] bg-white px-5 pb-[30px] pt-10 shadow-[0_35px_90px_rgba(0,0,0,0.28)] sm:px-10 sm:pt-7">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setModalState(null)}
              className="absolute right-5 top-5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border border-[#e5e5e5] bg-white"
            >
              <IconCard name={CLOSE_ICON} className="h-3.5 w-3.5" />
            </button>

            {modalState === "reset" ? (
              <>
                <h2 className="text-center text-[24px] font-bold uppercase leading-[38px] tracking-[0%] text-black">
                  Reset your password
                </h2>

                <p className="mt-[10px] text-center text-[16px] font-normal leading-[24px] text-black/100">
                  Enter your email address and we&apos;ll send you a verification code to reset your
                  password.
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
                  className="mt-[44px] flex h-[52px] w-full cursor-pointer items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
                >
                  Send Code
                </button>
              </>
            ) : null}

            {modalState === "verify" ? (
              <>
                <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-black text-white">
                  <IconCard name={EMAIL_SENT_ICON} className="h-8 w-8" />
                </div>

                <h2 className="font-heading mt-[30px] text-center text-[24px] leading-[38px] text-black">
                  Verify your email
                </h2>

                <p className="mt-2.5 text-center text-[16px] font-normal leading-6 text-black">
                  We&apos;ve sent you a verification code to user@gmail.com
                  <br />
                  Enter it below to verify your email address.
                </p>

                <div className="mt-[30px] border-t border-[#E5E5E5] pt-[27px]">
                  <div className="mx-auto grid max-w-[420px] grid-cols-6 gap-[10px] sm:gap-[18px]">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="text"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleCodeChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        className="aspect-square h-auto w-full max-h-[54px] border border-[#A9A9A9] bg-white text-center text-[24px] font-normal leading-[44px] text-black outline-none focus:border-black sm:text-[30px]"
                        aria-label={`Verification code character ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-center text-[16px] font-normal leading-6 text-black">
                  Didn&apos;t get your code?{" "}
                  <button type="button" className="font-heading cursor-pointer">
                    Send a new code
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
                  onClick={() => setModalState("create")}
                  className="mt-[30px] flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-normal uppercase tracking-[0.02em] text-white"
                >
                  Verify &amp; continue
                </button>
              </>
            ) : null}

            {modalState === "create" ? (
              <>
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
                  className="mt-[44px] flex h-[52px] w-full cursor-pointer items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white"
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
                  className="mt-[34px] flex h-[52px] w-full cursor-pointer items-center justify-center border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white"
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
