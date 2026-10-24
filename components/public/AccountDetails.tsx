"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/apis/auth/authApi";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useHasAuthToken } from "@/lib/public/useHasAuthToken";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export function AccountDetails() {
  const router = useRouter();
  const hasToken = useHasAuthToken();
  const { data, isLoading, isError, error } = useGetProfileQuery(undefined, { skip: !hasToken });
  const profile = data?.data;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  const phone = [profile?.country_code, profile?.phone].filter(Boolean).join(" ").trim();

  useEffect(() => {
    if (!hasToken) {
      router.replace(`/login?next=${encodeURIComponent("/account")}`);
    }
  }, [hasToken, router]);

  return (
    <section className="mx-auto w-full max-w-[720px] px-5 py-12 md:px-8">
      <h1 className="font-heading text-[24px] leading-[32px]">Account</h1>
      <p className="mt-3 text-[14px] font-normal leading-[22px] text-black/70">
        The details saved on your customer account.
      </p>

      {!hasToken || isLoading ? (
        <p role="status" className="mt-8 text-[14px] font-normal text-black/60">
          {hasToken ? "Loading account…" : "Redirecting to login…"}
        </p>
      ) : isError || !profile ? (
        <p role="alert" className="mt-8 text-[14px] font-normal text-[#b42318]">
          {getApiErrorMessage(
            error as FetchBaseQueryError | SerializedError | undefined,
            "Unable to load your account.",
          )}
        </p>
      ) : (
        <dl className="mt-8 divide-y divide-black/15 border-y border-black/20 text-[14px] font-normal">
          <Detail label="Name" value={name || "—"} />
          <Detail label="Email" value={profile.email} />
          <Detail label="Phone" value={phone} />
          <Detail label="Country" value={profile.country} />
          <Detail label="Status" value={profile.status} />
        </dl>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[12px] uppercase tracking-[0.06em] text-black/50">{label}</dt>
      <dd className="break-all">{value?.trim() || "—"}</dd>
    </div>
  );
}
