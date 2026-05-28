import { redirect, useLoaderData } from "react-router";
import { env } from "~/config/env";
import { AppShell } from "~/features/frame/AppShell";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AuthMeResponse = {
  user: AccountUser;
};

type FrameLoaderData =
  | {
      status: "ok";
      user: AccountUser;
    }
  | {
      status: "backend_error";
      message: string;
    };

function isAuthMeResponse(value: unknown): value is AuthMeResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "user" in value;
}

function getAuthErrorMessage(status: number) {
  if (status >= 500) {
    return "バックエンドでエラーが発生しました。時間をおいてもう一度お試しください。";
  }

  return "バックエンドに接続できませんでした。APIサーバーが起動しているか確認してください。";
}

export async function clientLoader(): Promise<FrameLoaderData> {
  const res = await fetch(`${env.backendBaseUrl}/api/v1/auth/me`, {
    credentials: "include",
    headers: { "X-Client-Type": "web" },
  }).catch(() => null);

  if (!res) {
    return {
      status: "backend_error",
      message:
        "バックエンドに接続できませんでした。APIサーバーが起動しているか確認してください。",
    };
  }

  if (res.status === 401) {
    throw redirect("/login");
  }

  if (!res.ok) {
    return {
      status: "backend_error",
      message: getAuthErrorMessage(res.status),
    };
  }

  const payload: unknown = await res.json().catch(() => null);
  if (!isAuthMeResponse(payload)) {
    return {
      status: "backend_error",
      message: "バックエンドの認証レスポンスが不正です。",
    };
  }

  return {
    status: "ok",
    user: payload.user,
  };
}

export function HydrateFallback() {
  return null;
}

export default function FrameRoute() {
  const data = useLoaderData<typeof clientLoader>();

  if (data.status === "backend_error") {
    return <BackendErrorScreen message={data.message} />;
  }

  return <AppShell user={data.user} />;
}

function BackendErrorScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-(--border-1) bg-(--surface-1) p-6 shadow-(--shadow-soft)">
        <div className="font-['DM_Mono'] text-xs tracking-[0.18em] text-(--brand-2) uppercase">
          Backend unavailable
        </div>
        <h1 className="mt-3 text-2xl leading-tight font-semibold">
          バックエンドに接続できません
        </h1>
        <p className="mt-3 text-sm leading-7 text-(--text-2)">{message}</p>
      </section>
    </main>
  );
}
