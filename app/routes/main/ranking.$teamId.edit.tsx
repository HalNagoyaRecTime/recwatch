import { useLoaderData } from "react-router";

import { TeamApi } from "~/features/team/api";
import { RankingEditPage } from "~/features/ranking/pages/RankingEditPage";
import type { Ranking } from "~/features/ranking/model/ranking";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("得点編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { teamId?: string };
}) {
  const teamId = Number(params.teamId);
  if (!Number.isInteger(teamId)) {
    throw new Response("Not Found", { status: 404 });
  }

  const team = await TeamApi.getTeamById(teamId);
  // 順位はGET /ranking(一覧)からしか分からないが、このページでは
  // チーム名・現在の得点さえ分かれば十分なため取得しない。
  const ranking: Ranking = {
    rank: 0,
    teamId: team.id,
    teamName: team.name,
    score: team.scores,
  };

  return { ranking };
}

export default function RankingEditRoute() {
  const { ranking } = useLoaderData<typeof clientLoader>();
  return <RankingEditPage ranking={ranking} />;
}
