import { useLoaderData, useOutletContext } from "react-router";

import { buildBackendUrl } from "~/config/env";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";
import { extractPersonName } from "~/features/dashboard/model/extract-person-name";
import { DashboardPage } from "~/features/dashboard/pages/DashboardPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getAccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

export function meta() {
  return [{ title: "ダッシュボード | recwatch" }];
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
    signal: AbortSignal.timeout(1000),
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
  const user = useOutletContext<AccountUser | null | undefined>();
  const userName = extractPersonName(getAccountBtnData(user).name);

  return (
    <PageLayout>
      <PagePadding>
        <DashboardPage
          connectionError={result.status === "error" ? result.error : undefined}
          userName={userName}
        />
      </PagePadding>
    </PageLayout>
  );
}
