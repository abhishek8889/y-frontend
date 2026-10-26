"use client";

import { useEffect } from "react";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthHero } from "@/components/auth/AuthHero";
import { getAuthUser, setAuthSession } from "@/lib/api/authStorage";
import { getAuthToken } from "@/lib/api/token";
import { isOrganisationApproved } from "@/lib/auth/organisationApproval";
import { getDisplayName, type AuthUser } from "@/lib/auth/session";

export default function AccountUnderReviewPage() {
  const { data, isLoading, isFetching } = useGetAboutMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const aboutUser = data?.data?.user;
  const cookieUser = getAuthUser();
  const user = aboutUser ?? cookieUser;

  const firstName = user?.first_name?.trim() || "";
  const displayName = getDisplayName(user) || "there";
  const greetingName = firstName || displayName;

  const isApproved =
    isOrganisationApproved(aboutUser) ||
    (!aboutUser && isOrganisationApproved(cookieUser));
  const stillChecking = (isLoading || isFetching) && !aboutUser;

  // Keep cookie in sync with about-me so proxy can send approved users to dashboard.
  useEffect(() => {
    if (!aboutUser) return;
    const token = getAuthToken();
    const current = getAuthUser();
    if (!token || !current) return;
    if (current.organisation_approve_status === aboutUser.organisation_approve_status) return;

    setAuthSession(token, {
      ...current,
      ...aboutUser,
      organisation_approve_status: aboutUser.organisation_approve_status,
    } as AuthUser);
  }, [aboutUser]);

  useEffect(() => {
    if (!isApproved) return;
    window.location.assign("/dashboard");
  }, [isApproved]);

  if (stillChecking || isApproved) return null;

  return (
    <main className="auth-site grid min-h-screen bg-white text-black lg:grid-cols-2">
      <section className="flex min-h-screen flex-col bg-white">
        <AuthHeader />

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10">
          <div className="flex w-full max-w-[551px] flex-col items-center text-center">
            <div
              aria-hidden="true"
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-[2.5px] border-black text-[28px] font-bold leading-none text-black"
            >
              i
            </div>

            <h1 className="font-heading mt-8 text-[22px] leading-8 text-black sm:text-[24px] sm:leading-[38px]">
              Hi {greetingName}, your account is under review
            </h1>

            <p className="mt-3 max-w-[540px] text-[15px] font-normal leading-[26px] text-black sm:text-[16px]">
              Thanks for registering as an organiser on Yourlist. Our team is reviewing your account
              and the details you submitted. You&apos;ll be notified when it&apos;s approved — until
              then the organiser dashboard stays locked.
            </p>

            {user?.email ? (
              <p className="mt-4 text-[14px] font-normal leading-5 text-black/65">
                We&apos;ll send updates to{" "}
                <span className="font-heading text-black">{user.email}</span>
              </p>
            ) : null}

            <a
              href="mailto:support@yourlist.com"
              className="mt-6 inline-flex h-10 items-center justify-center gap-[7px] rounded-[4px] border border-black bg-white px-2.5 text-[14px] font-normal leading-[19.6px] text-black transition hover:bg-black hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 12 12H4a1.5 1.5 0 0 1-1.5-1.5v-7Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M2.8 4.5 8 8.5l5.2-4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        <AuthHero />
      </div>
    </main>
  );
}
