import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/lib/api/errors";
import { appToast } from "@/lib/ui/toast";

type QueryToastOptions = {
  /**
   * Success toast.
   * - string → custom message
   * - true → use backend `message` when present
   */
  success?: string | true;
  /**
   * Error toast.
   * - omit / true → backend message (default)
   * - string → custom message
   * - false → no error toast (handle in the page)
   */
  error?: string | boolean;
  /** Optional warning after success */
  warning?: string;
};

type QueryResult = {
  data?: unknown;
};

/** RTK Query rejects `queryFulfilled` with `{ error, meta, isUnhandledError }`, not the API body. */
type QueryFulfilledRejection = {
  error: FetchBaseQueryError | SerializedError;
  isUnhandledError?: boolean;
  meta?: unknown;
};

function getBackendSuccessMessage(data: unknown) {
  if (typeof data !== "object" || data === null) return null;
  const message = (data as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : null;
}

function getRejectedApiError(caught: unknown): FetchBaseQueryError | SerializedError | undefined {
  if (typeof caught !== "object" || caught === null) return undefined;

  if ("error" in caught && typeof (caught as QueryFulfilledRejection).error === "object") {
    return (caught as QueryFulfilledRejection).error;
  }

  return caught as FetchBaseQueryError | SerializedError;
}

/** Defer toasts so they never setState on Toaster during another component's mount. */
function showToast(show: () => void) {
  queueMicrotask(show);
}

/**
 * Use inside RTK Query `onQueryStarted`:
 *
 * ```ts
 * async onQueryStarted(_, { queryFulfilled }) {
 *   await withQueryToast(queryFulfilled, {
 *     success: "Saved successfully",
 *     error: true, // backend message
 *     // error: "This is not working like this",
 *   });
 * }
 * ```
 */
export async function withQueryToast(
  queryFulfilled: Promise<QueryResult>,
  options: QueryToastOptions = {},
) {
  const { success, error = true, warning } = options;

  try {
    const result = await queryFulfilled;

    if (success === true) {
      const backendMessage = getBackendSuccessMessage(result.data);
      if (backendMessage) showToast(() => appToast.success(backendMessage));
    } else if (typeof success === "string" && success.trim()) {
      showToast(() => appToast.success(success));
    }

    if (warning?.trim()) {
      showToast(() => appToast.warning(warning));
    }

    return result;
  } catch (caught) {
    if (error === false) throw caught;

    if (typeof error === "string" && error.trim()) {
      showToast(() => appToast.error(error));
    } else {
      const message = getApiErrorMessage(getRejectedApiError(caught));
      showToast(() => appToast.error(message));
    }

    throw caught;
  }
}
