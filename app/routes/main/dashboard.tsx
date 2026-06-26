import { useLoaderData } from "react-router";

import { buildBackendUrl } from "~/config/env";
import { AdminScreenPage } from "~/features/admin-pages/components/AdminScreenPage";
import { dashboardContent } from "~/features/admin-pages/model/dashboard-content";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/logout";

export function meta() {
  return [{ title: "Dashboard | recwatch" }];
}

type DashboardLoaderData =
  | {
      status: "ok";
      data: unknown;
    }
  | {
      status: "error";
      error: string;
    };

export async function clientLoader(): Promise<DashboardLoaderData> {
  const dashboardUrl = buildBackendUrl("/");
  if (!dashboardUrl) {
    return {
      status: "error",
      error:
        "バックエンド URL が未設定のため、ダッシュボードの接続確認をスキップしました。",
    };
  }

  const res = await fetch(dashboardUrl, {
    credentials: "include",
    headers: WEB_CLIENT_HEADERS,
  }).catch(() => null);

  if (!res) {
    return {
      status: "error",
      error:
        "バックエンドに接続できませんでした。APIサーバーが起動しているか確認してください。",
    };
  }

  if (!res.ok) {
    return {
      status: "error",
      error: `バックエンドの接続確認に失敗しました。(${res.status})`,
    };
  }

  const data: unknown = await res.json().catch(() => null);
  if (data === null) {
    return {
      status: "error",
      error: "バックエンドのレスポンスを JSON として読み取れませんでした。",
    };
  }

  return { status: "ok", data };
}

export default function DashboardRoute() {
  const result = useLoaderData<typeof clientLoader>();

  return (
    <div className="flex flex-col gap-[18px]">
      <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
      <AdminScreenPage {...dashboardContent} />
    </div>
  );
}
