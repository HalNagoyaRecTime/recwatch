import { redirect, useLoaderData } from "react-router";
import { env } from "~/config/env";
import { AppShell } from "~/features/frame/AppShell";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AuthMeResponse = {
  user: AccountUser;
};

function isAuthMeResponse(value: unknown): value is AuthMeResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "user" in value;
}

export async function clientLoader() {
  const res = await fetch(`${env.backendBaseUrl}/api/v1/auth/me`, {
    credentials: "include",
    headers: { "X-Client-Type": "web" },
  }).catch(() => null);

  if (!res?.ok) {
    throw redirect("/login");
  }

  const payload: unknown = await res.json();
  if (!isAuthMeResponse(payload)) {
    throw redirect("/login");
  }

  return payload;
}

export function HydrateFallback() {
  return null;
}

export default function FrameRoute() {
  const data = useLoaderData<typeof clientLoader>();

  return <AppShell user={data.user} />;
}
