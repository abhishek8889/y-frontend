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
          <div className="auth-review">
            <div className="auth-review__icon" aria-hidden="true">
              i
            </div>

            <h1 className="auth-review__title">
              Hi {greetingName}, your account is under review
            </h1>

            <p className="auth-review__copy">
              Thanks for registering as an organiser on Yourlist. Our team is reviewing your account
              and the details you submitted. You&apos;ll be notified when it&apos;s approved — until
              then the organiser dashboard stays locked.
            </p>

            {user?.email ? (
              <p className="auth-review__email">
                We&apos;ll send updates to{" "}
                <span className="auth-review__email-value">{user.email}</span>
              </p>
            ) : null}

            <a
              href="mailto:support@yourlist.com"
              className="auth-secondary-button auth-review__support"
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
