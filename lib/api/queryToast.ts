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

function getBackendSuccessMessage(data: unknown) {
  if (typeof data !== "object" || data === null) return null;
  const message = (data as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : null;
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
      if (backendMessage) appToast.success(backendMessage);
    } else if (typeof success === "string" && success.trim()) {
      appToast.success(success);
    }

    if (warning?.trim()) {
      appToast.warning(warning);
    }

    return result;
  } catch (caught) {
    if (error === false) throw caught;

    if (typeof error === "string" && error.trim()) {
      appToast.error(error);
    } else {
      appToast.error(getApiErrorMessage(caught as never));
    }

    throw caught;
  }
}
