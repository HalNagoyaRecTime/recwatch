import { redirect, useLoaderData } from "react-router";
import { Link } from "react-router";
import { buildBackendUrl } from "~/config/env";
import {
  getAccessToken,
  setAccessToken,
} from "~/features/auth/lib/accessTokenStore";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";
import { refreshAccessToken } from "~/features/auth/lib/refreshAccessToken";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";
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

  return `バックエンドから予期しない応答がありました(status: ${status})。時間をおいてもう一度お試しください。`;
}

export async function clientLoader(): Promise<FrameLoaderData> {
  const accessToken = getAccessToken() ?? (await refreshAccessToken());
  if (!accessToken) {
    throw redirect("/login?error=auth_failed");
  }

  const authMeUrl = buildBackendUrl("/api/v1/auth/me");
  if (!authMeUrl) {
    return {
      status: "backend_error",
      message:
        "バックエンド URL が未設定です。環境変数を確認してから、もう一度お試しください。",
    };
  }

  const fetchMe = (token: string) =>
    fetch(authMeUrl, {
      headers: {
        ...WEB_CLIENT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    }).catch((error: unknown) => {
      console.error("Failed to fetch /api/v1/auth/me", error);
      return null;
    });

  let res = await fetchMe(accessToken);

  if (res?.status === 401 || res?.status === 403) {
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      setAccessToken(null);
      setRefreshTokenId(null);
      throw redirect("/login?error=auth_failed");
    }
    res = await fetchMe(refreshedToken);
  }

  if (!res) {
    return {
      status: "backend_error",
      message:
        "バックエンドに接続できませんでした。APIサーバーが起動しているか確認してください。",
    };
  }

  if (res.status === 401 || res.status === 403) {
    setAccessToken(null);
    setRefreshTokenId(null);
    throw redirect("/login?error=auth_failed");
  }

  if (!res.ok) {
    return {
      status: "backend_error",
      message: getAuthErrorMessage(res.status),
    };
  }

  const payload: unknown = await res.json().catch((error: unknown) => {
    console.error("Failed to parse /api/v1/auth/me response", error);
    return null;
  });
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
        <Link
          to="/login"
          className="mt-5 inline-block text-sm font-medium text-(--brand-1) hover:underline"
        >
          ログインページへ戻る
        </Link>
      </section>
    </main>
  );
}
