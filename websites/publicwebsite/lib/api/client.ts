import { ApiError, type ApiEnvelope, type PaginatedResponse } from "@/types/api";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.backend.greencottagesandspa.in/api/v1"
).replace(/\/+$/, "");

export function getBackendOrigin(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

const DEFAULT_TIMEOUT_MS = 15000;

function firstError(errors: unknown): string | undefined {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }

    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & {
    next?: { revalidate?: number };
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
  const controller = new AbortController();
  const timeoutError = new DOMException(
    "The server took too long to respond. Please try again.",
    "AbortError",
  );
  const timeoutId = setTimeout(
    () => controller.abort(timeoutError),
    timeoutMs,
  );
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchInit,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(fetchInit.body ? { "Content-Type": "application/json" } : {}),
        ...fetchInit.headers,
      },
    });
  } catch (error) {
    if (
      controller.signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        504,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      firstError(payload?.errors) ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new ApiError(
        firstError(envelope.errors) || envelope.message || "Request failed.",
        response.status,
        envelope.errors,
      );
    }

    return envelope.data;
  }

  return payload as T;
}

export function extractList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.results;
}
