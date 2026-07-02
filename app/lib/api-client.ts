import { env } from "~/config/env";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.backendBaseUrl}${path}`, init);
  if (!res.ok) {
    throw new Response(res.statusText, { status: res.status });
  }

  return (await res.json()) as T;
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
