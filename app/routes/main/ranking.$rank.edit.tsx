import { useLoaderData } from "react-router";

import { getRanking } from "~/features/ranking/mock/ranking-store";
import { RankingEditPage } from "~/features/ranking/pages/RankingEditPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("得点編集") }];
}

export async function clientLoader({ params }: { params: { rank?: string } }) {
  const rank = Number(params.rank);
  const ranking = Number.isInteger(rank) ? getRanking(rank) : null;
  if (!ranking) throw new Response("Not Found", { status: 404 });
  return { ranking };
}

export default function RankingEditRoute() {
  const { ranking } = useLoaderData<typeof clientLoader>();
  return <RankingEditPage ranking={ranking} />;
}
