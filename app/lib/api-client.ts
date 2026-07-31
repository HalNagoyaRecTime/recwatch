import { buildBackendUrl } from "~/config/env";
import { ApiClientError } from "./api-client-error";

function requireBackendUrl(path: string) {
  const url = buildBackendUrl(path);

  if (!url) {
    throw new Error("VITE_BACKEND_BASE_URL is not configured.");
  }

  return url;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(requireBackendUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      "X-Client-Type": "web",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new ApiClientError(res.status, getApiErrorMessage(body, res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function getApiErrorMessage(body: unknown, status: number): string {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return `API request failed (${status})`;
  }

  let message = String(body.error);
  if (
    "details" in body &&
    typeof body.details === "object" &&
    body.details !== null &&
    "formErrors" in body.details &&
    Array.isArray(body.details.formErrors) &&
    body.details.formErrors.length > 0
  ) {
    message += `: ${body.details.formErrors.map(String).join(", ")}`;
  }

  return message;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: "POST", body }),
  delete: (path: string) =>
    request<void>(path, {
      method: "DELETE",
    }),
};
