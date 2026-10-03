import { useLoaderData } from "react-router";

import { TeamDetailPage } from "~/features/team/pages/TeamDetailPage";
import { TeamApi } from "~/features/team/api";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チーム詳細") }];
}

export async function clientLoader({ params }: { params: { id?: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    throw new Response("Not Found", { status: 404 });
  }

  const team = await TeamApi.getTeamById(id);
  return { team };
}

export default function TeamDetailRoute() {
  const { team } = useLoaderData<typeof clientLoader>();
  return <TeamDetailPage team={team} />;
}
