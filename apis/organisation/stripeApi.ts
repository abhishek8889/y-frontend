import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type StripeConnectAccount = {
  id?: number;
  organisation_id?: number;
  stripe_account_id?: string;
  account_type?: string;
  country?: string;
  default_currency?: string;
  onboarding_status?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
};

export type StripeOnboardingLink = {
  url: string;
  expires_at?: string;
};

export type CreateStripeConnectAccountResponse = {
  success?: boolean;
  message?: string;
  data?: {
    stripe_account?: StripeConnectAccount;
    onboarding_link?: StripeOnboardingLink | string;
  };
};

export type ResumeStripeOnboardingResponse = {
  success?: boolean;
  message?: string;
  data?: StripeOnboardingLink & {
    onboarding_link?: StripeOnboardingLink | string;
    url?: string;
  };
};

export const stripeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createStripeConnectAccount: build.mutation<CreateStripeConnectAccountResponse, void>({
      query: () => ({
        url: "organisation/stripe/account/create",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          error: true,
        });
      },
    }),
    resumeStripeOnboarding: build.mutation<ResumeStripeOnboardingResponse, void>({
      query: () => ({
        url: "organisation/stripe/account/onboarding-link",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          error: true,
        });
      },
    }),
  }),
});

export const {
  useCreateStripeConnectAccountMutation,
  useResumeStripeOnboardingMutation,
} = stripeApi;

function readOnboardingUrl(
  link: StripeOnboardingLink | string | undefined | null,
): string | null {
  if (!link) return null;
  if (typeof link === "string") {
    const trimmed = link.trim();
    return trimmed || null;
  }
  const url = link.url?.trim();
  return url || null;
}

/** Prefer `data.onboarding_link.url` from create-account response. */
export function getStripeOnboardingLink(
  result: CreateStripeConnectAccountResponse | undefined,
): string | null {
  return readOnboardingUrl(result?.data?.onboarding_link);
}

/** Prefer `data.url` from resume onboarding-link response. */
export function getResumeStripeOnboardingUrl(
  result: ResumeStripeOnboardingResponse | undefined,
): string | null {
  const fromDataUrl = result?.data?.url?.trim();
  if (fromDataUrl) return fromDataUrl;
  return readOnboardingUrl(result?.data?.onboarding_link);
}
