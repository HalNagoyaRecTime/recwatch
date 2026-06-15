import { env } from "~/config/env";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.backendBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    throw new Response(res.statusText, { status: res.status });
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
