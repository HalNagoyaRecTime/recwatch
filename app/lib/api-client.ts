import { buildBackendUrl } from "~/config/env";

function requireBackendUrl(path: string) {
  const url = buildBackendUrl(path);

  if (!url) {
    throw new Error("VITE_BACKEND_BASE_URL is not configured.");
  }

  return url;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(requireBackendUrl(path), init);
  if (!res.ok) {
    throw new Response(res.statusText, { status: res.status });
  }

  return res.json() as Promise<T>;
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
};
