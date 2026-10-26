"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetAboutMeQuery } from "@/apis/auth/authApi";
import {
  getResumeStripeOnboardingUrl,
  getStripeOnboardingLink,
  useCreateStripeConnectAccountMutation,
  useResumeStripeOnboardingMutation,
} from "@/apis/organisation/stripeApi";
import { GridCard, type GridCardItem } from "@/components/common";
import {
  DashboardHeader,
  DashboardShell,
  DashboardSidebar,
  StripeConnectModal,
  type StripeConnectModalVariant,
} from "@/components/organiser";
import { AuthScope } from "@/lib/auth/scopes";
import {
  getStripeConnectRedirectKind,
  type StripeConnectRedirectKind,
} from "@/lib/stripe/connectUrls";
import { appToast } from "@/lib/ui/toast";

/** Dummy overview metrics until dashboard APIs ship. */
const DUMMY_OVERVIEW: GridCardItem[] = [
  {
    id: "revenue-month",
    label: "Revenue This Month",
    value: "$84,290",
    description: "12%  vs last month",
  },
  {
    id: "tickets-sold-today",
    label: "Tickets Sold Today",
    value: "1,247",
    description: "34 %  vs avg matchday",
  },
  {
    id: "upcoming-match-sales",
    label: "Upcoming Match Sales",
    value: "73%",
    description: "2,190 / 3,000 capacity",
  },
  {
    id: "active-members",
    label: "Active Members",
    value: "2,680",
    description: "8% Active Members",
  },
  {
    id: "refund-rate",
    label: "Refund Rate",
    value: "1.8%",
    description: "0.%  vs avg",
  },
];

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isOrgOwner(user: {
  scope?: string;
  roles?: string[];
} | null | undefined) {
  return (
    user?.scope === AuthScope.Organisation && Boolean(user?.roles?.includes("owner"))
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, isLoading, isFetching, refetch } = useGetAboutMeQuery();
  const user = data?.data?.user;
  const displayName = user?.first_name?.trim() || "there";

  const [createStripeAccount, { isLoading: isCreatingStripe }] =
    useCreateStripeConnectAccountMutation();
  const [resumeStripeOnboarding, { isLoading: isResumingStripe }] =
    useResumeStripeOnboardingMutation();

  const [stripeVariant, setStripeVariant] = useState<StripeConnectModalVariant>("connect");
  const [stripeRedirect, setStripeRedirect] = useState<StripeConnectRedirectKind>(null);

  const aboutMeReady = !isLoading && !isFetching;

  // Stripe AccountLink landed back on dashboard.
  useEffect(() => {
    const kind = getStripeConnectRedirectKind(searchParams);
    if (!kind) return;

    setStripeRedirect(kind);
    setStripeVariant(kind === "return" ? "success" : "failed");

    // Drop ?stripe=… so refresh doesn't re-open the same modal forever.
    router.replace(pathname, { scroll: false });

    if (kind === "return") {
      void refetch();
    }
  }, [searchParams, router, pathname, refetch]);

  // 1) No Connect account yet → create flow
  const needsStripeConnect =
    aboutMeReady &&
    isOrgOwner(user) &&
    user?.stripe_connect_account_created === false &&
    stripeRedirect !== "return";

  // 2) Account exists but onboarding not finished → resume flow
  const needsStripeOnboarding =
    aboutMeReady &&
    isOrgOwner(user) &&
    user?.stripe_connect_account_created === true &&
    user?.connect_onboarding_status !== "complete" &&
    stripeRedirect !== "return";

  const activeStripeGate = needsStripeConnect
    ? "connect"
    : needsStripeOnboarding
      ? "incomplete"
      : null;

  const displayVariant: StripeConnectModalVariant =
    stripeVariant === "success"
      ? "success"
      : stripeVariant === "failed"
        ? "failed"
        : activeStripeGate === "incomplete"
          ? "incomplete"
          : "connect";

  const showStripeModal =
    stripeVariant === "success" ||
    stripeVariant === "failed" ||
    Boolean(activeStripeGate);

  const overviewItems = useMemo<GridCardItem[]>(() => DUMMY_OVERVIEW, []);

  async function handleCreateStripeAccount() {
    try {
      const result = await createStripeAccount().unwrap();
      const onboardingLink = getStripeOnboardingLink(result);

      if (!onboardingLink) {
        setStripeVariant("failed");
        appToast.error(result.message || "No Stripe onboarding link was returned.");
        return;
      }

      window.location.assign(onboardingLink);
    } catch {
      setStripeVariant("failed");
    }
  }

  async function handleResumeStripeOnboarding() {
    try {
      const result = await resumeStripeOnboarding().unwrap();
      const onboardingLink = getResumeStripeOnboardingUrl(result);

      if (!onboardingLink) {
        setStripeVariant("failed");
        appToast.error(result.message || "No Stripe onboarding link was returned.");
        return;
      }

      window.location.assign(onboardingLink);
    } catch {
      setStripeVariant("failed");
    }
  }

  function handleStripePrimary() {
    if (displayVariant === "success") {
      setStripeVariant("connect");
      setStripeRedirect(null);
      void refetch();
      return;
    }

    if (displayVariant === "incomplete" || activeStripeGate === "incomplete") {
      void handleResumeStripeOnboarding();
      return;
    }

    // connect or failed → create / retry create (or resume if account already exists)
    if (user?.stripe_connect_account_created === true) {
      void handleResumeStripeOnboarding();
      return;
    }
    void handleCreateStripeAccount();
  }

  function handleStripeClose() {
    setStripeVariant(activeStripeGate === "incomplete" ? "incomplete" : "connect");
    setStripeRedirect(null);
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="organiser-dashboard__content px-5 pb-8 pt-6 md:px-6 md:pt-[22px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-[22px] leading-[24.2px] text-black">
              {greetingForNow()}, {displayName}
            </h1>
            <p className="mt-0 text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">
              FC Northgate · 2024/25 Season · Wednesday 28 May 2025
            </p>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-[4px] border border-black bg-white py-2.5 pl-1.5 pr-2.5 text-[14px] font-normal uppercase leading-[19.6px] text-black transition hover:bg-black hover:text-white"
          >
            <span aria-hidden className="text-[18px] leading-none">
              +
            </span>
            Create Match
          </button>
        </div>

        <div className="mt-6 md:mt-[26px]">
          <GridCard
            items={overviewItems}
            isLoading={isLoading && !data}
            className="organiser-dashboard__overview"
          />
        </div>
      </div>

      <StripeConnectModal
        open={showStripeModal}
        variant={displayVariant}
        isBusy={isCreatingStripe || isResumingStripe}
        onConnect={handleStripePrimary}
        onPrimary={handleStripePrimary}
        onClose={
          displayVariant === "failed" || displayVariant === "success"
            ? handleStripeClose
            : undefined
        }
      />
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
          <div className="p-6 text-[14px] text-black/60">Loading...</div>
        </DashboardShell>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
