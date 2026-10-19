import { useLoaderData, useRouteError } from "react-router";

import { TeamApi } from "~/features/team/api";
import { RankingEditPage } from "~/features/ranking/pages/RankingEditPage";
import type { Ranking } from "~/features/ranking/model/ranking";
import { createPageTitle } from "~/lib/page-title";
import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("得点編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { teamId?: string };
}) {
  const teamId = parsePositiveIntegerRouteParam(params.teamId);
  if (teamId === null) {
    throw new Response("チームが見つかりません。", { status: 404 });
  }

  const team = await TeamApi.getTeamById(teamId);
  // 順位はGET /ranking(一覧)からしか分からないが、このページでは
  // チーム名・現在の得点さえ分かれば十分なため取得しない。
  const ranking: Ranking = {
    rank: 0,
    teamId: team.id,
    teamName: team.name,
    score: team.score,
  };

  return { ranking };
}

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={() => closeModal()}
      title="得点情報を読み込めません"
    />
  );
}

export default function RankingEditRoute() {
  const { ranking } = useLoaderData<typeof clientLoader>();
  const closeModal = useManagementModalReturn();

  return (
    <RankingEditPage
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      ranking={ranking}
    />
  );
}
