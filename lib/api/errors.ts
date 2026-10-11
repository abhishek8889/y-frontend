import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ApiErrorBody = {
  message?: string;
  error?: string;
  data?: Record<string, string[]>;
};

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

function getErrorBody(error: FetchBaseQueryError): ApiErrorBody | null {
  if (typeof error.data !== "object" || error.data === null) return null;
  return error.data as ApiErrorBody;
}

function pickMessage(...candidates: unknown[]) {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return null;
}

export function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = "Something went wrong. Please try again.",
) {
  if (!error) return fallback;

  if (isFetchBaseQueryError(error)) {
    const body = getErrorBody(error);

    if (body?.message === "Validation errors" && body.data) {
      const firstKey = Object.keys(body.data)[0];
      const firstMessage = firstKey ? body.data[firstKey]?.[0] : undefined;
      if (firstMessage) return firstMessage;
    }

    const fromBody = pickMessage(body?.message, body?.error);
    if (fromBody) return fromBody;

    if (typeof error.data === "string" && error.data.trim()) {
      return error.data;
    }

    if ("error" in error && typeof error.error === "string" && error.error.trim()) {
      return error.error;
    }
  }

  if ("message" in error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
