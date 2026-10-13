import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  data?: unknown;
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

function isHtmlResponse(value: string) {
  return /^\s*<!doctype html|^\s*<html[\s>]/i.test(value);
}

function getValidationMessage(data: unknown) {
  if (typeof data !== "object" || data === null) return null;

  for (const messages of Object.values(data)) {
    if (Array.isArray(messages)) {
      const message = pickMessage(...messages);
      if (message) return message;
    } else if (typeof messages === "string" && messages.trim()) {
      return messages;
    }
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
    const bodyMessage = pickMessage(body?.message, body?.error);
    const rawData = typeof error.data === "string" ? error.data : null;
    const transportError =
      "error" in error && typeof error.error === "string"
        ? error.error
        : null;

    if (
      (bodyMessage && isHtmlResponse(bodyMessage)) ||
      (rawData && isHtmlResponse(rawData)) ||
      (transportError && isHtmlResponse(transportError))
    ) {
      return "The server returned a web page instead of an API response. Check the API base URL and verification endpoint.";
    }

    if (body?.message === "Validation errors") {
      const validationMessage = getValidationMessage(body.data);
      if (validationMessage) return validationMessage;
    }

    if (bodyMessage) return bodyMessage;
    if (rawData?.trim()) return rawData;
    if (transportError?.trim()) return transportError;
  }

  if ("message" in error && typeof error.message === "string" && error.message.trim()) {
    if (isHtmlResponse(error.message)) {
      return "The server returned a web page instead of an API response. Check the API base URL and verification endpoint.";
    }
    return error.message;
  }

  return fallback;
}
