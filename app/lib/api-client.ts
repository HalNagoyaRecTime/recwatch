import { buildBackendUrl } from "~/config/env";
import { ApiClientError } from "./api-client-error";
import { getAccessToken } from "~/features/auth/lib/accessTokenStore";
import { refreshAccessToken } from "~/features/auth/lib/refreshAccessToken";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";

function requireBackendUrl(path: string) {
  const url = buildBackendUrl(path);

  if (!url) {
    throw new Error("VITE_BACKEND_BASE_URL is not configured.");
  }

  return url;
}

function fetchWithToken(
  url: string,
  init: RequestInit | undefined,
  token: string | null
) {
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...WEB_CLIENT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = requireBackendUrl(path);
  let res = await fetchWithToken(url, init, getAccessToken());

  if (res.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      res = await fetchWithToken(url, init, refreshedToken);
    }
  }

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const error = parseApiError(body, res.status);
    throw new ApiClientError(
      res.status,
      error.message,
      error.code,
      error.details
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();

function getRequest<T>(path: string): Promise<T> {
  const key = `${getAccessToken() ?? "anonymous"}:${path}`;
  const current = inFlightGetRequests.get(key);
  if (current) return current as Promise<T>;

  const pending = request<T>(path).finally(() => {
    if (inFlightGetRequests.get(key) === pending) {
      inFlightGetRequests.delete(key);
    }
  });
  inFlightGetRequests.set(key, pending);
  return pending;
}

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

function parseApiError(
  body: unknown,
  status: number
): { code: string; message: string; details?: unknown } {
  if (!isApiErrorBody(body)) {
    return {
      code: "UNKNOWN_API_ERROR",
      message: `API request failed (${status})`,
    };
  }

  return body.error;
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return false;
  }

  const error = body.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export const apiClient = {
  get: <T>(path: string) => getRequest<T>(path),
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
