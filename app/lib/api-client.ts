import { buildBackendUrl } from "~/config/env";

function requireBackendUrl(path: string) {
  const url = buildBackendUrl(path);

  if (!url) {
    throw new Error("VITE_BACKEND_BASE_URL is not configured.");
  }

  return url;
}

function performRequest(path: string, init?: RequestInit) {
  return fetch(requireBackendUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      "X-Client-Type": "web",
      ...init?.headers,
    },
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await performRequest(path, init);

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(getApiErrorMessage(body, res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Some endpoints return a meaningful JSON body on specific non-2xx statuses
// (e.g. 422 with per-row validation errors) instead of a generic error shape.
async function requestAllowingStatuses<T>(
  path: string,
  init: RequestInit | undefined,
  allowedStatuses: number[]
): Promise<{ status: number; data: T }> {
  const res = await performRequest(path, init);

  if (!res.ok && !allowedStatuses.includes(res.status)) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(getApiErrorMessage(body, res.status));
  }

  const data =
    res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  return { status: res.status, data };
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
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  postAllowingStatuses: <T>(
    path: string,
    body: unknown,
    allowedStatuses: number[]
  ) =>
    requestAllowingStatuses<T>(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      allowedStatuses
    ),
};
