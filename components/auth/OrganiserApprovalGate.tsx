"use client";

import { useEffect } from "react";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import { getAuthUser, setAuthSession } from "@/lib/api/authStorage";
import { getAuthToken } from "@/lib/api/token";
import { isOrganisationPendingApproval } from "@/lib/auth/organisationApproval";
import type { AuthUser } from "@/lib/auth/session";

/**
 * Keeps unapproved organisers on the under-review screen using live about-me status.
 * Does not clear the session.
 */
export function OrganiserApprovalGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useGetAboutMeQuery();
  const user = data?.data?.user;
  const isPendingApproval = Boolean(user && isOrganisationPendingApproval(user));

  // Keep the auth cookie in sync so proxy.ts can enforce the same gate.
  useEffect(() => {
    if (!user) return;
    const token = getAuthToken();
    const current = getAuthUser();
    if (!token || !current) return;
    if (current.organisation_approve_status === user.organisation_approve_status) return;

    setAuthSession(token, {
      ...current,
      ...user,
      organisation_approve_status: user.organisation_approve_status,
    } as AuthUser);
  }, [user]);

  useEffect(() => {
    if (!isPendingApproval) return;
    if (window.location.pathname.startsWith("/account-under-review")) return;
    window.location.assign("/account-under-review");
  }, [isPendingApproval]);

  // Wait for first about-me result before rendering organiser UI when we have no answer yet.
  if (isLoading && !user && !isError) {
    return null;
  }

  if (isPendingApproval) return null;

  return <>{children}</>;
}
