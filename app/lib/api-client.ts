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
    ...init,
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiClientError(res.status, await readErrorMessage(res));
  }

  return res.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;

  return typeof body?.error === "string" ? body.error : response.statusText;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
