import { redirect, useLoaderData } from "react-router";
import { buildBackendUrl } from "~/config/env";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAccountUser(value: unknown): value is AccountUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.display_name === "string" &&
    (value.avatar_url === undefined ||
      value.avatar_url === null ||
      typeof value.avatar_url === "string") &&
    (value.avatar_updated_at === undefined ||
      value.avatar_updated_at === null ||
      typeof value.avatar_updated_at === "string")
  );
}

function isAuthMeResponse(value: unknown): value is AuthMeResponse {
  if (!isRecord(value)) {
    return false;
  }

  return isAccountUser(value.user);
}

function getAuthErrorMessage(status: number) {
  if (status >= 500) {
    return "バックエンドでエラーが発生しました。時間をおいてもう一度お試しください。";
  }

  return "バックエンドに接続できませんでした。APIサーバーが起動しているか確認してください。";
}

export async function clientLoader(): Promise<FrameLoaderData> {
  const authMeUrl = buildBackendUrl("/api/v1/auth/me");
  if (!authMeUrl) {
    return {
      status: "backend_error",
      message:
        "バックエンド URL が未設定です。環境変数を確認してから、もう一度お試しください。",
    };
  }

  const res = await fetch(authMeUrl, {
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
